import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import {
    LayoutGrid, Compass, BarChart3, MessageCircle, Briefcase,
    Bell, Search, Rocket, Zap, Settings, BookOpen, Activity, LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import Lenis from '@studio-freight/lenis'
import { useAuth } from '../../contexts/AuthContext'

const navTabs = [
    { path: '/dashboard', label: 'Feed', icon: LayoutGrid },
    { path: '/network', label: 'Network', icon: Compass },
    { path: '/startups', label: 'Startups', icon: Briefcase },
    { path: '/launchpad', label: 'Launchpad', icon: Rocket },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/insights', label: 'Insights', icon: BarChart3 },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/profile', label: 'Profile', icon: Activity },
    { path: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const containerRef = useRef(null)
    const { user, profile, signOut } = useAuth()

    // Smooth Scrolling using Lenis
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        })

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    // Use profile data if available, fall back to auth user metadata
    const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Founder'
    const displayRole = profile?.role || user?.user_metadata?.role || 'Founder'
    const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png'

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col md:flex-row bg-[#0E1116] text-[#E2E8F0] selection:bg-rose-500/30 font-sans">

            {/* Left Navigation Sidebar */}
            <aside className="w-full md:w-64 border-r border-white/5 flex flex-col h-screen sticky top-0 bg-[#0E1116] z-40 hidden md:flex shrink-0">
                <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                        <Rocket className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">FoundersKick</span>
                </div>

                <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-1">
                    {navTabs.map((tab) => {
                        const isActive = location.pathname.startsWith(tab.path)
                        const Icon = tab.icon
                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium text-[14px] transition-all duration-300 ${isActive ? 'active-nav' : 'sidebar-link text-gray-400'}`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 mb-4">
                    <div className="glass-panel rounded-2xl p-4 cursor-pointer hover:border-white/10 transition-colors" onClick={() => navigate('/profile')}>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-2">Logged In As</p>
                        <div className="flex items-center gap-3 mb-3">
                            <img src={displayAvatar} alt={displayName} className="w-9 h-9 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                                <p className="text-xs text-gray-400 truncate">{displayRole}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2.5 mt-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-[#0E1116] border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
                        <Rocket className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg text-white">FoundersKick</span>
                </div>
                <button
                    onClick={handleSignOut}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Sign Out"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, filter: 'blur(10px)', y: 15 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        exit={{ opacity: 0, filter: 'blur(10px)', y: -15 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full h-full flex-1 flex flex-col"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}