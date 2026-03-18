import { Rocket, Target, CheckCircle2, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getLaunchpad } from '../services/api'

export default function Launchpad() {
    const { user } = useAuth()
    const [milestones, setMilestones] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadLaunchpad = async () => {
            try {
                const data = await getLaunchpad()
                setMilestones(data || [])
            } catch (e) {
                // Table might not exist yet
            } finally {
                setLoading(false)
            }
        }
        loadLaunchpad()
    }, [])

    return (
        <section className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-10 w-full relative">
            <header className="mb-14 text-center">
                <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                    <Rocket className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Product Launchpad</h1>
                <p className="text-gray-400 text-lg">The roadmap to scale. Track our core milestones and strategic objectives.</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            ) : milestones.length === 0 ? (
                <div className="glass-panel rounded-3xl p-16 text-center">
                    <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No milestones yet</h3>
                    <p className="text-sm text-gray-500">Launchpad milestones will appear here as the roadmap is defined.</p>
                </div>
            ) : (
                <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-12 pb-12">
                    {milestones.map((m, idx) => (
                        <motion.div
                            key={m.title || idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative pl-8 md:pl-12"
                        >
                            <div className="absolute -left-[17px] top-1">
                                {m.status === 'completed' && <div className="w-8 h-8 rounded-full bg-[#111418] border border-green-500/50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>}
                                {m.status === 'active' && <div className="w-8 h-8 rounded-full bg-rose-500 border border-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)]"><Target className="w-4 h-4 text-white" /></div>}
                                {m.status === 'upcoming' && <div className="w-8 h-8 rounded-full bg-[#111418] border border-white/20 flex items-center justify-center"><Clock className="w-4 h-4 text-gray-500" /></div>}
                            </div>

                            <div className={`glass-panel p-6 rounded-2xl ${m.status === 'active' ? 'border-rose-500/30 shadow-[0_4px_20px_rgba(244,63,94,0.1)]' : ''}`}>
                                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                                    <h3 className={`text-xl font-bold ${m.status === 'active' ? 'text-white' : 'text-gray-300'}`}>{m.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${m.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            m.status === 'active' ? 'bg-rose-500/10 text-rose-500' :
                                                'bg-white/5 text-gray-500'
                                        }`}>{m.date}</span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed mb-4">{m.desc || m.description}</p>

                                {m.status === 'active' && (
                                    <button className="text-rose-500 text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity">
                                        Join Feedback Thread <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    )
}
