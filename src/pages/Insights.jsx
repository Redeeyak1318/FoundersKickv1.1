import { BarChart3, TrendingUp, Users, Activity, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getInsights } from '../services/api'

export default function Insights() {
    const { user } = useAuth()
    const [kpis, setKpis] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadInsights = async () => {
            try {
                const data = await getInsights()
                setKpis(data || [])
            } catch (e) {
                // API may return error for new tables, show empty state
            } finally {
                setLoading(false)
            }
        }
        loadInsights()
    }, [])

    const iconMap = { Users, Activity, TrendingUp, BarChart3 }

    return (
        <section className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 w-full relative">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Insights Dashboard</h1>
                <p className="text-gray-400">Track ecosystem velocity, personal traction, and engagement.</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    {kpis.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {kpis.map((kpi, idx) => {
                                const Icon = iconMap[kpi.iconName] || BarChart3
                                return (
                                    <motion.div
                                        key={kpi.label || idx}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass-panel p-6 rounded-3xl"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-sm">
                                                <Icon className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{kpi.label}</span>
                                        </div>
                                        <div className="flex items-end gap-3">
                                            <h2 className="text-3xl font-bold text-white tracking-tight">{kpi.value}</h2>
                                            {kpi.change && (
                                                <span className={`text-xs font-semibold mb-1 ${kpi.up ? 'text-green-500' : 'text-gray-500'}`}>
                                                    {kpi.up ? '↑' : '↓'} {kpi.change}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                { label: 'Network Growth', icon: Users },
                                { label: 'Profile Views', icon: Activity },
                                { label: 'Engagement', icon: TrendingUp },
                                { label: 'Score', icon: BarChart3 }
                            ].map((item) => (
                                <div key={item.label} className="glass-panel p-6 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-600 tracking-tight">—</h2>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Chart Area */}
                    <div className="glass-panel p-6 rounded-3xl min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <BarChart3 className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Growth Trajectory</h3>
                        <p className="text-sm text-gray-500 max-w-sm text-center">Insights will populate as your activity grows on the platform.</p>
                    </div>
                </>
            )}
        </section>
    )
}
