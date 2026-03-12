import { supabase } from '../lib/supabase'

const BASE_URL = 'https://founderskickv11-production.up.railway.app/api'

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Supabase session bearer token.
 */
async function authFetch(path, options = {}) {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        throw new Error('NOT_AUTHENTICATED')
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...(options.headers || {})
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers
    })

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const err = new Error(errBody.error || errBody.message || `Request failed: ${res.status}`)
        err.status = res.status
        throw err
    }

    const json = await res.json()

    // Unwrap the backend { success, data, message } envelope if present
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data ?? json
    }

    return json
}

// ─── DASHBOARD ─────────────────────────────────
export const getDashboard = () => authFetch('/dashboard')

// ─── POSTS ─────────────────────────────────────
export const getPosts = () => authFetch('/posts')
export const createPost = (content) => authFetch('/posts', {
    method: 'POST',
    body: JSON.stringify({ content })
})
export const likePost = (id) => authFetch(`/posts/${id}/like`, { method: 'POST' })
export const commentOnPost = (id, text) => authFetch(`/posts/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text })
})
export const deletePost = (id) => authFetch(`/posts/${id}`, { method: 'DELETE' })

// ─── PROFILE ───────────────────────────────────
export const getMyProfile = () => authFetch('/profile/me')
export const updateProfile = (data) => authFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
})

// ─── NETWORK ───────────────────────────────────
export const getNetworkSuggestions = () => authFetch('/network/suggestions')
export const followUser = (id) => authFetch(`/network/follow/${id}`, { method: 'POST' })
export const unfollowUser = (id) => authFetch(`/network/unfollow/${id}`, { method: 'POST' })

// ─── MESSAGES ──────────────────────────────────
export const getConversations = () => authFetch('/messages')
export const getConversation = (id) => authFetch(`/messages/${id}`)
export const sendMessage = (data) => authFetch('/messages', {
    method: 'POST',
    body: JSON.stringify(data)
})

// ─── NOTIFICATIONS ─────────────────────────────
export const getNotifications = () => authFetch('/notifications')
export const markNotificationRead = (id) => authFetch(`/notifications/${id}/read`, { method: 'POST' })
export const markAllNotificationsRead = () => authFetch('/notifications/read-all', { method: 'POST' })

// ─── STARTUPS ──────────────────────────────────
export const getStartups = () => authFetch('/startups')
export const createStartup = (data) => authFetch('/startups', {
    method: 'POST',
    body: JSON.stringify(data)
})
export const updateStartup = (id, data) => authFetch(`/startups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
})

// ─── INSIGHTS ──────────────────────────────────
export const getInsights = () => authFetch('/insights')

// ─── RESOURCES ─────────────────────────────────
export const getResources = () => authFetch('/resources')

// ─── LAUNCHPAD ─────────────────────────────────
export const getLaunchpad = () => authFetch('/launchpad')