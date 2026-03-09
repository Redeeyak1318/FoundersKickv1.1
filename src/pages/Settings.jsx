import { Shield, BellRing, Eye, CreditCard, Monitor, LogOut } from 'lucide-react'

export default function Settings() {
    return (
        <section className="flex-1 max-w-5xl mx-auto px-4 md:px-8 py-10 w-full relative">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your system preferences and account controls.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left side tabs */}
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="flex flex-col gap-1.5 sticky top-24">
                        <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-rose-500 font-medium transition-colors cursor-default">
                            <Monitor className="w-4 h-4" /> Preferences
                        </button>
                        <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.03] text-gray-400 hover:text-gray-200 transition-colors">
                            <Shield className="w-4 h-4" /> Security
                        </button>
                        <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.03] text-gray-400 hover:text-gray-200 transition-colors">
                            <BellRing className="w-4 h-4" /> Notifications
                        </button>
                        <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.03] text-gray-400 hover:text-gray-200 transition-colors">
                            <Eye className="w-4 h-4" /> Privacy
                        </button>
                        <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.03] text-gray-400 hover:text-gray-200 transition-colors">
                            <CreditCard className="w-4 h-4" /> Subscription
                        </button>
                        <div className="my-2 border-t border-white/5" />
                        <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign out
                        </button>
                    </nav>
                </aside>

                {/* Main Settings Panel */}
                <div className="flex-1 space-y-6">
                    <div className="glass-panel rounded-3xl p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Theme Preferences</h2>

                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-medium text-gray-300 mb-3">Color Scheme</p>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <button className="h-24 rounded-xl border-2 border-rose-500 relative bg-[#0E1116] overflow-hidden">
                                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[#16181D]" />
                                        <div className="absolute top-2 left-2 w-4 h-4 rounded bg-rose-500" />
                                        <div className="absolute bottom-2 right-2 flex gap-1"><div className="w-2 h-2 rounded-full bg-white/20" /><div className="w-2 h-2 rounded-full bg-white/20" /></div>
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">System Dark</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-white">Reduce Motion</p>
                                    <p className="text-xs text-gray-500 mt-1">Minimize animations for a more static experience.</p>
                                </div>
                                <div className="w-12 h-6 rounded-full bg-white/10 border border-white/5 relative cursor-pointer">
                                    <div className="w-4 h-4 bg-gray-500 rounded-full absolute left-1 top-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Account Profile</h2>

                        <div className="space-y-4 max-w-lg">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Display Name</label>
                                <input type="text" value="Sarah Jin" readOnly className="neumorphic-input w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-rose-500 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                                <input type="email" value="sarah@novastack.dev" readOnly className="neumorphic-input w-full px-4 py-3 rounded-xl text-gray-400 outline-none text-sm pointer-events-none" />
                            </div>

                            <button className="mt-4 px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                                Update Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
