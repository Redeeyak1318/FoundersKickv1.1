import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Wraps routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * Shows nothing while auth state is loading to prevent flash.
 */
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        // Minimal loading state — prevents layout flash
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0E1116',
                color: '#E2E8F0',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <div style={{
                        width: 40, height: 40,
                        border: '3px solid rgba(249,115,22,0.2)',
                        borderTopColor: '#F97316',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        )
    }

    if (!user) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}
