import { useState, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import {
    getDashboardStats,
    getExpenditureBreakdown,
    getSectors,
    filterProjects,
    getPolicies,
    formatAmount,
    formatPercentage,
    getSectorIcon,
    getSectorColor
} from '../data/budgetLoader'
import BudgetRevenueChart from '../components/BudgetRevenueChart'
import './BudgetPage.css'

function BudgetPage() {
    const navigate = useNavigate()

    // Data
    const stats = useMemo(() => getDashboardStats(), [])
    const expenditure = useMemo(() => getExpenditureBreakdown(), [])
    const sectors = useMemo(() => getSectors(), [])
    const policies = useMemo(() => getPolicies(), [])

    // State
    const [activeSector, setActiveSector] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sectorPage, setSectorPage] = useState(0) // 0 for first 4, 1 for next 4

    // Handlers
    const handleSectorClick = useCallback((sectorKey) => {
        setActiveSector(sectorKey)
    }, [])

    return (
        <div className="budget-page">
            <Header
                showBack
                title="State Budget 2025-26"
                onBack={() => navigate('/')}
            />

            {/* Desktop Breadcrumb */}
            <nav className="budget-breadcrumb desktop-only" aria-label="Breadcrumb">
                <Link to="/">Dashboard</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <span className="current">State Budget</span>
            </nav>

            {/* Hero Section */}
            <section className="budget-hero" aria-label="Budget Overview">
                <div className="hero-badge">
                    <span className="live-dot" aria-hidden="true"></span>
                    <span>FY 2025-26</span>
                </div>
                <h1 className="hero-amount">{formatAmount(stats.totalBudget)}</h1>
                <p className="hero-label">Total State Budget</p>

                {/* Mini trend bars */}
                <div className="hero-trend" aria-hidden="true">
                    {[35, 55, 75, 60, 85, 70, 100].map((h, i) => (
                        <div
                            key={i}
                            className="trend-bar"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>

                <button
                    className="hero-share-btn"
                    aria-label="Share budget overview"
                >
                    <span className="material-symbols-outlined">share</span>
                </button>
            </section>

            {/* KPI Cards - Horizontal Scroll on Mobile */}
            <section className="kpi-section" aria-label="Key Performance Indicators">
                <div className="kpi-scroll">
                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.totalBudget)}</span>
                            <span className="kpi-label">Total Allocated</span>
                        </div>
                        <div className="kpi-trend positive">
                            <span className="material-symbols-outlined">trending_up</span>
                            <span>+5.2%</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">architecture</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.capitalExpenditure)}</span>
                            <span className="kpi-label">Capital Exp.</span>
                        </div>
                        <div className="kpi-trend">
                            <span>{stats.capexPercent}%</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">sync_alt</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.revenueExpenditure)}</span>
                            <span className="kpi-label">Revenue Exp.</span>
                        </div>
                        <div className="kpi-trend">
                            <span>{stats.revexPercent}%</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{stats.projectCount}</span>
                            <span className="kpi-label">Projects</span>
                        </div>
                        <div className="kpi-trend positive">
                            <span className="material-symbols-outlined">trending_up</span>
                            <span>+12%</span>
                        </div>
                    </article>
                </div>
            </section>

            {/* Revenue Visualization Section */}
            <BudgetRevenueChart />

            {/* Sector Allocation Section */}
            <section className="sector-section" aria-label="Sector-wise Allocation">
                <div className="section-header">
                    <div>
                        <h2>Sector-wise Allocation</h2>
                        <span className="section-subtitle">Showing top 8 sectors by amount</span>
                    </div>
                </div>

                <div className="sector-list-wrapper">
                    {/* Navigation Buttons for Mobile */}
                    <button
                        className="sector-nav-btn prev"
                        onClick={() => setSectorPage(0)}
                        disabled={sectorPage === 0}
                        aria-label="Previous sectors"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    <div className="sector-list">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={sectorPage}
                                className="sector-grid-mobile"
                                initial={{ opacity: 0, x: sectorPage === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: sectorPage === 0 ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {sectors.slice(sectorPage * 4, (sectorPage + 1) * 4).map((sector, index) => (
                                    <motion.button
                                        key={sector.key}
                                        className={`sector-card ${activeSector === sector.key ? 'active' : ''}`}
                                        onClick={() => handleSectorClick(sector.key)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        aria-pressed={activeSector === sector.key}
                                    >
                                        <div
                                            className="sector-icon"
                                            style={{ background: getSectorColor(sector.key) }}
                                        >
                                            <span className="material-symbols-outlined">
                                                {getSectorIcon(sector.key)}
                                            </span>
                                        </div>
                                        <div className="sector-info">
                                            <span className="sector-name">{sector.name}</span>
                                            <span className="sector-amount">{formatAmount(sector.totalAllocation)}</span>
                                        </div>
                                        <div className="sector-meta">
                                            <span className="sector-projects">{sector.count} projects</span>
                                            <div className="sector-bar">
                                                <div
                                                    className="sector-bar-fill"
                                                    style={{
                                                        width: `${(sector.totalAllocation / sectors[0].totalAllocation) * 100}%`,
                                                        background: getSectorColor(sector.key)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined sector-arrow">chevron_right</span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Desktop View (Show all 8) */}
                        <div className="sector-grid-desktop">
                            {sectors.slice(0, 8).map((sector, index) => (
                                <motion.button
                                    key={sector.key}
                                    className={`sector-card ${activeSector === sector.key ? 'active' : ''}`}
                                    onClick={() => handleSectorClick(sector.key)}
                                    aria-pressed={activeSector === sector.key}
                                >
                                    <div
                                        className="sector-icon"
                                        style={{ background: getSectorColor(sector.key) }}
                                    >
                                        <span className="material-symbols-outlined">
                                            {getSectorIcon(sector.key)}
                                        </span>
                                    </div>
                                    <div className="sector-info">
                                        <span className="sector-name">{sector.name}</span>
                                        <span className="sector-amount">{formatAmount(sector.totalAllocation)}</span>
                                    </div>
                                    <div className="sector-meta">
                                        <span className="sector-projects">{sector.count} projects</span>
                                        <div className="sector-bar">
                                            <div
                                                className="sector-bar-fill"
                                                style={{
                                                    width: `${(sector.totalAllocation / sectors[0].totalAllocation) * 100}%`,
                                                    background: getSectorColor(sector.key)
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined sector-arrow">chevron_right</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="sector-nav-btn next"
                        onClick={() => setSectorPage(1)}
                        disabled={sectorPage === 1}
                        aria-label="Next sectors"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </section>

            {/* Budget Projects CTA */}
            <section className="projects-cta-section" aria-label="Budget Projects">
                <div className="projects-cta-card">
                    <div className="cta-icon-wrap">
                        <span className="material-symbols-outlined">engineering</span>
                    </div>
                    <div className="cta-content">
                        <h2>State Budget Projects</h2>
                        <p>Detailed breakdown of {stats.projectCount} infrastructure, healthcare, and educational initiatives from the 2025-26 Budget.</p>
                        <div className="cta-stats-inline">
                            <div className="cta-stat-item">
                                <span className="stat-unit">{stats.projectCount}</span>
                                <span className="stat-desc">Projects</span>
                            </div>
                            <div className="cta-stat-item">
                                <span className="stat-unit">{sectors.length}</span>
                                <span className="stat-desc">Sectors</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/budget-projects" className="cta-action-btn">
                        <span>View All Projects</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <div className="cta-bg-elements" aria-hidden="true">
                        <span className="material-symbols-outlined">construction</span>
                        <span className="material-symbols-outlined">apartment</span>
                        <span className="material-symbols-outlined">local_hospital</span>
                    </div>
                </div>
            </section>

            {/* Project Grid */}


            {/* Policy Insights CTA */}
            <section className="policy-cta-section" aria-label="Policy Insights">
                <div className="policy-cta-card">
                    <div className="cta-icon">
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div className="cta-content">
                        <h2>Budget Policy Insights</h2>
                        <p>Discover {policies.reduce((a, c) => a + c.policies.length, 0)} strategic policies and vision frameworks guiding Kerala's development</p>
                    </div>
                    <Link to="/policy-insights" className="cta-button">
                        <span>Explore Policies</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <div className="cta-decoration" aria-hidden="true">
                        <span className="material-symbols-outlined">policy</span>
                        <span className="material-symbols-outlined">gavel</span>
                        <span className="material-symbols-outlined">trending_up</span>
                    </div>
                </div>
            </section>

            {/* Footer Note */}
            <footer className="budget-footer">
                <div className="footer-note">
                    <span className="material-symbols-outlined">info</span>
                    <div>
                        <strong>Data Source</strong>
                        <p>Citizen's Guide to Budget 2025-26, Government of Kerala</p>
                    </div>
                </div>
            </footer>
        </div >
    )
}

export default BudgetPage
