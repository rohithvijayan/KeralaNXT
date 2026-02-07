import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CldImage from '../components/CldImage'
import {
    getAggregateStats,
    getTopMLAs,
    getTopDistricts,
    formatAmount,
    getInitials
} from '../data/mlaFundLoader'
import './MLAFundLandingPage.css'

// Sector icon and color mapping
const sectorConfig = {
    'Road': { icon: 'directions_car', color: 'blue' },
    'Infrastructure': { icon: 'apartment', color: 'indigo' },
    'Healthcare': { icon: 'favorite', color: 'rose' },
    'Education': { icon: 'school', color: 'amber' },
    'Electricity': { icon: 'bolt', color: 'yellow' },
    'Irrigation': { icon: 'water_drop', color: 'cyan' },
    'Sports': { icon: 'emoji_events', color: 'emerald' },
    'Others': { icon: 'more_horiz', color: 'slate' }
}

function MLAFundLandingPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    // Load real data from mlaFundLoader
    const aggregateStats = useMemo(() => getAggregateStats(), [])
    const topMLAsData = useMemo(() => getTopMLAs(3), [])
    const topDistrictsData = useMemo(() => getTopDistricts(3), [])

    useEffect(() => {
        // Data is loaded synchronously via import.meta.glob, just set loading false
        setLoading(false)
    }, [])

    // Compute stats object from real data
    const stats = useMemo(() => ({
        totalExpenditure: formatAmount(aggregateStats.totalExpenditure),
        yoyGrowth: '+18%', // This would need historical data to compute
        totalMLAs: aggregateStats.totalMLAs,
        totalDistricts: aggregateStats.totalDistricts,
        totalSectors: aggregateStats.sectorBreakdown?.length || 8,
        lastUpdated: 'Feb 2026'
    }), [aggregateStats])

    // Transform top MLAs for display
    const topMLAs = useMemo(() => topMLAsData.map((mla, index) => ({
        id: index + 1,
        name: mla.name.replace(/^(Shri|Smt)\s+/i, ''),
        constituency: mla.constituency,
        amount: formatAmount(mla.totalExpenditure),
        initials: getInitials(mla.name),
        image: mla.image
    })), [topMLAsData])

    // Transform top districts for display
    const topDistricts = useMemo(() => {
        const maxExp = topDistrictsData[0]?.totalExpenditure || 1
        return topDistrictsData.map((district, index) => ({
            id: index + 1,
            name: district.name,
            percent: Math.round((district.totalExpenditure / maxExp) * 100),
            amount: formatAmount(district.totalExpenditure)
        }))
    }, [topDistrictsData])

    // Transform sectors for display
    const sectors = useMemo(() => {
        return (aggregateStats.sectorBreakdown || []).slice(0, 8).map((sector, index) => {
            const config = sectorConfig[sector.label] || { icon: 'category', color: 'slate' }
            return {
                id: index + 1,
                name: sector.label,
                icon: config.icon,
                amount: formatAmount(sector.value_crores),
                color: config.color
            }
        })
    }, [aggregateStats])

    const handleExploreDashboard = () => {
        navigate('/mla-projects')
    }

    if (loading) {
        return <div className="loading-container">Loading MLA Fund Data...</div>
    }

    return (
        <div className="mla-landing">
            <Header
                showBack
                title="MLA Fund Insights"
                onBack={() => navigate('/')}
            />

            <main className="mla-landing-content">
                {/* Page Title Section - Desktop Only */}
                <div className="page-title-section">
                    <h1 className="page-title">
                        MLA Fund <span className="gradient-text">Insights</span>
                    </h1>
                    <p className="page-subtitle">
                        Real-time analytics and distribution tracking of the Kerala State MLA Development Funds.
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="bento-grid">
                    {/* Hero Card */}
                    <motion.section
                        className="hero-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="hero-glow" />
                        <div className="hero-grid-pattern">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>

                        <div className="hero-content">
                            <span className="hero-badge">Fiscal Year 2024-25</span>

                            <div className="hero-main">
                                <p className="hero-label">Cumulative State-wide Expenditure</p>
                                <div className="hero-amount-row">
                                    <h2 className="hero-amount">{stats.totalExpenditure}</h2>
                                    <span className="hero-growth">
                                        <span className="material-symbols-outlined">trending_up</span>
                                        {stats.yoyGrowth}
                                    </span>
                                </div>
                            </div>

                            <div className="hero-stats">
                                <div className="hero-stat">
                                    <p className="hero-stat-value">{stats.totalMLAs}</p>
                                    <p className="hero-stat-label">Active MLAs</p>
                                </div>
                                <div className="hero-stat">
                                    <p className="hero-stat-value">{stats.totalDistricts}</p>
                                    <p className="hero-stat-label">Districts</p>
                                </div>
                                <div className="hero-stat">
                                    <p className="hero-stat-value">{stats.totalSectors}</p>
                                    <p className="hero-stat-label">Fund Sectors</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Top MLAs Card */}
                    <motion.section
                        className="top-mlas-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="card-header">
                            <div className="card-header-left">
                                <div className="card-icon amber">
                                    <span className="material-symbols-outlined">emoji_events</span>
                                </div>
                                <h3>Top Performers</h3>
                            </div>
                            <button className="view-all-btn">All</button>
                        </div>

                        <div className="mlas-list">
                            {topMLAs.map((mla, index) => (
                                <motion.div
                                    key={mla.id}
                                    className="mla-item"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                    <div className="mla-avatar-wrapper">
                                        <div className="mla-avatar">
                                            {mla.image ? (
                                                <CldImage
                                                    src={mla.image}
                                                    alt={mla.name}
                                                    width={60}
                                                    height={60}
                                                    className="mla-photo"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                mla.initials
                                            )}
                                        </div>
                                        {index === 0 && <span className="top-badge" />}
                                    </div>
                                    <div className="mla-info">
                                        <p className="mla-name">{mla.name}</p>
                                        <p className="mla-party">{mla.constituency}</p>
                                    </div>
                                    <div className="mla-amount">{mla.amount}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="card-actions">
                            <button className="card-cta" onClick={() => navigate('/mla-fund-dashboard')}>
                                View MLA Dashboard
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <button className="compare-btn" onClick={() => navigate('/mla-comparison')}>
                                <span>Compare MLAs</span>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </motion.section>

                    {/* Sectors Card */}
                    <motion.section
                        className="sectors-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="card-header">
                            <div className="card-header-left">
                                <div className="card-icon emerald">
                                    <span className="material-symbols-outlined">pie_chart</span>
                                </div>
                                <div>
                                    <h3>Sectoral Distribution</h3>
                                    <p className="card-subtitle">Breakdown by project category</p>
                                </div>
                            </div>
                        </div>

                        <div className="sectors-grid">
                            {sectors.map((sector, index) => (
                                <motion.div
                                    key={sector.id}
                                    className={`sector-item sector-${sector.color}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                                    whileHover={{ scale: 1.03, y: -4 }}
                                >
                                    <div className="sector-icon-wrapper">
                                        <span className="material-symbols-outlined">{sector.icon}</span>
                                    </div>
                                    <p className="sector-name">{sector.name}</p>
                                    <p className="sector-amount">{sector.amount}</p>
                                    <span className="sector-external material-symbols-outlined">open_in_new</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Districts Card */}
                    <motion.section
                        className="districts-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="districts-bg-icon">
                            <span className="material-symbols-outlined">location_on</span>
                        </div>

                        <h3>Regional Performance</h3>

                        <div className="districts-list">
                            {topDistricts.map((district, index) => (
                                <div key={district.id} className="district-item">
                                    <div className="district-header">
                                        <div>
                                            <span className="district-rank">Rank #0{index + 1}</span>
                                            <p className="district-name">{district.name}</p>
                                        </div>
                                        <div className="district-stats">
                                            <span className="district-amount">{district.amount}</span>
                                            <span className="district-percent">{district.percent}% Utilization</span>
                                        </div>
                                    </div>
                                    <div className="district-progress">
                                        <motion.div
                                            className={`district-progress-fill gradient-${index + 1}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${district.percent}%` }}
                                            transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card-actions">
                            <button className="compare-btn" onClick={() => navigate('/district-comparison')}>
                                <span>Compare Districts</span>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>

                        </div>
                    </motion.section>

                    {/* CTA Section */}
                    <motion.section
                        className="cta-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="cta-outer">
                            <div className="cta-inner">
                                <div className="cta-grid-pattern">
                                    <span className="material-symbols-outlined">grid_view</span>
                                </div>

                                <div className="cta-content">
                                    <h4>Access Granular Project Data</h4>
                                    <p>View individual project data, completion certificates, and contractor details for every constituency.</p>
                                </div>

                                <button className="cta-button" onClick={handleExploreDashboard}>
                                    <span>View All Projects</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Footer */}
                <footer className="mla-footer">
                    <p>All Data Is Sourced From Public Government Portal , Data Updation Process Is Ongoing</p>
                    <p>© 2025 KeralaNXT • Transparency Protocol • Data updated {stats.lastUpdated}</p>
                </footer>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    )
}

export default MLAFundLandingPage
