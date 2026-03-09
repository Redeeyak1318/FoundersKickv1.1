# Application Routes

## Source: `src/App.jsx`
Routing is handled using React Router DOM.

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NetworkPage from './pages/NetworkPage'
import Profile from './pages/Profile'
import Startups from './pages/Startups'
import About from './pages/About'
import Messages from './pages/Messages'
import AppLayout from './components/layout/AppLayout'

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* App */}
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/network" element={<NetworkPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/startups" element={<Startups />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/about" element={<About />} />
                </Route>
            </Routes>
        </Router>
    )
}
```
