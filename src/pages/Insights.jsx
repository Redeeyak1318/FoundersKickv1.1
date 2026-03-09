import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Insights() {
    return (
        <section className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 w-full relative">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Insights Dashboard</h1>
                <p className="text-gray-400">Track ecosystem velocity, personal traction, and engagement.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Network Growth', value: '+142', icon: Users, up: true },
                    { label: 'Profile Views', value: '4.2k', icon: Activity, up: true },
                    { label: 'Conversion Rate', value: '2.4%', icon: TrendingUp, up: false },
                    { label: 'Engagement Score', value: '94/100', icon: BarChart3, up: true },
                ].map((kpi, idx) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel p-6 rounded-3xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-sm">
                                <kpi.icon className="w-5 h-5 text-gray-400" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{kpi.label}</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <h2 className="text-3xl font-bold text-white tracking-tight">{kpi.value}</h2>
                            <span className={`text-xs font-semibold mb-1 flex items-center gap-1 ${kpi.up ? 'text-green-500' : 'text-gray-500'}`}>
                                {kpi.up ? '↑ 12%' : '↓ 2%'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Chart Area placeholder */}
            <div className="glass-panel p-6 rounded-3xl min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <BarChart3 className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">Growth Trajectory</h3>
                <p className="text-sm text-gray-500 max-w-sm text-center">In a full production build, a DataViz library like Recharts would render minimal, low-contrast neon line charts here.</p>
            </div>
        </section>
    )
}
