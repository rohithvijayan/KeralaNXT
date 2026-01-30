import { Link } from 'react-router-dom'
import './Header.css'

function Header({ showBack = false, title = "KeralaStory", onBack }) {
    return (
        <header className="header">
            <div className="header-content">
                {showBack ? (
                    <button className="header-back-btn" onClick={onBack} aria-label="Go back">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                ) : (
                    <Link to="/" className="header-logo">
                        <div className="header-logo-icon">
                            <span className="material-symbols-outlined">map</span>
                        </div>
                        <div className="header-logo-text">
                            <h1>{title}</h1>
                        </div>
                    </Link>
                )}

                {showBack && (
                    <h1 className="header-title-center">{title}</h1>
                )}

                {!showBack && (
                    <nav className="header-nav">
                        <Link to="/" className="header-nav-link active">Home</Link>
                        <Link to="/projects" className="header-nav-link">Projects</Link>
                        <Link to="/state-budget" className="header-nav-link">Budget</Link>
                        <Link to="/initiatives" className="header-nav-link">Policies & Initiatives</Link>
                        <Link to="/mp-fund-dashboard" className="header-nav-link">MP Fund Dashboard</Link>
                        <Link to="/about" className="header-nav-link">About</Link>
                    </nav>
                )}

            </div>
        </header>
    )
}

export default Header
