import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)

    // Fetch or auto-create profile row for user
    const ensureProfile = async (authUser) => {
        if (!authUser) {
            setProfile(null)
            return
        }

        try {
            // Try to fetch existing profile
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, email, avatar_url, bio, location, role, company, skills')
                .eq('id', authUser.id)
                .maybeSingle()

            if (data) {
                setProfile(data)
                return
            }

            // No profile found — auto-create one
            const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || ''
            const avatarUrl = authUser.user_metadata?.avatar_url || ''

            const { data: newProfile, error: insertErr } = await supabase
                .from('profiles')
                .insert({
                    id: authUser.id,
                    email: authUser.email || '',
                    name: fullName,
                    avatar_url: avatarUrl,
                    bio: '',
                    location: '',
                    skills: [],
                })
                .select('id, name, email, avatar_url, bio, location, role, company, skills')
                .single()

            if (insertErr) {
                console.error('Profile auto-create failed:', insertErr.message)
                // Still set a basic profile from auth data
                setProfile({
                    id: authUser.id,
                    name: fullName,
                    email: authUser.email,
                    avatar_url: avatarUrl,
                })
            } else {
                setProfile(newProfile)
            }
        } catch (err) {
            console.error('Profile fetch error:', err)
        }
    }

    useEffect(() => {
        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession()
                setSession(currentSession)
                setUser(currentSession?.user || null)
                await ensureProfile(currentSession?.user || null)
            } catch (err) {
                console.error('Auth init error:', err)
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession)
                setUser(newSession?.user || null)

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    await ensureProfile(newSession?.user || null)
                } else if (event === 'SIGNED_OUT') {
                    setProfile(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Sign out via Supabase client + optionally notify backend
    const signOut = async () => {
        try {
            // Try to notify backend to invalidate server-side
            if (session?.access_token) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
                    await fetch(`${API_URL}/api/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json',
                        },
                    })
                } catch (_) {
                    // Backend logout is best-effort
                }
            }
            // Always sign out client-side
            await supabase.auth.signOut()
        } catch (err) {
            console.error('Sign out error:', err)
            // Force client-side cleanup even if API fails
            await supabase.auth.signOut()
        }
    }

    // Get current access token for backend API calls
    const getAccessToken = async () => {
        const { data: { session: s } } = await supabase.auth.getSession()
        return s?.access_token || null
    }

    // Force re-fetch profile from DB (e.g. after an update)
    const refreshProfile = async () => {
        if (!user) return
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, name, email, avatar_url, bio, location, role, company, skills')
                .eq('id', user.id)
                .maybeSingle()
            if (data) setProfile(data)
        } catch (err) {
            console.error('Profile refresh error:', err)
        }
    }

    const value = {
        user,
        session,
        profile,
        loading,
        signOut,
        getAccessToken,
        refreshProfile,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
