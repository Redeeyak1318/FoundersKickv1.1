import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

/* SVG Icons as components */
const Icons = {
    Home: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    Network: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" />
            <line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" />
        </svg>
    ),
    Rocket: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    User: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Search: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
    ),
    Bell: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
    ),
    Settings: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    ChevronLeft: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    ),
    ChevronRight: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),
    Plus: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    MessageCircle: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
    ),
}

const navItems = [
    { path: '/dashboard', label: 'Home Feed', icon: Icons.Home },
    { path: '/network', label: 'Network', icon: Icons.Network },
    { path: '/startups', label: 'Startups', icon: Icons.Rocket },
    { path: '/profile', label: 'Profile', icon: Icons.User },
]

const secondaryItems = [
    { path: '/messages', label: 'Messages', icon: Icons.MessageCircle },
    { path: '/settings', label: 'Settings', icon: Icons.Settings },
]

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <motion.aside
                className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}
                animate={{ width: collapsed ? 72 : 280 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Logo */}
                <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <div className="sidebar-logo-icon">FK</div>
                    <motion.span
                        className="sidebar-logo-text"
                        animate={{ opacity: collapsed ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        FoundersKick
                    </motion.span>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <motion.div
                        className="sidebar-section-title"
                        animate={{ opacity: collapsed ? 0 : 1 }}
                    >
                        Main
                    </motion.div>
                    {navItems.map(item => (
                        <motion.div
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="nav-item-icon">
                                <item.icon />
                            </div>
                            <motion.span
                                className="nav-item-text"
                                animate={{ opacity: collapsed ? 0 : 1 }}
                            >
                                {item.label}
                            </motion.span>
                        </motion.div>
                    ))}

                    <motion.div
                        className="sidebar-section-title"
                        animate={{ opacity: collapsed ? 0 : 1 }}
                        style={{ marginTop: 16 }}
                    >
                        More
                    </motion.div>
                    {secondaryItems.map(item => (
                        <motion.div
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="nav-item-icon">
                                <item.icon />
                            </div>
                            <motion.span
                                className="nav-item-text"
                                animate={{ opacity: collapsed ? 0 : 1 }}
                            >
                                {item.label}
                            </motion.span>
                        </motion.div>
                    ))}
                </nav>

                {/* Toggle */}
                <div className="sidebar-toggle">
                    <motion.button
                        className="sidebar-toggle-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main area */}
            <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
                {/* Navbar */}
                <header className={`app-navbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
                    <div className="navbar-search">
                        <span className="navbar-search-icon"><Icons.Search /></span>
                        <input
                            className="navbar-search-input"
                            type="text"
                            placeholder="Search founders, startups, posts..."
                        />
                    </div>
                    <div className="navbar-actions">
                        <motion.button
                            className="navbar-icon-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icons.Bell />
                            <span className="badge" />
                        </motion.button>
                        <motion.button
                            className="navbar-icon-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icons.Plus />
                        </motion.button>
                        <motion.div
                            className="navbar-avatar"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/profile')}
                        >
                            A
                        </motion.div>
                    </div>
                </header>

                {/* Page content */}
                <motion.div
                    key={location.pathname}
                    className="app-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Outlet />
                </motion.div>
            </div>
        </div>
    )
}

export { Icons }
