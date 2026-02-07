import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BudgetSelectorSheet from './BudgetSelectorSheet'
import './BottomNav.css'

const mainNavItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/projects', icon: 'construction', label: 'Projects' },
    { path: '/mla-fund', icon: 'person_search', label: 'MLA Tracker' },
    { path: '/mp-fund-dashboard', icon: 'account_balance', label: 'MP Fund' },
    { path: '/state-budget', icon: 'account_balance', label: 'Budget', isBudget: true }
]

const moreNavItems = [
    { path: '/initiatives', icon: 'verified', label: 'Policies' },
    { path: '/about', icon: 'info', label: 'About' }
]

function BottomNav() {
    const location = useLocation()
    const [isBudgetSheetOpen, setIsBudgetSheetOpen] = useState(false)
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
    const moreMenuRef = useRef(null)

    const isBudgetActive = location.pathname.includes('budget')
    const isMoreActive = moreNavItems.some(item => location.pathname === item.path)

    // Close More menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setIsMoreMenuOpen(false)
            }
        }
        if (isMoreMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMoreMenuOpen])

    // Close More menu on navigation
    useEffect(() => {
        setIsMoreMenuOpen(false)
    }, [location])

    return (
        <>
            <nav className="bottom-nav">
                {mainNavItems.map((item) => (
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

                {/* More Button */}
                <div
                    className={`bottom-nav-item more-btn ${isMoreMenuOpen || isMoreActive ? 'active' : ''}`}
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                >
                    <span className="material-symbols-outlined">
                        {isMoreMenuOpen ? 'close' : 'more_horiz'}
                    </span>
                    <span className="bottom-nav-label">More</span>
                </div>
            </nav>

            {/* More Menu Backdrop */}
            <AnimatePresence>
                {isMoreMenuOpen && (
                    <>
                        <motion.div
                            className="more-menu-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMoreMenuOpen(false)}
                        />
                        <motion.div
                            ref={moreMenuRef}
                            className="more-menu"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="more-menu-header">
                                <div className="drag-handle" />
                                <h3>Explore More</h3>
                            </div>
                            <div className="more-menu-grid">
                                {moreNavItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `more-menu-item ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <div className="more-menu-icon">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <span className="more-menu-label">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BudgetSelectorSheet
                isOpen={isBudgetSheetOpen}
                onClose={() => setIsBudgetSheetOpen(false)}
            />
        </>
    )
}

export default BottomNav
