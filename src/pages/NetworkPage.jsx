import { Search, Filter, MapPin, Briefcase, Link, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { MOCK_USERS, MOCK_SUGGESTED_CONNECTIONS } from '../data/mockData'

export default function NetworkPage() {
    const allUsers = Object.values(MOCK_USERS).filter(u => u.id !== 'u_1')

    return (
        <section className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Network</h1>
                    <p className="text-gray-400">Discover founders, investors, and potential collaborators.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="neumorphic-input flex items-center px-4 py-2.5 rounded-xl w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input type="text" placeholder="Search network..." className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-gray-600" />
                    </div>
                    <button className="h-10 px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allUsers.map((user, idx) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-panel rounded-3xl p-6 group hover:border-[#F43F5E]/30 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover bg-white/10" alt={user.name} />
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors">
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-[#F43F5E] transition-colors">{user.name}</h3>
                        <p className="text-sm text-rose-500/80 font-medium mb-4">{user.role} @ {user.company}</p>

                        <div className="space-y-2 mb-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{user.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>Enterprise SaaS, AI</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    <img src="https://i.pravatar.cc/150?img=12" className="w-6 h-6 rounded-full border-2 border-[#16181D]" />
                                    <img src="https://i.pravatar.cc/150?img=5" className="w-6 h-6 rounded-full border-2 border-[#16181D]" />
                                </div>
                                <span className="text-[10px] text-gray-500 font-medium tracking-wide">12 MUTUAL</span>
                            </div>
                            <button className="text-[#F43F5E] text-sm font-semibold flex items-center gap-1 hover:opacity-80">
                                Connect <Link className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
