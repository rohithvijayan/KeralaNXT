import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import {
    getBudgetComparison,
    formatAmount,
    BASELINE_YEAR,
    DEFAULT_YEAR,
    getSectorIcon,
    getSectorColor
} from '../data/budgetLoader'
import './BudgetComparisonPage.css'

const BudgetComparisonPage = () => {
    const navigate = useNavigate()
    const [comparison, setComparison] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadComparisonData = async () => {
            setLoading(true)
            try {
                const data = await getBudgetComparison(BASELINE_YEAR, DEFAULT_YEAR)
                setComparison(data)
            } catch (error) {
                console.error('Error loading budget comparison:', error)
            } finally {
                setLoading(false)
            }
        }
        loadComparisonData()
    }, [])

    if (loading || !comparison) return <div className="loading-container">Loading Comparison Data...</div>

    return (
        <div className="comparison-page">
            <Header
                showBack
                title="Budget Comparison"
                onBack={() => navigate('/state-budget')}
            />

            {/* Desktop Breadcrumb */}
            <nav className="comparison-breadcrumb desktop-only">
                <Link to="/state-budget">Budget</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <span className="current">Comparison</span>
            </nav>

            {/* Hero Section */}
            <section className="comparison-hero">
                <div className="hero-badge">
                    <span className="material-symbols-outlined">compare_arrows</span>
                    <span>Year-over-Year Analysis</span>
                </div>
                <h1 className="hero-title">Budget Delta Analysis</h1>
                <p className="hero-subtitle">
                    Comparing <span className="year-baseline">{comparison.yearA}</span> vs{' '}
                    <span className="year-future">{comparison.yearB}</span>
                </p>
            </section>

            {/* Macro Indicators Dashboard */}
            <section className="macro-comparison-section">
                <div className="macro-grid">
                    <div className="macro-card">
                        <span className="macro-label">GSDP GROWTH</span>
                        <div className="macro-main">
                            <span className="macro-value">+{comparison.gsdpDelta}%</span>
                            <div className="macro-trend positive">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                        </div>
                        <p className="macro-desc">Economic expansion outpacing inflation</p>
                    </div>
                    <div className="macro-card">
                        <span className="macro-label">FISCAL DEFICIT</span>
                        <div className="macro-main">
                            <span className="macro-value">{comparison.statsB.fiscalDeficitPercent}%</span>
                            <div className={`macro-trend ${parseFloat(comparison.deficitDelta) <= 0 ? 'positive' : 'negative'}`}>
                                <span className="material-symbols-outlined">
                                    {parseFloat(comparison.deficitDelta) <= 0 ? 'arrow_downward' : 'arrow_upward'}
                                </span>
                            </div>
                        </div>
                        <p className="macro-desc">{Math.abs(comparison.deficitDelta)}% shift in fiscal gap</p>
                    </div>
                    <div className="macro-card">
                        <span className="macro-label">DEBT / GSDP</span>
                        <div className="macro-main">
                            <span className="macro-value">{comparison.statsB.debtPercent}%</span>
                            <div className={`macro-trend ${parseFloat(comparison.debtDelta) <= 0 ? 'positive' : 'negative'}`}>
                                <span className="material-symbols-outlined">
                                    {parseFloat(comparison.debtDelta) <= 0 ? 'check_circle' : 'warning'}
                                </span>
                            </div>
                        </div>
                        <p className="macro-desc">{Math.abs(comparison.debtDelta).toFixed(2)}% reduction in debt ratio</p>
                    </div>
                </div>
            </section>

            {/* KPI Comparison Cards */}
            <section className="comparison-kpi-section">
                <div className="kpi-grid">
                    <motion.article
                        className="kpi-compare-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="kpi-icon"><span className="material-symbols-outlined">payments</span></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Outlay</span>
                            <span className="kpi-value">{formatAmount(comparison.statsB.totalBudget)}</span>
                        </div>
                        <div className={`kpi-delta ${parseFloat(comparison.totalBudgetDelta) >= 0 ? 'positive' : 'negative'}`}>
                            <span className="material-symbols-outlined">
                                {parseFloat(comparison.totalBudgetDelta) >= 0 ? 'trending_up' : 'trending_down'}
                            </span>
                            <span>{comparison.totalBudgetDelta}%</span>
                        </div>
                    </motion.article>

                    <motion.article
                        className="kpi-compare-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="kpi-icon capex"><span className="material-symbols-outlined">domain</span></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Capital Expenditure</span>
                            <span className="kpi-value">{formatAmount(comparison.statsB.capitalExpenditure)}</span>
                        </div>
                        <div className={`kpi-delta ${parseFloat(comparison.capexDelta) >= 0 ? 'positive' : 'negative'}`}>
                            <span className="material-symbols-outlined">
                                {parseFloat(comparison.capexDelta) >= 0 ? 'trending_up' : 'trending_down'}
                            </span>
                            <span>{comparison.capexDelta}%</span>
                        </div>
                    </motion.article>

                    <motion.article
                        className="kpi-compare-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="kpi-icon revex"><span className="material-symbols-outlined">sync_alt</span></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Revenue Expenditure</span>
                            <span className="kpi-value">{formatAmount(comparison.statsB.revenueExpenditure)}</span>
                        </div>
                        <div className={`kpi-delta ${parseFloat(comparison.revexDelta) >= 0 ? 'positive' : 'negative'}`}>
                            <span className="material-symbols-outlined">
                                {parseFloat(comparison.revexDelta) >= 0 ? 'trending_up' : 'trending_down'}
                            </span>
                            <span>{comparison.revexDelta}%</span>
                        </div>
                    </motion.article>
                </div>
            </section>

            {/* Sector Comparison */}
            <section className="sector-comparison-section">
                <div className="section-header">
                    <div>
                        <h2>Sector-wise Comparison</h2>
                        <span className="section-subtitle">Comparing allocations between fiscal cycles</span>
                    </div>
                    <div className="legend">
                        <div className="legend-item">
                            <span className="legend-dot baseline"></span>
                            <span>{comparison.yearA}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot future"></span>
                            <span>{comparison.yearB}</span>
                        </div>
                    </div>
                </div>

                <div className="sector-chart-list">
                    {comparison.sectorDeltas.slice(0, 6).map((sector, idx) => {
                        const maxAlloc = Math.max(...comparison.sectorDeltas.map(s => s.totalAllocation))
                        const baselineWidth = (sector.baselineAllocation / maxAlloc) * 100
                        const futureWidth = (sector.totalAllocation / maxAlloc) * 100
                        const deltaValue = parseFloat(sector.delta)

                        return (
                            <motion.div
                                key={sector.key}
                                className="sector-row"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                            >
                                <div className="sector-row-header">
                                    <div className="sector-name-icon">
                                        <div className="sector-icon" style={{ background: getSectorColor(sector.key) }}>
                                            <span className="material-symbols-outlined">{getSectorIcon(sector.key)}</span>
                                        </div>
                                        <span className="sector-name">{sector.name.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className={`sector-delta ${deltaValue >= 0 ? 'positive' : 'negative'}`}>
                                        {deltaValue > 0 ? '+' : ''}{sector.delta}%
                                    </div>
                                </div>
                                <div className="sector-bars">
                                    <div className="bar-row">
                                        <div className="bar-baseline" style={{ width: `${baselineWidth}%` }}></div>
                                    </div>
                                    <div className="bar-row">
                                        <motion.div
                                            className="bar-future"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${futureWidth}%` }}
                                            transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                                        ></motion.div>
                                    </div>
                                </div>
                                <div className="sector-amounts">
                                    <span className="amount-baseline">{formatAmount(sector.baselineAllocation)}</span>
                                    <span className="amount-future">{formatAmount(sector.totalAllocation)}</span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </section>

            {/* Analysis Insight Summary */}
            <section className="comparison-summary-section">
                <div className="summary-card">
                    <div className="summary-icon">
                        <span className="material-symbols-outlined">insights</span>
                    </div>
                    <div className="summary-content">
                        <h3>Fiscal Evolution Summary</h3>
                        <p>
                            The {comparison.yearB} budget demonstrates a strategic shift toward
                            <strong> macroeconomic stability</strong> with a {Math.abs(comparison.deficitDelta)}%
                            reduction in fiscal deficit ratio. While total expenditure grew by {comparison.totalBudgetDelta}%,
                            the emphasis remains on {parseFloat(comparison.capexDelta) > parseFloat(comparison.revexDelta) ? 'Capital Outlay' : 'maintaining social commitments'}
                            to ensure long-term regional growth.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA to Projects */}
            <section className="comparison-cta-section">
                <button className="btn-explore-projects" onClick={() => navigate(`/budget-projects?year=${comparison.yearB}`)}>
                    <span className="material-symbols-outlined">construction</span>
                    Explore All Projects
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </section>
        </div>
    )
}

export default BudgetComparisonPage
