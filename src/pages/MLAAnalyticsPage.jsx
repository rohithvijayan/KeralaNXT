import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
    getAllMLAsForAnalytics,
    getMLAsByDistrictForAnalytics,
    getMLASpendingBreakdown,
    getAllDistrictsForAnalytics,
    getCategoryColor,
    getCategoryIcon,
    formatAmountCr,
    getInitials
} from '../data/mlaAnalyticsLoader'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CldImage from '../components/CldImage'
import { shareElementAsImage } from '../utils/shareUtils'
import './MLAAnalyticsPage.css'

const MLAAnalyticsPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [selectedDistrict, setSelectedDistrict] = useState('all')
    const [selectedMLA, setSelectedMLA] = useState(location.state?.selectedMLA || '')
    const [mlasList, setMlasList] = useState([])
    const [mlaData, setMlaData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Get districts for filter
    const districts = useMemo(() => getAllDistrictsForAnalytics(), [])

    // Load MLAs list based on district filter
    useEffect(() => {
        const loadMLAsList = () => {
            try {
                const list = getMLAsByDistrictForAnalytics(selectedDistrict)
                setMlasList(list)

                // Auto-select first MLA when list changes
                if (list.length > 0 && !selectedMLA) {
                    setSelectedMLA(list[0].id)
                }
            } catch (error) {
                console.error('Error loading MLAs list:', error)
            }
        }
        loadMLAsList()
    }, [selectedDistrict])

    // Load spending data for selected MLA
    useEffect(() => {
        const loadMLAStats = async () => {
            if (!selectedMLA) return
            setLoading(true)
            try {
                const data = await getMLASpendingBreakdown(selectedMLA)
                setMlaData(data)
            } catch (error) {
                console.error('Error loading MLA spending breakdown:', error)
            } finally {
                setLoading(false)
            }
        }
        loadMLAStats()
    }, [selectedMLA])

    // Prepare chart data (top 5 + others)
    const chartData = useMemo(() => {
        if (!mlaData || !mlaData.breakdown || mlaData.breakdown.length === 0) return []

        const breakdown = mlaData.breakdown
        if (breakdown.length <= 6) {
            return breakdown.map((item, index) => ({
                ...item,
                color: getCategoryColor(index)
            }))
        }

        // Group smaller categories into "Others"
        const top5 = breakdown.slice(0, 5)
        const othersValue = breakdown.slice(5).reduce((sum, item) => sum + item.value, 0)
        const othersPercentage = mlaData.totalExpenditure > 0
            ? ((othersValue / mlaData.totalExpenditure) * 100).toFixed(1)
            : '0.0'

        return [
            ...top5.map((item, index) => ({
                ...item,
                color: getCategoryColor(index)
            })),
            {
                id: 'others',
                label: 'Others',
                shortLabel: 'Others',
                value: othersValue,
                percentage: othersPercentage,
                color: '#6B7280'
            }
        ]
    }, [mlaData])

    // Handle district change
    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value)
        setSelectedMLA('') // Reset MLA selection
    }

    // Handle MLA change
    const handleMLAChange = (e) => {
        setSelectedMLA(e.target.value)
    }

    // Handle Share
    const handleShare = () => {
        if (!mlaData) return
        shareElementAsImage('mla-analytics-chart-section', {
            title: 'MLA Spending Analytics',
            text: `Detailed spending breakdown for ${mlaData.displayName} via keralaStory.`,
            fileName: `mla-analytics-${mlaData.displayName}.png`.replace(/\s+/g, '-').toLowerCase()
        })
    }

    // Custom tooltip for pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="chart-tooltip">
                    <p className="tooltip-label">{data.shortLabel}</p>
                    <p className="tooltip-value">{formatAmountCr(data.value)}</p>
                    <p className="tooltip-percent">{data.percentage}%</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="mla-analytics-page">
            {/* Common Header with Back Button */}
            <Header
                showBack={true}
                title="MLA Fund Analytics"
                onBack={() => navigate('/mla-fund-dashboard')}
            />

            {/* Main Content */}
            <main className="analytics-main">
                {/* Desktop Sidebar */}
                <aside className="analytics-sidebar desktop-only">
                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <div className="brand-text">
                            <h2>keralaStory</h2>
                            <p>MLA Fund Analytics</p>
                        </div>
                    </div>

                    <div className="sidebar-filters">
                        <div className="filter-group">
                            <label>District Selection</label>
                            <select value={selectedDistrict} onChange={handleDistrictChange}>
                                <option value="all">All Districts</option>
                                {districts.map(district => (
                                    <option key={district.code} value={district.name}>
                                        {district.name} ({district.mlaCount})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Member of Legislative Assembly</label>
                            <select value={selectedMLA} onChange={handleMLAChange}>
                                {mlasList.map(mla => (
                                    <option key={mla.id} value={mla.id}>
                                        {mla.displayName} - {mla.constituency}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {mlaData && (
                        <div className="sidebar-stats">
                            <p className="stats-label">Quick Stats</p>
                            <div className="stat-item">
                                <span className="stat-title">Total Spent</span>
                                <span className="stat-value">{formatAmountCr(mlaData.totalExpenditure)}</span>
                            </div>
                            <div className="stat-row">
                                <div className="stat-mini">
                                    <span className="stat-mini-label">Projects</span>
                                    <span className="stat-mini-value">{mlaData.projectCount}</span>
                                </div>
                                <div className="stat-mini">
                                    <span className="stat-mini-label">Top Sector</span>
                                    <span className="stat-mini-value primary">{mlaData.breakdown[0]?.shortLabel || 'N/A'}</span>
                                </div>
                            </div>

                            <button
                                className="view-detailed-btn"
                                onClick={() => navigate('/mla-projects', { state: { selectedMLA } })}
                            >
                                <span className="material-symbols-outlined">dashboard_customize</span>
                                View Detailed Projects
                            </button>
                        </div>
                    )}


                </aside>

                {/* Content Area */}
                <div className="analytics-content">
                    {loading && !mlaData ? (
                        <div className="loading-container">Loading MLA Analytics...</div>
                    ) : (
                        <>
                            {/* Mobile Filters */}
                            <section className="mobile-filters mobile-only">
                                <div className="filter-group">
                                    <label>Select District</label>
                                    <div className="select-wrapper">
                                        <select value={selectedDistrict} onChange={handleDistrictChange}>
                                            <option value="all">All Districts</option>
                                            {districts.map(district => (
                                                <option key={district.code} value={district.name}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <label>Select MLA</label>
                                    <div className="select-wrapper">
                                        <select value={selectedMLA} onChange={handleMLAChange}>
                                            {mlasList.map(mla => (
                                                <option key={mla.id} value={mla.id}>
                                                    {mla.displayName}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined">person_search</span>
                                    </div>
                                </div>
                                <button className="mobile-share-btn" onClick={handleShare}>
                                    <span className="material-symbols-outlined">share</span>
                                    <span>Share Analytics</span>
                                </button>
                            </section>

                            {/* Desktop Header */}
                            <div className="content-header desktop-only">
                                <nav className="breadcrumb">
                                    <Link to="/">Dashboard</Link>
                                    <span className="material-symbols-outlined">chevron_right</span>
                                    <Link to="/mla-fund-dashboard">MLA Dashboard</Link>
                                    <span className="material-symbols-outlined">chevron_right</span>
                                    <span className={mlaData ? '' : 'current'}>
                                        {mlaData ? (
                                            <Link to="/mla-fund-analytics" onClick={() => setSelectedMLA('')}>Analytics</Link>
                                        ) : 'Analytics'}
                                    </span>
                                    {mlaData && (
                                        <>
                                            <span className="material-symbols-outlined">chevron_right</span>
                                            <span className="current">{mlaData.displayName}</span>
                                        </>
                                    )}
                                </nav>
                                <div className="header-flex">
                                    <div>
                                        <h2>MLA Fund Analytics</h2>
                                        <p>Detailed spending overview for the selected MLA</p>
                                    </div>
                                    <button className="share-analytics-btn" onClick={handleShare}>
                                        <span className="material-symbols-outlined">share</span>
                                        <span>Share Analytics</span>
                                    </button>
                                </div>
                            </div>

                            {mlaData && (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedMLA}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Chart Section with MLA Profile */}
                                        <section className="chart-section" id="mla-analytics-chart-section">
                                            {/* MLA Profile Card */}
                                            <div className="mla-profile-card">
                                                <div className="profile-avatar">
                                                    {mlaData.image ? (
                                                        <CldImage
                                                            src={mlaData.image}
                                                            alt={mlaData.name}
                                                            width={80}
                                                            height={80}
                                                            className="mla-photo"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <span className="avatar-initials">{getInitials(mlaData.name)}</span>
                                                    )}
                                                </div>
                                                <div className="profile-info">
                                                    <h3 className="profile-name">{mlaData.displayName}</h3>
                                                    <div className="profile-badges">
                                                        <span className="constituency-badge">
                                                            <span className="material-symbols-outlined">how_to_vote</span>
                                                            {mlaData.constituency}
                                                        </span>
                                                        <span className="district-badge">
                                                            <span className="material-symbols-outlined">location_on</span>
                                                            {mlaData.district}
                                                        </span>
                                                    </div>
                                                    <p className="profile-projects">
                                                        <span className="material-symbols-outlined">construction</span>
                                                        {mlaData.projectCount} Projects
                                                    </p>

                                                    <button
                                                        className="mobile-view-projects-btn mobile-only"
                                                        onClick={() => navigate('/mla-projects', { state: { selectedMLA } })}
                                                    >
                                                        <span>Detailed Projects Dashboard</span>
                                                        <span className="material-symbols-outlined">arrow_forward</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Chart Container */}
                                            <div className="chart-wrapper">
                                                {mlaData.totalExpenditure === 0 || !mlaData.breakdown || mlaData.breakdown.length === 0 ? (
                                                    /* Empty State for 0 Utilization */
                                                    <div className="empty-state-card">
                                                        <div className="empty-state-icon">
                                                            <span className="material-symbols-outlined">account_balance_wallet</span>
                                                        </div>
                                                        <h3 className="empty-state-title">No Funds Utilized Yet</h3>
                                                        <p className="empty-state-message">
                                                            This MLA has not utilized any funds yet or data is not available.
                                                            Check back later for spending updates.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    /* Chart and Legend */
                                                    <>
                                                        <div className="chart-container">
                                                            <ResponsiveContainer width="100%" height={280}>
                                                                <PieChart>
                                                                    <Pie
                                                                        data={chartData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        innerRadius={70}
                                                                        outerRadius={110}
                                                                        paddingAngle={2}
                                                                        dataKey="value"
                                                                        animationBegin={0}
                                                                        animationDuration={800}
                                                                    >
                                                                        {chartData.map((entry, index) => (
                                                                            <Cell
                                                                                key={`cell-${index}`}
                                                                                fill={entry.color}
                                                                                stroke="none"
                                                                            />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip
                                                                        content={<CustomTooltip />}
                                                                        allowEscapeViewBox={{ x: true, y: true }}
                                                                        offset={20}
                                                                        position={{ y: 0 }}
                                                                        wrapperStyle={{ zIndex: 100 }}
                                                                    />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                            <div className="chart-center">
                                                                <span className="center-amount">{formatAmountCr(mlaData.totalExpenditure)}</span>
                                                                <span className="center-label">Total Spent</span>
                                                            </div>
                                                        </div>

                                                        {/* Legend */}
                                                        <div className="chart-legend">
                                                            {chartData.slice(0, 4).map((item) => (
                                                                <div key={item.id} className="legend-item">
                                                                    <span
                                                                        className="legend-dot"
                                                                        style={{ backgroundColor: item.color }}
                                                                    ></span>
                                                                    <span className="legend-label">{item.shortLabel}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </section>

                                        {/* Spending Breakdown */}
                                        <section className="breakdown-section">
                                            <div className="section-header">
                                                <h3>Spending Breakdown</h3>
                                                <span className="live-badge">Live Data</span>
                                            </div>

                                            {mlaData.totalExpenditure > 0 && mlaData.breakdown && mlaData.breakdown.length > 0 && (
                                                <div className="breakdown-list">
                                                    {mlaData.breakdown.map((item, index) => (
                                                        <motion.div
                                                            key={item.id}
                                                            className="breakdown-card"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                        >
                                                            <div className="breakdown-header">
                                                                <div className="breakdown-info">
                                                                    <div
                                                                        className="breakdown-icon"
                                                                        style={{
                                                                            backgroundColor: `${getCategoryColor(index)}15`,
                                                                            color: getCategoryColor(index)
                                                                        }}
                                                                    >
                                                                        <span className="material-symbols-outlined">
                                                                            {getCategoryIcon(item.label)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="breakdown-text">
                                                                        <p className="breakdown-title">{item.shortLabel}</p>
                                                                        <p className="breakdown-subtitle">{item.label}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="breakdown-values">
                                                                    <p className="breakdown-amount">{formatAmountCr(item.value)}</p>
                                                                    <p
                                                                        className="breakdown-percent"
                                                                        style={{ color: getCategoryColor(index) }}
                                                                    >
                                                                        {item.percentage}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="breakdown-progress">
                                                                <motion.div
                                                                    className="progress-fill"
                                                                    style={{ backgroundColor: getCategoryColor(index) }}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${item.percentage}%` }}
                                                                    transition={{ duration: 0.6, delay: index * 0.05 }}
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <BottomNav />

            {/* Footer Disclaimer */}
            <footer className="mla-footer-disclaimer">
                <div className="disclaimer-content">
                    <span className="material-symbols-outlined">info</span>
                    <p>All Data Is Sourced From Public Government Portal , Data Updation Process Is Ongoing</p>
                </div>
                <p className="copyright">© 2024 KeralaNXT • Transparency Protocol</p>
            </footer>
        </div>
    )
}

export default MLAAnalyticsPage
