import { NavLink, useLocation } from 'react-router-dom'
import './BottomNav.css'

const navItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/projects', icon: 'construction', label: 'Projects' },
    { path: '/state-budget', icon: 'account_balance', label: 'Budget' },
    { path: '/mp-fund-dashboard', icon: 'account_balance', label: 'MP Fund' },
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
