import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)

    // Prevent duplicate profile fetches (React StrictMode)
    const profileFetchRef = useRef(null)

    // Fetch or auto-create profile row for user
    const ensureProfile = useCallback(async (authUser) => {
        if (!authUser) {
            setProfile(null)
            profileFetchRef.current = null
            return
        }

        // Deduplicate: skip if already fetching for this user
        if (profileFetchRef.current === authUser.id) return
        profileFetchRef.current = authUser.id

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

            // No profile found — auto-create one (handle_new_user trigger may not have fired yet)
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
            profileFetchRef.current = null // Reset on error to allow retry
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession()
                if (!isMounted) return
                setSession(currentSession)
                setUser(currentSession?.user || null)
                await ensureProfile(currentSession?.user || null)
            } catch (err) {
                console.error('Auth init error:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        initAuth()

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                if (!isMounted) return
                setSession(newSession)
                setUser(newSession?.user || null)

                if (event === 'SIGNED_IN') {
                    // Reset dedup ref on fresh sign-in so profile fetches again
                    profileFetchRef.current = null
                    await ensureProfile(newSession?.user || null)
                } else if (event === 'TOKEN_REFRESHED') {
                    // Only re-fetch if profile is missing
                    if (!profile) {
                        await ensureProfile(newSession?.user || null)
                    }
                } else if (event === 'SIGNED_OUT') {
                    setProfile(null)
                    profileFetchRef.current = null
                }
            }
        )

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [ensureProfile])

    // Sign out via Supabase — scope: 'global' invalidates ALL sessions
    const signOut = async () => {
        try {
            await supabase.auth.signOut({ scope: 'global' })
        } catch (err) {
            console.error('Sign out error:', err)
            // Force local cleanup even if global signOut fails
            try {
                await supabase.auth.signOut({ scope: 'local' })
            } catch (_) {
                // Last resort: clear state manually
            }
        }
        // Always clean up local state
        setUser(null)
        setSession(null)
        setProfile(null)
        profileFetchRef.current = null
    }

    // Get current access token for backend API calls
    const getAccessToken = async () => {
        const { data: { session: s } } = await supabase.auth.getSession()
        return s?.access_token || null
    }

    // Force re-fetch profile from DB (e.g. after an update)
    const refreshProfile = useCallback(async () => {
        if (!user) return
        try {
            profileFetchRef.current = null // Allow re-fetch
            const { data } = await supabase
                .from('profiles')
                .select('id, name, email, avatar_url, bio, location, role, company, skills')
                .eq('id', user.id)
                .maybeSingle()
            if (data) {
                setProfile(data)
                profileFetchRef.current = user.id
            }
        } catch (err) {
            console.error('Profile refresh error:', err)
        }
    }, [user])

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
