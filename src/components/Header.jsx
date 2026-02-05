import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import BudgetSelectorSheet from './BudgetSelectorSheet'
import './Header.css'

function Header({
    showBack = false,
    title = null,
    onBack,
    centerContent = null,
    rightContent = null,
    showActions = true
}) {
    const navigate = useNavigate()
    const location = useLocation()
    const [isBudgetPopupOpen, setIsBudgetPopupOpen] = useState(false)

    const handleBack = () => {
        if (onBack) onBack()
        else navigate(-1)
    }

    const isBudgetActive = location.pathname.includes('budget')

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    {showBack ? (
                        <button className="header-back-btn" onClick={handleBack} aria-label="Go back">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    ) : null}

                    <Link to="/" className="header-brand">
                        <div className="header-logo-icon">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <h1 className="header-logo-text">
                            kerala<span>Story</span>
                        </h1>
                    </Link>
                </div>

                {centerContent && (
                    <div className="header-center">
                        {centerContent}
                    </div>
                )}

                {title && !centerContent && (
                    <div className="header-center">
                        <h1 className="header-title-text">{title}</h1>
                    </div>
                )}

                <div className="header-right">
                    {rightContent}
                    {showActions && !rightContent && (
                        <nav className="header-nav desktop-only">
                            <Link to="/projects" className="header-nav-link">Projects</Link>
                            <div
                                className={`header-nav-link ${isBudgetActive ? 'active' : ''}`}
                                onClick={() => setIsBudgetPopupOpen(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                Budget
                            </div>
                            <Link to="/initiatives" className="header-nav-link">Policies</Link>
                            <Link to="/mla-fund" className="header-nav-link">Track Your MLA</Link>
                            <Link to="/mp-fund-dashboard" className="header-nav-link">MP Fund</Link>
                            <Link to="/about" className="header-nav-link">About</Link>
                        </nav>
                    )}
                </div>
            </div>

            <BudgetSelectorSheet
                isOpen={isBudgetPopupOpen}
                onClose={() => setIsBudgetPopupOpen(false)}
            />
        </header>
    )
}

export default Header
