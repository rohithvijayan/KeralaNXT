import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import {
    getFiscalOverview,
    getRevenueBreakdown,
    getExpenditureBreakdown,
    getProjectHighlights,
    getSectors,
    getPolicies,
    getPolicyCount,
    getSectorIcon,
    getSectorColor,
    formatAmount,
    DEFAULT_YEAR,
    getDashboardStats
} from '../data/budgetLoader'
import BudgetRevenueChart from '../components/BudgetRevenueChart'
import './BudgetPage.css'

const BudgetPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const selectedYear = searchParams.get('year') || DEFAULT_YEAR

    // State
    const [fiscalData, setFiscalData] = useState(null)
    const [stats, setStats] = useState(null)
    const [sectors, setSectors] = useState([])
    const [policies, setPolicies] = useState([])
    const [loading, setLoading] = useState(true)

    const [activeSector, setActiveSector] = useState('all')
    const [sectorPage, setSectorPage] = useState(0)

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            const overview = getFiscalOverview(selectedYear)
            const dashboardStats = getDashboardStats(selectedYear)
            const sectorData = getSectors(selectedYear)
            const policyData = getPolicies(selectedYear)

            setFiscalData(overview)
            setStats(dashboardStats)
            setSectors(sectorData)
            setPolicies(policyData)
            setLoading(false)
        }, 300)
    }, [selectedYear])

    if (loading || !stats) {
        return <div className="loading-container">Loading Budget Details...</div>
    }

    return (
        <div className="budget-page">
            <Header
                showBack
                title={`State Budget ${selectedYear}`}
                onBack={() => navigate('/state-budget')}
            />

            <nav className="budget-breadcrumb desktop-only">
                <Link to="/state-budget">Budget</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <span className="current">Details {selectedYear}</span>
            </nav>

            <section className="budget-hero">
                <div className="hero-badge">
                    <span className="live-dot" aria-hidden="true"></span>
                    <span>FY {selectedYear}</span>
                </div>
                <h1 className="hero-amount">{formatAmount(stats.totalBudget)}</h1>
                <p className="hero-label">Total State Budget</p>

                <div className="header-actions-inline">
                    <button className="hero-share-btn">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </div>
            </section>

            <section className="compare-cta-section">
                <button className="compare-cta-btn" onClick={() => navigate('/budget-comparison')}>
                    <div className="compare-cta-content">
                        <span className="material-symbols-outlined">compare_arrows</span>
                        <div>
                            <h3>Compare Budget Years</h3>
                            <p>Analyze spending differences between FY 2025-26 and 2026-27</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined compare-arrow">arrow_forward</span>
                </button>
            </section>

            <section className="kpi-section">
                <div className="kpi-scroll">
                    <article className="kpi-card">
                        <div className="kpi-icon"><span className="material-symbols-outlined">payments</span></div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.totalBudget)}</span>
                            <span className="kpi-label">Total Allocated</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon"><span className="material-symbols-outlined">architecture</span></div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.capitalExpenditure)}</span>
                            <span className="kpi-label">Capital Exp. ({stats.capexPercent}%)</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon"><span className="material-symbols-outlined">sync_alt</span></div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.revenueExpenditure)}</span>
                            <span className="kpi-label">Revenue Exp. ({stats.revexPercent}%)</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon"><span className="material-symbols-outlined">inventory_2</span></div>
                        <div className="kpi-content">
                            <span className="kpi-value">{stats.projectCount}</span>
                            <span className="kpi-label">Active Projects</span>
                        </div>
                    </article>
                </div>
            </section>

            <BudgetRevenueChart fiscalYear={selectedYear} />

            <section className="sector-section">
                <div className="section-header">
                    <div>
                        <h2>Sector-wise Allocation</h2>
                        <span className="section-subtitle">Showing priority sectors for {selectedYear}</span>
                    </div>
                </div>

                <div className="sector-list-wrapper">
                    <button
                        className="sector-nav-btn prev"
                        onClick={() => setSectorPage(0)}
                        disabled={sectorPage === 0}
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    <div className="sector-list">
                        <div className="sector-grid-desktop">
                            {sectors.slice(0, 8).map((sector) => (
                                <button
                                    key={sector.key}
                                    className={`sector-card ${activeSector === sector.key ? 'active' : ''}`}
                                    onClick={() => setActiveSector(sector.key)}
                                >
                                    <div className="sector-icon" style={{ background: getSectorColor(sector.key) }}>
                                        <span className="material-symbols-outlined">{getSectorIcon(sector.key)}</span>
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
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="sector-nav-btn next"
                        onClick={() => setSectorPage(1)}
                        disabled={sectorPage === 1}
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </section>

            <section className="projects-cta-section">
                <div className="projects-cta-card">
                    <div className="cta-icon-wrap"><span className="material-symbols-outlined">engineering</span></div>
                    <div className="cta-content">
                        <h2>State Budget Projects {selectedYear}</h2>
                        <p>Detailed breakdown of {stats.projectCount} initiatives from the {selectedYear} Budget roadmap.</p>
                    </div>
                    <Link to={`/budget-projects?year=${selectedYear}`} className="cta-action-btn">
                        <span>View All Projects</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </section>

            <section className="projects-cta-section">
                <div className="projects-cta-card policy-card">
                    <div className="cta-icon-wrap policy"><span className="material-symbols-outlined">policy</span></div>
                    <div className="cta-content">
                        <h2>Budget Policy Insights</h2>
                        <p>Key policy directions and fiscal strategy highlights from {selectedYear}.</p>
                    </div>
                    <Link to={`/policy-insights?year=${selectedYear}`} className="cta-action-btn">
                        <span>Explore Policies</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </section>

            <footer className="budget-footer">
                <div className="footer-note">
                    <span className="material-symbols-outlined">info</span>
                    <div>
                        <strong>Data Source</strong>
                        <p>Citizen's Guide to Budget {selectedYear}, Government of Kerala</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default BudgetPage
