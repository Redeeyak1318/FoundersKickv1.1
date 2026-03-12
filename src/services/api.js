import { supabase } from '../lib/supabase'

// ─── HELPER: Get current session user ID ───────────
async function getCurrentUserId() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('NOT_AUTHENTICATED')
    return session.user.id
}

// ─── POSTS ─────────────────────────────────────
export async function getPosts() {
    const { data, error } = await supabase
        .from("posts")
        .select(`
            id,
            content,
            image,
            created_at,
            user_id,
            profiles:profiles!posts_user_id_fkey(id, name, avatar_url),
            post_likes(count),
            post_comments(count)
        `)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
}

export async function createPost({ content, image }) {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
        .from("posts")
        .insert([{ content, image: image || null, user_id: userId }])
        .select(`
            id,
            content,
            image,
            created_at,
            user_id,
            profiles:profiles!posts_user_id_fkey(id, name, avatar_url),
            post_likes(count),
            post_comments(count)
        `)
        .single()

    if (error) throw error
    return data
}

export async function deletePost(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId)
    if (error) throw error
}

// ─── LIKES ─────────────────────────────────────
export async function toggleLike(postId) {
    const userId = await getCurrentUserId()

    const { data: existing } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle()

    if (existing) {
        // Unlike
        const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId)
        if (error) throw error
        return { liked: false }
    } else {
        // Like
        const { error } = await supabase
            .from("post_likes")
            .insert([{ post_id: postId, user_id: userId }])
        if (error) throw error

        // Create notification for the post owner
        try {
            const { data: post } = await supabase
                .from("posts")
                .select("user_id")
                .eq("id", postId)
                .maybeSingle()

            if (post && post.user_id !== userId) {
                await supabase.from("notifications").insert([{
                    user_id: post.user_id,
                    type: "like",
                    actor_id: userId,
                    post_id: postId
                }])
            }
        } catch (_) { /* notification failure is non-critical */ }

        return { liked: true }
    }
}

// ─── COMMENTS ──────────────────────────────────
export async function getComments(postId) {
    const { data, error } = await supabase
        .from("post_comments")
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles:profiles!post_comments_user_id_fkey(name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
}

export async function createComment(postId, content) {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
        .from("post_comments")
        .insert([{ post_id: postId, user_id: userId, content }])
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles:profiles!post_comments_user_id_fkey(name, avatar_url)
        `)
        .single()

    if (error) throw error

    // Create notification for the post owner
    try {
        const { data: post } = await supabase
            .from("posts")
            .select("user_id")
            .eq("id", postId)
            .maybeSingle()

        if (post && post.user_id !== userId) {
            await supabase.from("notifications").insert([{
                user_id: post.user_id,
                type: "comment",
                actor_id: userId,
                post_id: postId
            }])
        }
    } catch (_) { /* notification failure is non-critical */ }

    return data
}

// ─── PROFILE ───────────────────────────────────
export async function getMyProfile() {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, bio, location, role, company")
        .eq("id", userId)
        .maybeSingle()

    if (error) throw error
    return data || {}
}

export async function updateProfile(updates) {
    const userId = await getCurrentUserId()

    // Map frontend field names to DB columns
    const dbUpdates = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio
    if (updates.location !== undefined) dbUpdates.location = updates.location
    if (updates.role !== undefined) dbUpdates.role = updates.role
    if (updates.company !== undefined) dbUpdates.company = updates.company

    const { data, error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId)
        .select("id, name, avatar_url, bio, location, role, company")
        .maybeSingle()

    if (error) throw error
    return data || {}
}

// ─── NETWORK / FOLLOW ──────────────────────────
export async function getNetworkSuggestions() {
    const userId = await getCurrentUserId()

    // Get all profiles except current user
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, bio, location, role, company")
        .neq("id", userId)
        .limit(50)

    if (error) throw error

    // Get who the current user is following
    const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId)

    const followingSet = new Set((following || []).map(f => f.following_id))

    return (profiles || []).map(p => ({
        ...p,
        avatar: p.avatar_url,
        is_following: followingSet.has(p.id)
    }))
}

export async function followUser(targetId) {
    const userId = await getCurrentUserId()

    const { error } = await supabase
        .from("follows")
        .insert([{ follower_id: userId, following_id: targetId }])

    if (error) throw error

    // Create notification
    try {
        await supabase.from("notifications").insert([{
            user_id: targetId,
            type: "follow" || "general",
            actor_id: userId
        }])
    } catch (_) { /* non-critical */ }
}

export async function unfollowUser(targetId) {
    const userId = await getCurrentUserId()

    const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: userId, following_id: targetId })

    if (error) throw error
}

// ─── MESSAGES ──────────────────────────────────
export async function getConversations() {
    const userId = await getCurrentUserId()

    // Get all messages involving the current user
    const { data: msgs, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })

    if (error) throw error
    if (!msgs || msgs.length === 0) return []

    // Group by conversation partner
    const convMap = {}
    for (const msg of msgs) {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        if (!convMap[partnerId]) {
            convMap[partnerId] = {
                id: partnerId,
                partnerId,
                lastMessage: msg.content,
                timestamp: new Date(msg.created_at).toLocaleString(),
                messages: []
            }
        }
        convMap[partnerId].messages.push(msg)
    }

    // Fetch partner profiles
    const partnerIds = Object.keys(convMap)
    const { data: partners } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", partnerIds)

    const partnerMap = {}
    for (const p of (partners || [])) {
        partnerMap[p.id] = { id: p.id, name: p.name, avatar: p.avatar_url }
    }

    return Object.values(convMap).map(c => ({
        ...c,
        user: partnerMap[c.partnerId] || { id: c.partnerId, name: 'Unknown', avatar: '/default-avatar.png' }
    }))
}

export async function getConversation(partnerId) {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true })

    if (error) throw error

    // Fetch profiles for sender display
    const userIds = [...new Set((data || []).map(m => m.sender_id))]
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds)

    const profileMap = {}
    for (const p of (profiles || [])) {
        profileMap[p.id] = { id: p.id, name: p.name, avatar: p.avatar_url }
    }

    return (data || []).map(m => ({
        id: m.id,
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString(),
        sender: profileMap[m.sender_id] || { id: m.sender_id, name: 'Unknown', avatar: '/default-avatar.png' }
    }))
}

export async function sendMessage({ receiver_id, content }) {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
        .from("messages")
        .insert([{
            sender_id: userId,
            receiver_id,
            content
        }])
        .select("id, sender_id, receiver_id, content, created_at")
        .single()

    if (error) throw error
    return data
}

// ─── NOTIFICATIONS ─────────────────────────────
export async function getNotifications() {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
        .from("notifications")
        .select("id, type, actor_id, post_id, read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) return []

    // Fetch actor profiles
    const actorIds = [...new Set(data.map(n => n.actor_id).filter(Boolean))]
    const { data: actorProfiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", actorIds.length > 0 ? actorIds : ['__none__'])

    const actorMap = {}
    for (const p of (actorProfiles || [])) {
        actorMap[p.id] = { id: p.id, name: p.name, avatar: p.avatar_url }
    }

    const typeToIcon = { like: 'heart', follow: 'user-plus', comment: 'message-square' }
    const typeToAction = { like: 'liked your post', follow: 'started following you', comment: 'commented on your post' }

    return data.map(n => ({
        id: n.id,
        icon: typeToIcon[n.type] || 'bell',
        action: typeToAction[n.type] || n.type,
        unread: !n.read,
        time: new Date(n.created_at).toLocaleString(),
        created_at: n.created_at,
        user: actorMap[n.actor_id] || { name: 'Someone', avatar: '/default-avatar.png' },
        post_id: n.post_id
    }))
}

export async function markNotificationRead(notifId) {
    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notifId)

    if (error) throw error
}

export async function markAllNotificationsRead() {
    const userId = await getCurrentUserId()

    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

    if (error) throw error
}

// ─── STARTUPS ──────────────────────────────────
export async function getStartups() {
    const { data, error } = await supabase
        .from("startups")
        .select("id, name, tagline, stage, tags, logo, user_id, created_at")
        .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
}

export async function createStartup(startup) {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
        .from("startups")
        .insert({
            name: startup.name,
            tagline: startup.tagline || null,
            stage: startup.stage || 'Seed',
            tags: startup.tags || [],
            user_id: userId
        }, { defaultToNull: false })
        .select("id, name, tagline, stage, tags, logo, user_id, created_at")
        .single()

    if (error) throw error
    return { startup: data }
}

export async function updateStartup(id, updates) {
    const { data, error } = await supabase
        .from("startups")
        .update(updates)
        .eq("id", id)
        .select("id, name, tagline, stage, tags, logo, user_id, created_at")
        .maybeSingle()

    if (error) throw error
    return data
}

// ─── INSIGHTS ──────────────────────────────────
export async function getInsights() {
    const userId = await getCurrentUserId()

    // Compute real insights from user data
    try {
        const [postsRes, followersRes, followingRes, likesRes] = await Promise.all([
            supabase.from("posts").select("id", { count: "exact" }).eq("user_id", userId),
            supabase.from("follows").select("id", { count: "exact" }).eq("following_id", userId),
            supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", userId),
            supabase.from("post_likes").select("id, post_id, posts!inner(user_id)", { count: "exact" }).eq("posts.user_id", userId)
        ])

        return [
            { label: 'Network Growth', value: String((followersRes.count || 0) + (followingRes.count || 0)), iconName: 'Users' },
            { label: 'Posts', value: String(postsRes.count || 0), iconName: 'Activity' },
            { label: 'Engagement', value: String(likesRes.count || 0), iconName: 'TrendingUp' },
            { label: 'Followers', value: String(followersRes.count || 0), iconName: 'BarChart3' }
        ]
    } catch (_) {
        return []
    }
}

// ─── RESOURCES ─────────────────────────────────
export async function getResources() {
    const { data, error } = await supabase
        .from("resources")
        .select("id, title, type, size, url, icon_name, created_at")
        .order("created_at", { ascending: false })

    if (error) throw error
    return (data || []).map(r => ({
        ...r,
        iconName: r.icon_name || 'FileText'
    }))
}

// ─── LAUNCHPAD ─────────────────────────────────
export async function getLaunchpad() {
    const { data, error } = await supabase
        .from("launchpad")
        .select("id, title, description, date, status, created_at")
        .order("created_at", { ascending: true })

    if (error) throw error
    return (data || []).map(m => ({
        ...m,
        desc: m.description
    }))
}