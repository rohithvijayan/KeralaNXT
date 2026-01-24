import { NavLink, useLocation } from 'react-router-dom'
import './BottomNav.css'

const navItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/projects', icon: 'construction', label: 'Projects' },
    { path: '/mp-funds', icon: 'account_balance', label: 'MP Funds' },
    { path: '/initiatives', icon: 'verified', label: 'Policies' },
    { path: '/about', icon: 'info', label: 'About' }
]

function BottomNav() {
    const location = useLocation()

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `bottom-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="bottom-nav-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    )
}

export default BottomNav
