import { Bell, Heart, MessageSquare, UserPlus, CheckCircle2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Notifications() {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) { navigate('/login'); return }

                const data = await getNotifications()
                setNotifications(data.notifications || data || [])
            } catch (err) {
                console.error('notifications error:', err)
            } finally {
                setLoading(false)
            }
        }

        loadNotifications()
    }, [navigate])

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead()
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
        } catch (err) {
            console.error('mark all read error:', err)
        }
    }

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
        } catch (err) {
            console.error('mark read error:', err)
        }
    }

    return (
        <section className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-10 w-full relative">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Notifications</h1>
                    <p className="text-gray-400">Activity and alerts from your ecosystem.</p>
                </div>
                <button onClick={handleMarkAllRead} className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Mark all as read
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="glass-panel rounded-2xl p-16 text-center">
                    <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No notifications yet</h3>
                    <p className="text-sm text-gray-500">When someone interacts with your content, you'll see it here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((n, idx) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => n.unread && handleMarkRead(n.id)}
                            className={`glass-panel p-5 rounded-2xl flex items-start gap-4 transition-colors cursor-pointer ${n.unread ? 'border-l-[3px] border-l-rose-500 bg-white/[0.03]' : 'opacity-80'}`}
                        >
                            <div className="relative shrink-0">
                                <img src={n.user?.avatar || n.avatar || '/default-avatar.png'} className="w-12 h-12 rounded-xl object-cover bg-[#111418]" alt={n.user?.name || 'User'} />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#16181D] border border-white/10 flex items-center justify-center">
                                    {n.icon === 'heart' && <Heart className="w-3 h-3 text-rose-500" fill="currentColor" />}
                                    {n.icon === 'user-plus' && <UserPlus className="w-3 h-3 text-blue-500" />}
                                    {n.icon === 'message-square' && <MessageSquare className="w-3 h-3 text-emerald-500" />}
                                    {!['heart', 'user-plus', 'message-square'].includes(n.icon) && <Bell className="w-3 h-3 text-gray-400" />}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-300">
                                    <span className="font-bold text-white mr-1">{n.user?.name || 'Someone'}</span>
                                    {n.action}
                                </p>
                                {n.target && (
                                    <p className="text-sm text-gray-500 mt-1 italic border-l-2 border-white/10 pl-3">
                                        {n.target}
                                    </p>
                                )}
                                <p className="text-[11px] text-gray-600 mt-2 font-semibold uppercase tracking-wider">{n.time || n.created_at}</p>
                            </div>

                            {!n.unread && (
                                <div className="shrink-0 w-2 h-2 rounded-full bg-white/5" />
                            )}
                            {n.unread && (
                                <div className="shrink-0 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    )
}
