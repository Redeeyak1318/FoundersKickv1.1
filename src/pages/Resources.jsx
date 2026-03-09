import { BookOpen, MonitorPlay, FileText, Download } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Resources() {
    const resources = [
        { id: 1, title: 'Seed Pitch Template', type: 'Template', size: '2.4 MB', icon: FileText },
        { id: 2, title: 'Growth Metrics Guide', type: 'PDF Guide', size: '1.1 MB', icon: BookOpen },
        { id: 3, title: 'Product Hunt Launch Strategy', type: 'Masterclass', size: '45 mins', icon: MonitorPlay },
        { id: 4, title: 'Cap Table Modeling', type: 'Spreadsheet', size: '800 KB', icon: FileText }
    ]

    return (
        <section className="flex-1 max-w-5xl mx-auto px-4 md:px-8 py-10 w-full">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Founder Resources</h1>
                <p className="text-gray-400">Curated tools, fund databases, templates, and high-impact learning paths.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((res, i) => (
                    <motion.div
                        key={res.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-[#F43F5E]/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110 group-hover:bg-[#F43F5E]/10 group-hover:text-[#F43F5E]">
                                <res.icon className="w-6 h-6 text-gray-400 group-hover:text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white mb-1 group-hover:text-rose-500 transition-colors">{res.title}</h3>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <span className="bg-[#111418] px-2 py-0.5 rounded text-gray-400 border border-white/5">{res.type}</span>
                                    <span>•</span>
                                    <span>{res.size}</span>
                                </div>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white bg-[#111418] border border-white/5 hover:bg-white/10 transition-colors">
                            <Download className="w-[18px] h-[18px]" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
