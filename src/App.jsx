import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NetworkPage from './pages/NetworkPage'
import Startups from './pages/Startups'
import Launchpad from './pages/Launchpad'
import Messages from './pages/Messages'
import Insights from './pages/Insights'
import Resources from './pages/Resources'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AppLayout from './components/layout/AppLayout'

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected App Routes */}
                    <Route element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/network" element={<NetworkPage />} />
                        <Route path="/startups" element={<Startups />} />
                        <Route path="/launchpad" element={<Launchpad />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    )
}