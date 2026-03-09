# Shared Layouts

## AppLayout
- Source: `src/components/layout/AppLayout.jsx`
- Description: The main shared layout wrapper for the authenticated application area.

```jsx
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, Plus, Moon } from 'lucide-react'

const navTabs = [
    { path: '/dashboard', label: 'Feed' },
    { path: '/startups', label: 'Startups' },
    { path: '/network', label: 'Network' },
    { path: '/messages', label: 'Messages' },
    { path: '/profile', label: 'Profile' },
]

export default function AppLayout() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#181B24] via-[#0F1117] to-[#0A0C10] text-white font-sans antialiased flex flex-col">

            {/* ── Top Navbar ── */}
            <header className="sticky top-0 z-50 w-full h-[64px] bg-[#16181D]/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10">
                        <span className="font-bold text-lg leading-none text-white/90">FK</span>
                    </div>
                    <span className="font-semibold text-lg text-white/90">FoundersKick</span>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-xl hidden md:block z-10">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Founders, Startups & Opportunities... (Ctrl+K)"
                        className="w-full bg-[#0A0C10] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-5 relative z-20">
                    <button className="text-gray-400 hover:text-white relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-500 border border-[#16181D]" />
                    </button>
                    <button className="text-gray-400 hover:text-white">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Create
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer border-l border-white/10 pl-5" onClick={() => navigate('/profile')}>
                        <img src="https://i.pravatar.cc/150?img=47" alt="Sarah C." className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                        <span className="text-sm font-medium text-gray-200 hidden sm:block">Sarah C.</span>
                    </div>
                </div>
            </header>

            {/* ── Tab Navigation ── */}
            <div className="sticky top-[64px] z-40 w-full bg-[#16181D]/90 backdrop-blur-md border-b border-white/5">
                <div className="px-8 flex items-center justify-between">
                    <nav className="flex gap-8">
                        {navTabs.map(tab => {
                            const isActive = location.pathname.startsWith(tab.path)
                            return (
                                <button
                                    key={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    className={`py-4 text-sm font-medium relative transition-colors ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-500 rounded-t-full" />
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                    <button className="text-gray-500 hover:text-gray-300">
                        <Moon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Page Content ── */}
            <main className="flex-1 w-full px-8 py-6">
                <Outlet />
            </main>
        </div>
    )
}
```
