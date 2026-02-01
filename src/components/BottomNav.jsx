import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import BudgetSelectorSheet from './BudgetSelectorSheet'
import './BottomNav.css'

const navItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/projects', icon: 'construction', label: 'Projects' },
    { path: '/state-budget', icon: 'account_balance', label: 'Budget', isBudget: true },
    { path: '/mp-fund-dashboard', icon: 'account_balance', label: 'MP Fund' },
    { path: '/initiatives', icon: 'verified', label: 'Policies' },
    { path: '/about', icon: 'info', label: 'About' }
]

function BottomNav() {
    const location = useLocation()
    const [isBudgetSheetOpen, setIsBudgetSheetOpen] = useState(false)

    const isBudgetActive = location.pathname.includes('budget')

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                item.isBudget ? (
                    <div
                        key={item.path}
                        className={`bottom-nav-item ${isBudgetActive ? 'active' : ''}`}
                        onClick={() => setIsBudgetSheetOpen(true)}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="bottom-nav-label">{item.label}</span>
                    </div>
                ) : (
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
                )
            ))}
            <BudgetSelectorSheet
                isOpen={isBudgetSheetOpen}
                onClose={() => setIsBudgetSheetOpen(false)}
            />
        </nav>
    )
}

export default BottomNav
