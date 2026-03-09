import { Bell, Heart, MessageSquare, UserPlus, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { MOCK_NOTIFICATIONS } from '../data/mockData'

export default function Notifications() {
    return (
        <section className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-10 w-full relative">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Notifications</h1>
                    <p className="text-gray-400">Activity and alerts from your ecosystem.</p>
                </div>
                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Mark all as read
                </button>
            </header>

            <div className="space-y-4">
                {MOCK_NOTIFICATIONS.map((n, idx) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`glass-panel p-5 rounded-2xl flex items-start gap-4 transition-colors ${n.unread ? 'border-l-[3px] border-l-rose-500 bg-white/[0.03]' : 'opacity-80'}`}
                    >
                        <div className="relative shrink-0">
                            <img src={n.user.avatar} className="w-12 h-12 rounded-xl object-cover bg-[#111418]" alt={n.user.name} />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#16181D] border border-white/10 flex items-center justify-center">
                                {n.icon === 'heart' && <Heart className="w-3 h-3 text-rose-500" fill="currentColor" />}
                                {n.icon === 'user-plus' && <UserPlus className="w-3 h-3 text-blue-500" />}
                                {n.icon === 'message-square' && <MessageSquare className="w-3 h-3 text-emerald-500" />}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-300">
                                <span className="font-bold text-white mr-1">{n.user.name}</span>
                                {n.action}
                            </p>
                            {n.target && (
                                <p className="text-sm text-gray-500 mt-1 italic border-l-2 border-white/10 pl-3">
                                    {n.target}
                                </p>
                            )}
                            <p className="text-[11px] text-gray-600 mt-2 font-semibold uppercase tracking-wider">{n.time}</p>
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
        </section>
    )
}
