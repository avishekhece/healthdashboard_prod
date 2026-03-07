import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, PlusCircle, Settings, LogOut } from 'lucide-react'

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HD'

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-dot" />
                    <span>HealthDash</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/services/add" className={({ isActive }) => isActive ? 'active' : ''}>
                        <PlusCircle size={18} />
                        <span>Add Service</span>
                    </NavLink>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="avatar">{initials}</div>
                        <div className="sidebar-user-info">
                            <div className="name">{user?.name || 'User'}</div>
                            <div className="plan">{user?.plan || 'FREE'} Plan</div>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={14} style={{ marginRight: 6 }} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}
