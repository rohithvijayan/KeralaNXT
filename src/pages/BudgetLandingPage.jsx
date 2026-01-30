import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    getFiscalOverview,
    getDashboardStats,
    getBudgetComparison,
    formatAmount,
    DEFAULT_YEAR,
    BASELINE_YEAR
} from '../data/budgetLoader'
import Header from '../components/Header'
import { shareElementAsImage } from '../utils/shareUtils'
import './BudgetLandingPage.css'

const BudgetLandingPage = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Initialize year from URL if present, otherwise default
    const urlYear = searchParams.get('year')
    const [selectedYear, setSelectedYear] = useState(urlYear || DEFAULT_YEAR)

    const [stats, setStats] = useState(null)
    const [overview, setOverview] = useState(null)
    const [comparison, setComparison] = useState(null)
    const [loading, setLoading] = useState(true)

    // Sync year from URL if it changes
    useEffect(() => {
        const urlYear = searchParams.get('year')
        if (urlYear && (urlYear === BASELINE_YEAR || urlYear === DEFAULT_YEAR)) {
            setSelectedYear(urlYear)
        }
    }, [searchParams])

    useEffect(() => {
        const loadBudgetSummary = async () => {
            setLoading(true)
            try {
                const [dashboardStats, fiscalOverview] = await Promise.all([
                    getDashboardStats(selectedYear),
                    getFiscalOverview(selectedYear)
                ])

                setStats(dashboardStats)
                setOverview(fiscalOverview)

                if (selectedYear === DEFAULT_YEAR) {
                    const compData = await getBudgetComparison(BASELINE_YEAR, DEFAULT_YEAR)
                    setComparison(compData)
                } else {
                    setComparison(null)
                }
            } catch (error) {
                console.error('Error loading budget data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadBudgetSummary()
    }, [selectedYear])

    const handleYearToggle = (year) => {
        setSelectedYear(year)
        setSearchParams({ year })
    }

    const handleShare = () => {
        shareElementAsImage('budget-share-card', {
            title: `Kerala State Budget ${selectedYear}`,
            text: `Check out the Kerala State Budget allocation for ${selectedYear} on keralaStory!`,
            fileName: `kerala-budget-${selectedYear}.png`,
            backgroundColor: '#0c1613'
        });
    };

    if (loading || !stats || !overview) return <div className="loading-container">Loading Budget Overview...</div>

    return (
        <div className="budget-landing-container">
            <Header
                showBack
                onBack={() => navigate('/')}
                centerContent={
                    <div className="year-switcher-pills">
                        <button
                            className={`pill-btn ${selectedYear === BASELINE_YEAR ? 'active' : ''}`}
                            onClick={() => handleYearToggle(BASELINE_YEAR)}
                        >
                            2025-26
                        </button>
                        <button
                            className={`pill-btn ${selectedYear === DEFAULT_YEAR ? 'active' : ''}`}
                            onClick={() => handleYearToggle(DEFAULT_YEAR)}
                        >
                            2026-27
                        </button>
                    </div>
                }
                rightContent={
                    <>
                        <div className="nav-actions desktop-only">
                            <button className="icon-btn share-nav-btn" onClick={handleShare} title="Share Budget Overview">
                                <span className="material-symbols-outlined">share</span>
                            </button>

                        </div>
                        <button className="icon-btn share-nav-btn mobile-only" onClick={handleShare} aria-label="Share Budget">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </>
                }
            />

            <main className="landing-content">
                <div className="hero-glow-effect"></div>

                {/* Desktop Breadcrumb */}
                <nav className="budget-breadcrumb desktop-only" aria-label="Breadcrumb">
                    <Link to="/">Dashboard</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <span className="current">State Budget</span>
                </nav>

                <div id="budget-share-card">
                    <section className="hero-section">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="verified-badge"
                        >
                            <span className="material-symbols-outlined">verified</span>
                            State Fiscal Overview {selectedYear}
                        </motion.div>

                        <h1 className="hero-title">Total Expenditure Allocation</h1>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={selectedYear}
                            className="hero-amount-wrapper"
                        >
                            <p className="hero-amount">
                                {formatAmount(stats.totalBudget, false)}
                            </p>
                            {comparison && (
                                <div className={`trend-indicator ${parseFloat(comparison.totalBudgetDelta) >= 0 ? 'positive' : 'negative'}`}>
                                    <span className="material-symbols-outlined">
                                        {parseFloat(comparison.totalBudgetDelta) >= 0 ? 'trending_up' : 'trending_down'}
                                    </span>
                                    <span>{comparison.totalBudgetDelta}%</span>
                                    <span className="vs-label">vs Last Fiscal Year</span>
                                </div>
                            )}
                        </motion.div>
                    </section>

                    <div className="landing-stats-container">
                        <div className="primary-actions">
                            <button className="btn-primary-lrg" onClick={() => navigate(`/budget-details?year=${selectedYear}`)}>
                                View Full Report
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            {selectedYear === '2026-27' && (
                                <button className="btn-highlight-lrg" onClick={() => navigate('/budget-highlights')}>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Top Highlights
                                </button>
                            )}
                            <button className="btn-secondary-lrg" onClick={() => navigate('/budget-comparison')}>
                                Compare Budgets
                            </button>
                        </div>

                        <div className="stats-grid">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="glass-card stat-card"
                            >
                                <div className="card-header">
                                    <div className="icon-box revenue">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    {comparison && (
                                        <span className={`delta-badge ${parseFloat(comparison.revexDelta) >= 0 ? 'positive' : 'negative'}`}>
                                            {parseFloat(comparison.revexDelta) > 0 ? '+' : ''}{comparison.revexDelta}%
                                        </span>
                                    )}
                                </div>
                                <h3 className="card-label">Revenue Expenditure</h3>
                                <p className="card-value">
                                    {formatAmount(stats.revenueExpenditure, true)}
                                </p>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${stats.revexPercent}%` }}></div>
                                </div>
                                <p className="card-hint">Consumes {stats.revexPercent}% of annual allocation</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="glass-card stat-card highlight"
                            >
                                <div className="card-header">
                                    <div className="icon-box capex">
                                        <span className="material-symbols-outlined">domain</span>
                                    </div>
                                    {comparison && (
                                        <span className={`delta-badge ${parseFloat(comparison.capexDelta) >= 0 ? 'positive' : 'negative'}`}>
                                            {parseFloat(comparison.capexDelta) > 0 ? '+' : ''}{comparison.capexDelta}%
                                        </span>
                                    )}
                                </div>
                                <h3 className="card-label">Capital Expenditure</h3>
                                <p className="card-value">
                                    {formatAmount(stats.capitalExpenditure, true)}
                                </p>
                                <div className="progress-bar-container">
                                    <div className="progress-bar highlight" style={{ width: `${stats.capexPercent}%` }}></div>
                                </div>
                                <p className="card-hint">High growth infrastructure focus</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="glass-card stat-card"
                            >
                                <div className="card-header">
                                    <div className="icon-box projects">
                                        <span className="material-symbols-outlined">construction</span>
                                    </div>
                                    <span className="delta-badge">+5.1%</span>
                                </div>
                                <h3 className="card-label">Active Infrastructure</h3>
                                <p className="card-value">
                                    {stats.projectCount} <span className="value-unit">Projects</span>
                                </p>
                                <div className="project-segments">
                                    <div className="segment filled"></div>
                                    <div className="segment filled partial"></div>
                                    <div className="segment empty"></div>
                                    <div className="segment empty"></div>
                                </div>
                                <p className="card-hint">72% currently on schedule</p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <section className="cta-grid">
                    <div className="cta-text">
                        <h2 className="section-title">Strategic Regional Development <br /> & Sustainability Goals</h2>
                        <p className="section-desc">
                            The {selectedYear} budget focuses heavily on digital infrastructure and sustainable agricultural practices,
                            aiming to increase the state's GDP contribution through technological intervention.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="footer-stats">
                    <div className="footer-stat">
                        <span className="stat-label">DEBT TO GSDP</span>
                        <span className="stat-value">{overview.debtPercent}%</span>
                    </div>
                    <div className="footer-stat">
                        <span className="stat-label">FISCAL DEFICIT</span>
                        <span className="stat-value">{overview.fiscalDeficitPercent}%</span>
                    </div>
                    <div className="footer-stat">
                        <span className="stat-label">SOCIAL SECTOR</span>
                        <span className="stat-value">₹28,400 Cr</span>
                    </div>
                    <div className="footer-stat highlight">
                        <span className="stat-label">HEALTH INDEX</span>
                        <span className="stat-value">#1 National</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default BudgetLandingPage
