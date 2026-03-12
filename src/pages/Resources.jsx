import { BookOpen, MonitorPlay, FileText, Download, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { getResources } from '../services/api'

export default function Resources() {
    const navigate = useNavigate()
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)

    const iconMap = { FileText, BookOpen, MonitorPlay }

    useEffect(() => {
        const loadResources = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) { navigate('/login'); return }

                try {
                    const data = await getResources()
                    setResources(data.resources || data || [])
                } catch (e) {
                    // Endpoint may not exist yet
                }
            } catch (err) {
                console.error('resources error:', err)
            } finally {
                setLoading(false)
            }
        }

        loadResources()
    }, [navigate])

    return (
        <section className="flex-1 max-w-5xl mx-auto px-4 md:px-8 py-10 w-full">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Founder Resources</h1>
                <p className="text-gray-400">Curated tools, fund databases, templates, and high-impact learning paths.</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            ) : resources.length === 0 ? (
                <div className="glass-panel rounded-3xl p-16 text-center">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No resources yet</h3>
                    <p className="text-sm text-gray-500">Curated resources will appear here as the platform grows.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.map((res, i) => {
                        const Icon = iconMap[res.iconName] || FileText
                        return (
                            <motion.div
                                key={res.id || i}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-[#F43F5E]/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110 group-hover:bg-[#F43F5E]/10 group-hover:text-[#F43F5E]">
                                        <Icon className="w-6 h-6 text-gray-400 group-hover:text-rose-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1 group-hover:text-rose-500 transition-colors">{res.title}</h3>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            {res.type && <span className="bg-[#111418] px-2 py-0.5 rounded text-gray-400 border border-white/5">{res.type}</span>}
                                            {res.size && <><span>•</span><span>{res.size}</span></>}
                                        </div>
                                    </div>
                                </div>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white bg-[#111418] border border-white/5 hover:bg-white/10 transition-colors">
                                    <Download className="w-[18px] h-[18px]" />
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
