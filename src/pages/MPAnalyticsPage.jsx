import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
    getAllMPsForAnalytics,
    getMPsByHouseForAnalytics,
    getMPSpendingBreakdown,
    getCategoryColor,
    getCategoryIcon,
    formatAmountCr
} from '../data/mpAnalyticsLoader'
import Header from '../components/Header'
import CldImage from '../components/CldImage'
import { shareElementAsImage } from '../utils/shareUtils'
import './MPAnalyticsPage.css'

const MPAnalyticsPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [selectedHouse, setSelectedHouse] = useState('all')
    const [selectedMP, setSelectedMP] = useState(location.state?.selectedMP || '')
    const [mpsList, setMpsList] = useState([])
    const [mpData, setMpData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load MPs list based on house filter
    useEffect(() => {
        const loadMPsList = async () => {
            try {
                const list = await getMPsByHouseForAnalytics(selectedHouse)
                setMpsList(list)

                // Auto-select first MP when list changes, unless an MP was passed in state or already selected
                if (list.length > 0 && !selectedMP) {
                    setSelectedMP(list[0].name)
                }
            } catch (error) {
                console.error('Error loading MPs list:', error)
            }
        }
        loadMPsList()
    }, [selectedHouse])

    // Load spending data for selected MP
    useEffect(() => {
        const loadMPStats = async () => {
            if (!selectedMP) return
            setLoading(true)
            try {
                const data = await getMPSpendingBreakdown(selectedMP)
                setMpData(data)
            } catch (error) {
                console.error('Error loading MP spending breakdown:', error)
            } finally {
                setLoading(false)
            }
        }
        loadMPStats()
    }, [selectedMP])

    // Prepare chart data (top 6 + others)
    const chartData = useMemo(() => {
        if (!mpData) return []

        const breakdown = mpData.breakdown
        if (breakdown.length <= 6) {
            return breakdown.map((item, index) => ({
                ...item,
                color: getCategoryColor(index)
            }))
        }

        // Group smaller categories into "Others"
        const top5 = breakdown.slice(0, 5)
        const othersValue = breakdown.slice(5).reduce((sum, item) => sum + item.value, 0)
        const othersPercentage = ((othersValue / mpData.totalExpenditure) * 100).toFixed(1)

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
    }, [mpData])

    // Handle house change
    const handleHouseChange = (e) => {
        setSelectedHouse(e.target.value)
        setSelectedMP('') // Reset MP selection
    }

    // Handle MP change
    const handleMPChange = (e) => {
        setSelectedMP(e.target.value)
    }

    // Handle Share
    const handleShare = () => {
        if (!mpData) return
        shareElementAsImage('analytics-chart-section', {
            title: 'MP Spending Analytics',
            text: `Detailed spending breakdown for ${mpData.displayName} via keralaStory.`,
            fileName: `analytics-${mpData.displayName}.png`.replace(/\s+/g, '-').toLowerCase()
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
        <div className="mp-analytics-page">
            {/* Common Header with Back Button */}
            <Header
                showBack={true}
                title="MP Fund Analytics"
                onBack={() => navigate('/mp-fund-dashboard')}
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
                            <p>MP Fund Analytics</p>
                        </div>
                    </div>

                    <div className="sidebar-filters">
                        <div className="filter-group">
                            <label>House Selection</label>
                            <select value={selectedHouse} onChange={handleHouseChange}>
                                <option value="all">All Houses</option>
                                <option value="lok">Lok Sabha</option>
                                <option value="rajya">Rajya Sabha</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Member of Parliament</label>
                            <select value={selectedMP} onChange={handleMPChange}>
                                {mpsList.map(mp => (
                                    <option key={mp.name} value={mp.name}>
                                        {mp.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {mpData && (
                        <div className="sidebar-stats">
                            <p className="stats-label">Quick Stats</p>
                            <div className="stat-item">
                                <span className="stat-title">Total Spent</span>
                                <span className="stat-value">{formatAmountCr(mpData.totalExpenditure)}</span>
                            </div>
                            <div className="stat-row">
                                <div className="stat-mini">
                                    <span className="stat-mini-label">Categories</span>
                                    <span className="stat-mini-value">{mpData.breakdown.length}</span>
                                </div>
                                <div className="stat-mini">
                                    <span className="stat-mini-label">Top Sector</span>
                                    <span className="stat-mini-value primary">{mpData.breakdown[0]?.shortLabel}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button className="export-btn">
                        <span className="material-symbols-outlined">download</span>
                        Export Report
                    </button>
                </aside>

                {/* Content Area */}
                <div className="analytics-content">
                    {loading && !mpData ? (
                        <div className="loading-container">Loading MP Analytics...</div>
                    ) : (
                        <>
                            {/* Mobile Filters */}
                            <section className="mobile-filters mobile-only">
                                <div className="filter-group">
                                    <label>Select House</label>
                                    <div className="select-wrapper">
                                        <select value={selectedHouse} onChange={handleHouseChange}>
                                            <option value="all">All Houses</option>
                                            <option value="lok">Lok Sabha</option>
                                            <option value="rajya">Rajya Sabha</option>
                                        </select>
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <label>Select Member of Parliament</label>
                                    <div className="select-wrapper">
                                        <select value={selectedMP} onChange={handleMPChange}>
                                            {mpsList.map(mp => (
                                                <option key={mp.name} value={mp.name}>
                                                    {mp.displayName}
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
                                    <Link to="/mp-fund-dashboard">MP Dashboard</Link>
                                    <span className="material-symbols-outlined">chevron_right</span>
                                    <span className={mpData ? '' : 'current'}>
                                        {mpData ? (
                                            <Link to="/mp-analytics" onClick={() => setSelectedMP('')}>Analytics</Link>
                                        ) : 'Analytics'}
                                    </span>
                                    {mpData && (
                                        <>
                                            <span className="material-symbols-outlined">chevron_right</span>
                                            <span className="current">{mpData.displayName}</span>
                                        </>
                                    )}
                                </nav>
                                <div className="header-flex">
                                    <div>
                                        <h2>MP Fund Analytics</h2>
                                        <p>Detailed spending overview for the selected MP</p>
                                    </div>
                                    <button className="share-analytics-btn" onClick={handleShare}>
                                        <span className="material-symbols-outlined">share</span>
                                        <span>Share Analytics</span>
                                    </button>
                                </div>
                            </div>

                            {mpData && (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedMP}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Chart Section with MP Profile */}
                                        <section className="chart-section" id="analytics-chart-section">
                                            {/* MP Profile Card */}
                                            <div className="mp-profile-card">
                                                <div className="profile-avatar">
                                                    {mpData.image ? (
                                                        <CldImage
                                                            src={mpData.image}
                                                            alt={mpData.displayName}
                                                            width={400}
                                                            height={400}
                                                        />
                                                    ) : (
                                                        <span className="material-symbols-outlined">person</span>
                                                    )}
                                                </div>
                                                <div className="profile-info">
                                                    <h3 className="profile-name">{mpData.displayName}</h3>
                                                    <div className="profile-badges">
                                                        <span className={`house-badge ${mpData.house === 'Lok Sabha' ? 'lok' : 'rajya'}`}>
                                                            <span className="material-symbols-outlined">account_balance</span>
                                                            {mpData.house}
                                                        </span>
                                                    </div>
                                                    {/* Extract tenure from name if available */}
                                                    {selectedMP.match(/\(([^)]+)\)/) && (
                                                        <p className="profile-tenure">
                                                            <span className="material-symbols-outlined">calendar_today</span>
                                                            {selectedMP.match(/\(([^)]+)\)/)[1]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Chart Container */}
                                            <div className="chart-wrapper">
                                                {mpData.totalExpenditure === 0 || !mpData.breakdown || mpData.breakdown.length === 0 ? (
                                                    /* Empty State for 0% Utilization */
                                                    <div className="empty-state-card">
                                                        <div className="empty-state-icon">
                                                            <span className="material-symbols-outlined">account_balance_wallet</span>
                                                        </div>
                                                        <h3 className="empty-state-title">No Funds Utilized Yet</h3>
                                                        <p className="empty-state-message">
                                                            This MP has been allocated funds but has not utilized them yet.
                                                            This could indicate a new term or that projects are in the planning stage.
                                                        </p>
                                                        <div className="empty-state-info">
                                                            <span className="material-symbols-outlined">info</span>
                                                            <span>Check back later for spending updates</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Chart and Legend for MPs with spending data */
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
                                                                <span className="center-amount">{formatAmountCr(mpData.totalExpenditure)}</span>
                                                                <span className="center-label">Funds Utilized</span>
                                                            </div>
                                                        </div>

                                                        {/* Legend */}
                                                        <div className="chart-legend">
                                                            {chartData.slice(0, 4).map((item, index) => (
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

                                            {mpData.totalExpenditure > 0 && mpData.breakdown && mpData.breakdown.length > 0 && (
                                                <div className="breakdown-list">
                                                    {mpData.breakdown.map((item, index) => (
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
                                                                        <p className="breakdown-subtitle">{item.label.substring(0, 40)}...</p>
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
        </div>
    )
}

export default MPAnalyticsPage
