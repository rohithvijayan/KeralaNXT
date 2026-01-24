import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import {
    getAllMPs,
    getMPsByHouse,
    sortMPs,
    searchMPs,
    calculateTotals,
    getPerformanceLevel,
    getPerformanceColor,
    formatAmount,
    formatPercentage
} from '../data/mpFundLoader'
import './MPDashboardPage.css'

const houseOptions = [
    { id: 'all', label: 'All Houses' },
    { id: 'lok', label: 'Lok Sabha' },
    { id: 'rajya', label: 'Rajya Sabha' }
]

const sortOptions = [
    { id: 'rank', label: 'Performance (Rank)' },
    { id: 'name', label: 'Alphabetical' },
    { id: 'utilized', label: 'Fund Utilized' },
    { id: 'percent', label: '% Utilization' }
]

function MPDashboardPage() {
    const navigate = useNavigate()

    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedHouse, setSelectedHouse] = useState('all')
    const [sortBy, setSortBy] = useState('rank')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9

    // Get all MPs and calculate totals
    const allMPs = useMemo(() => getAllMPs(), [])
    const globalStats = useMemo(() => calculateTotals(allMPs), [allMPs])

    // Current stats based on selected house filter
    const currentStats = useMemo(() => {
        const mps = getMPsByHouse(selectedHouse)
        return calculateTotals(mps)
    }, [selectedHouse])

    // Get label for current view
    const currentHouseLabel = houseOptions.find(h => h.id === selectedHouse)?.label || 'All Houses'

    // Filter and sort MPs
    const filteredMPs = useMemo(() => {
        let mps = getMPsByHouse(selectedHouse)
        mps = searchMPs(mps, searchQuery)
        mps = sortMPs(mps, sortBy)
        return mps
    }, [selectedHouse, searchQuery, sortBy])

    // Pagination
    const totalPages = Math.ceil(filteredMPs.length / itemsPerPage)
    const paginatedMPs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredMPs.slice(start, start + itemsPerPage)
    }, [filteredMPs, currentPage])

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [selectedHouse, searchQuery, sortBy])

    // House-specific stats
    const houseStats = useMemo(() => {
        const lokMPs = getMPsByHouse('lok')
        const rajyaMPs = getMPsByHouse('rajya')
        return {
            lok: calculateTotals(lokMPs),
            rajya: calculateTotals(rajyaMPs)
        }
    }, [])

    return (
        <div className="mp-dashboard">
            {/* Mobile Header */}
            <Header
                showBack
                title="MP Fund Dashboard"
                onBack={() => navigate('/')}
            />

            <div className="mp-layout">
                {/* Desktop Sidebar */}
                <aside className="mp-sidebar">
                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <h2>KeralaNXT</h2>
                    </div>

                    <div className="sidebar-content">
                        {/* Global Summary */}
                        <div className="sidebar-section">
                            <p className="section-title">Total Statistics</p>
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <div className="stat-header">
                                        <span className="material-symbols-outlined stat-icon">account_balance_wallet</span>
                                        <span className="stat-badge">FY24</span>
                                    </div>
                                    <p className="stat-label">Total Allocated</p>
                                    <p className="stat-value">{formatAmount(currentStats.totalAllocated)}</p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-header">
                                        <span className="material-symbols-outlined stat-icon">payments</span>
                                        <span className="stat-badge positive">+2.4%</span>
                                    </div>
                                    <p className="stat-label">Total Utilized</p>
                                    <p className="stat-value">{formatAmount(currentStats.totalUtilised)}</p>
                                </div>
                                <div className="stat-card progress-card">
                                    <div className="progress-ring-container">
                                        <svg className="progress-ring" viewBox="0 0 36 36">
                                            <circle
                                                className="progress-ring-bg"
                                                cx="18" cy="18" r="16"
                                                fill="none"
                                                strokeWidth="3"
                                            />
                                            <circle
                                                className="progress-ring-fill"
                                                cx="18" cy="18" r="16"
                                                fill="none"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${currentStats.overallPercent}, 100`}
                                            />
                                        </svg>
                                        <span className="progress-ring-value">{Math.round(currentStats.overallPercent)}%</span>
                                    </div>
                                    <div className="progress-info">
                                        <p className="stat-label">Overall Rate</p>
                                        <p className="stat-value-sm">{currentHouseLabel} ({currentStats.totalMPs} MPs)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* By House Stats */}
                        <div className="sidebar-section">
                            <p className="section-title">By House</p>
                            <div className="house-stats">
                                <div className="house-stat">
                                    <div className="house-stat-header">
                                        <span>Lok Sabha</span>
                                        <span className="house-count">{houseStats.lok.totalMPs} MPs</span>
                                    </div>
                                    <div className="mini-progress">
                                        <div
                                            className="mini-progress-fill"
                                            style={{ width: `${houseStats.lok.overallPercent}%` }}
                                        />
                                    </div>
                                    <span className="house-percent">{houseStats.lok.overallPercent}%</span>
                                </div>
                                <div className="house-stat">
                                    <div className="house-stat-header">
                                        <span>Rajya Sabha</span>
                                        <span className="house-count">{houseStats.rajya.totalMPs} MPs</span>
                                    </div>
                                    <div className="mini-progress">
                                        <div
                                            className="mini-progress-fill"
                                            style={{ width: `${houseStats.rajya.overallPercent}%` }}
                                        />
                                    </div>
                                    <span className="house-percent">{houseStats.rajya.overallPercent}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="sidebar-nav">
                            <p className="section-title">Navigation</p>
                            <a href="#" className="nav-item active">
                                <span className="material-symbols-outlined">dashboard</span>
                                <span>Dashboard</span>
                            </a>
                            <a href="#" className="nav-item">
                                <span className="material-symbols-outlined">bar_chart</span>
                                <span>Analytics</span>
                            </a>
                            <a href="#" className="nav-item">
                                <span className="material-symbols-outlined">description</span>
                                <span>Reports</span>
                            </a>
                        </nav>
                    </div>

                    {/* User Profile */}
                    <div className="sidebar-footer">
                        <div className="user-avatar">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="user-info">
                            <p className="user-name">Admin User</p>
                            <p className="user-role">Government Officer</p>
                        </div>
                        <span className="material-symbols-outlined logout-icon">logout</span>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="mp-main">
                    {/* Mobile Hero Card */}
                    <div className="mp-hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-label">{currentHouseLabel} Fund Overview</p>
                                <h1 className="hero-amount">{formatAmount(currentStats.totalAllocated)}</h1>
                            </div>
                            <div className="hero-icon-wrapper">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                        </div>
                        <div className="hero-progress-section">
                            <div className="hero-progress-header">
                                <p>Utilization Progress</p>
                                <p className="hero-percent">{currentStats.overallPercent}%</p>
                            </div>
                            <div className="hero-progress-bar">
                                <div
                                    className="hero-progress-fill"
                                    style={{ width: `${currentStats.overallPercent}%` }}
                                />
                            </div>
                            <p className="hero-footnote">{currentStats.totalMPs} MPs | Data updated Jan 2026</p>
                        </div>
                    </div>

                    {/* Desktop Page Header */}
                    <header className="page-header">
                        <div className="page-header-content">
                            <h1 className="page-title">MP Fund Utilization Dashboard</h1>
                            <p className="page-subtitle">Detailed financial oversight of MP fund allocation and utilization across Kerala.</p>
                        </div>
                        <div className="header-actions">
                            <div className="search-wrapper">
                                <span className="material-symbols-outlined search-icon">search</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search MP or Constituency..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="notification-btn">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                        </div>
                    </header>

                    {/* Filters Bar */}
                    <section className="filters-bar">
                        <div className="house-toggle">
                            {houseOptions.map(option => (
                                <button
                                    key={option.id}
                                    className={`house-pill ${selectedHouse === option.id ? 'active' : ''}`}
                                    onClick={() => setSelectedHouse(option.id)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Search */}
                        <div className="mobile-search">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search MP by name or constituency"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="sort-wrapper">
                            <span className="sort-label">Sort by:</span>
                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* MP Cards Grid */}
                    <section className="mp-cards-section">
                        <div className="section-header mobile-only">
                            <h3>MP Performance Ranking</h3>
                            <span className="view-all">View All</span>
                        </div>

                        <motion.div
                            className="mp-cards-grid"
                            layout
                        >
                            <AnimatePresence mode="popLayout">
                                {paginatedMPs.map((mp, index) => (
                                    <motion.div
                                        key={mp.name}
                                        className={`mp-card ${mp.performanceLevel}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                    >
                                        <div className="card-glow" />
                                        <div className="mp-card-header">
                                            <div className="mp-info">
                                                <div className="mp-avatar-wrapper">
                                                    {mp.image ? (
                                                        <img
                                                            src={mp.image}
                                                            alt={mp.name}
                                                            className="mp-avatar"
                                                        />
                                                    ) : (
                                                        <div className="mp-avatar-placeholder">
                                                            <span className="material-symbols-outlined">person</span>
                                                        </div>
                                                    )}
                                                    <span className={`rank-badge ${mp.Rank <= 3 ? 'top-3' : mp.performanceLevel}`}>
                                                        #{mp.Rank}
                                                    </span>
                                                </div>
                                                <div className="mp-details">
                                                    <h3 className="mp-name">{mp.name}</h3>
                                                    <div className="mp-constituency">
                                                        <span className="material-symbols-outlined">location_on</span>
                                                        {mp.constituency}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="party-badge">{mp.party}</span>
                                        </div>

                                        <div className="mp-card-body">
                                            <div className="utilization-header">
                                                <span className="util-label">Utilization</span>
                                                <span
                                                    className="util-percent"
                                                    style={{ color: getPerformanceColor(mp.percentValue) }}
                                                >
                                                    {formatPercentage(mp.percentValue)}
                                                </span>
                                            </div>
                                            <div className="progress-bar">
                                                <motion.div
                                                    className={`progress-fill ${mp.performanceLevel}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${mp.percentValue}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                            <div className="fund-details">
                                                <div className="fund-item">
                                                    <span className="fund-label">Allocated</span>
                                                    <span className="fund-value">{mp.allocatedFund}</span>
                                                </div>
                                                <div className="fund-item">
                                                    <span className="fund-label">Spent</span>
                                                    <span className="fund-value spent">{mp.utilisedFund}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredMPs.length === 0 && (
                            <div className="empty-state">
                                <span className="material-symbols-outlined">search_off</span>
                                <p>No MPs found matching your criteria</p>
                            </div>
                        )}
                    </section>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <footer className="pagination">
                            <p className="pagination-info">
                                Showing <span>{paginatedMPs.length}</span> of <span>{filteredMPs.length}</span> Members of Parliament
                            </p>
                            <div className="pagination-controls">
                                <button
                                    className="pagination-btn prev"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    className="pagination-btn next"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next Page
                                </button>
                            </div>
                        </footer>
                    )}
                </main>
            </div>
        </div>
    )
}

export default MPDashboardPage
