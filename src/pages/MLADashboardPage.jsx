import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CldImage from '../components/CldImage'
import { Spotlight } from '../components/ui/Spotlight'
import {
    getAllMLAs,
    getMLAsByDistrict,
    searchMLAs,
    sortMLAs,
    getAggregateStats,
    getAllDistricts,
    formatAmount,
    getInitials
} from '../data/mlaFundLoader'
import './MLADashboardPage.css'

const districtOptions = [
    { id: 'all', label: 'All Districts' },
    { id: 'Thiruvananthapuram', label: 'Trivandrum' },
    { id: 'Kollam', label: 'Kollam' },
    { id: 'Pathanamthitta', label: 'Pathanamthitta' },
    { id: 'Alappuzha', label: 'Alappuzha' },
    { id: 'Kottayam', label: 'Kottayam' },
    { id: 'Idukki', label: 'Idukki' },
    { id: 'Ernakulam', label: 'Ernakulam' },
    { id: 'Thrissur', label: 'Thrissur' },
    { id: 'Palakkad', label: 'Palakkad' },
    { id: 'Malappuram', label: 'Malappuram' },
    { id: 'Kozhikode', label: 'Kozhikode' },
    { id: 'Wayanad', label: 'Wayanad' },
    { id: 'Kannur', label: 'Kannur' },
    { id: 'Kasaragod', label: 'Kasaragod' }
]

const sortOptions = [
    { id: 'expenditure', label: 'Expenditure (High → Low)' },
    { id: 'name', label: 'Alphabetical' },
    { id: 'district', label: 'District' },
    { id: 'projects', label: 'Project Count' }
]

function MLADashboardPage() {
    const navigate = useNavigate()

    // State
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('mla_searchQuery') || '')
    const [selectedDistricts, setSelectedDistricts] = useState(() => {
        const saved = sessionStorage.getItem('mla_selectedDistricts')
        return saved ? JSON.parse(saved) : ['all']
    })
    const [tempSelectedDistricts, setTempSelectedDistricts] = useState(() => {
        const saved = sessionStorage.getItem('mla_selectedDistricts')
        return saved ? JSON.parse(saved) : ['all']
    })
    const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
    const [sortBy, setSortBy] = useState(() => sessionStorage.getItem('mla_sortBy') || 'expenditure')
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = sessionStorage.getItem('mla_currentPage')
        return saved ? parseInt(saved, 10) : 1
    })
    const [loading, setLoading] = useState(true)
    const [allMLAs, setAllMLAs] = useState([])
    const [globalStats, setGlobalStats] = useState({ totalExpenditure: 0, totalProjects: 0, totalMLAs: 0, totalDistricts: 0 })
    const [districtStats, setDistrictStats] = useState([])

    const itemsPerPage = 12

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true)
            try {
                const mlas = getAllMLAs()
                const stats = getAggregateStats()
                const districts = getAllDistricts()

                setAllMLAs(mlas)
                setGlobalStats(stats)
                setDistrictStats(districts.slice(0, 5))
            } catch (error) {
                console.error('Error loading MLA data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [])

    // Current stats based on selected district filter
    const currentStats = useMemo(() => {
        const isAllSelected = selectedDistricts.includes('all')
        if (isAllSelected) {
            return globalStats
        }

        let districtMLAs = []
        selectedDistricts.forEach(d => {
            districtMLAs = [...districtMLAs, ...getMLAsByDistrict(d)]
        })

        const totalExp = districtMLAs.reduce((sum, mla) => sum + mla.totalExpenditure, 0)
        const totalProj = districtMLAs.reduce((sum, mla) => sum + mla.projectCount, 0)
        return {
            totalExpenditure: totalExp,
            totalProjects: totalProj,
            totalMLAs: districtMLAs.length
        }
    }, [selectedDistricts, globalStats])

    const currentDistrictLabel = useMemo(() => {
        if (selectedDistricts.includes('all')) return 'All Districts'
        if (selectedDistricts.length === 1) {
            return districtOptions.find(d => d.id === selectedDistricts[0])?.label || selectedDistricts[0]
        }
        return `${selectedDistricts.length} Districts`
    }, [selectedDistricts])

    // Filter and sort MLAs
    const filteredMLAs = useMemo(() => {
        let mlas = []
        if (selectedDistricts.includes('all')) {
            mlas = allMLAs
        } else {
            selectedDistricts.forEach(d => {
                mlas = [...mlas, ...getMLAsByDistrict(d)]
            })
        }
        mlas = searchMLAs(mlas, searchQuery)
        mlas = sortMLAs(mlas, sortBy)
        return mlas
    }, [selectedDistricts, searchQuery, sortBy, allMLAs])

    // Pagination
    const totalPages = Math.ceil(filteredMLAs.length / itemsPerPage)
    const paginatedMLAs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredMLAs.slice(start, start + itemsPerPage)
    }, [filteredMLAs, currentPage])

    // Reset to page 1 when filters change (unless it's the initial load with saved state)
    useEffect(() => {
        const isFirstRender = !allMLAs.length
        if (!isFirstRender) {
            setCurrentPage(1)
        }
    }, [selectedDistricts, searchQuery, sortBy])

    // Persist states to sessionStorage
    useEffect(() => {
        sessionStorage.setItem('mla_searchQuery', searchQuery)
    }, [searchQuery])

    useEffect(() => {
        sessionStorage.setItem('mla_selectedDistricts', JSON.stringify(selectedDistricts))
    }, [selectedDistricts])

    useEffect(() => {
        sessionStorage.setItem('mla_sortBy', sortBy)
    }, [sortBy])

    useEffect(() => {
        sessionStorage.setItem('mla_currentPage', currentPage.toString())
    }, [currentPage])

    // Get rank for an MLA
    const getRank = (mla) => {
        return allMLAs.findIndex(m => m.id === mla.id) + 1
    }

    // Get performance level based on rank
    const getPerformanceLevel = (rank) => {
        if (rank <= 20) return 'high'
        if (rank <= 70) return 'medium'
        return 'low'
    }

    const toggleDistrict = (districtId) => {
        setTempSelectedDistricts(prev => {
            if (districtId === 'all') return ['all']
            const withoutAll = prev.filter(id => id !== 'all')

            if (withoutAll.includes(districtId)) {
                const updated = withoutAll.filter(id => id !== districtId)
                return updated.length === 0 ? ['all'] : updated
            } else {
                return [...withoutAll, districtId]
            }
        })
    }

    const handleApplyFilters = () => {
        setSelectedDistricts(tempSelectedDistricts)
        setIsFilterSidebarOpen(false)
    }

    const handleOpenSidebar = () => {
        setTempSelectedDistricts(selectedDistricts)
        setIsFilterSidebarOpen(true)
    }


    if (loading) {
        return <div className="loading-container">Loading MLA Fund Data...</div>
    }

    return (
        <div className="mla-dashboard">
            {/* Mobile Header */}
            <Header
                showBack
                title="MLA Fund Dashboard"
                onBack={() => navigate('/mla-fund')}
            />

            <div className="mla-layout">
                {/* Desktop Sidebar */}
                <aside className="mla-sidebar">
                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <h2>keralaStory</h2>
                    </div>

                    <div className="sidebar-content">
                        <div className="sidebar-section">
                            <p className="section-title">Total Statistics</p>
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <div className="stat-header">
                                        <span className="material-symbols-outlined stat-icon">payments</span>
                                        <span className="stat-badge">FY25</span>
                                    </div>
                                    <p className="stat-label">Total Expenditure</p>
                                    <p className="stat-value">{formatAmount(currentStats.totalExpenditure)}</p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-header">
                                        <span className="material-symbols-outlined stat-icon">task_alt</span>
                                        <span className="stat-badge positive">Active</span>
                                    </div>
                                    <p className="stat-label">Total Projects</p>
                                    <p className="stat-value">{currentStats.totalProjects?.toLocaleString()}</p>
                                </div>
                                <div className="stat-card progress-card">
                                    <div className="progress-ring-container">
                                        <svg className="progress-ring" viewBox="0 0 36 36">
                                            <circle className="progress-ring-bg" cx="18" cy="18" r="16" fill="none" strokeWidth="3" />
                                            <circle className="progress-ring-fill" cx="18" cy="18" r="16" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray="100, 100" />
                                        </svg>
                                        <span className="progress-ring-value">{currentStats.totalMLAs}</span>
                                    </div>
                                    <div className="progress-info">
                                        <p className="stat-label">Active MLAs</p>
                                        <p className="stat-value-sm">{currentDistrictLabel}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <p className="section-title">Top Districts (Expenditure)</p>
                            <div className="district-stats">
                                {(() => {
                                    const maxExp = Math.max(...districtStats.map(d => d.totalExpenditure), 1);
                                    return districtStats.map(district => (
                                        <div key={district.code} className="district-stat">
                                            <div className="district-stat-header">
                                                <span>{district.name}</span>
                                                <span className="district-count">{formatAmount(district.totalExpenditure)}</span>
                                            </div>
                                            <div className="mini-progress">
                                                <div className="mini-progress-fill" style={{ width: `${(district.totalExpenditure / maxExp) * 100}%` }} />
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <nav className="sidebar-nav">
                            <p className="section-title">Navigation</p>
                            <a href="/mla-fund-dashboard" className="nav-item active">
                                <span className="material-symbols-outlined">dashboard</span>
                                <span>Dashboard</span>
                            </a>
                            <a href="/mla-comparison" className="nav-item">
                                <span className="material-symbols-outlined">compare_arrows</span>
                                <span>Comparison</span>
                            </a>
                            <a href="/mla-fund" className="nav-item">
                                <span className="material-symbols-outlined">insights</span>
                                <span>Overview</span>
                            </a>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="mla-main">
                    {/* Mobile Hero Card */}
                    <div className="mla-hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-label">{currentDistrictLabel} Fund Overview</p>
                                <h1 className="hero-amount">{formatAmount(currentStats.totalExpenditure)}</h1>
                            </div>
                            <div className="hero-actions">
                                <div className="hero-icon-wrapper">
                                    <span className="material-symbols-outlined">trending_up</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-progress-section">
                            <div className="hero-progress-header">
                                <p>Projects Tracked</p>
                                <p className="hero-percent">{currentStats.totalProjects?.toLocaleString()}</p>
                            </div>
                            <div className="hero-progress-bar">
                                <div className="hero-progress-fill" style={{ width: '75%' }} />
                            </div>
                            <p className="hero-footnote">{currentStats.totalMLAs} MLAs | Data updated Feb 2026</p>
                        </div>
                    </div>

                    {/* Desktop Page Header with Spotlight Animation */}
                    <header className="page-header">
                        {/* Spotlight Animation */}
                        <Spotlight
                            gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(158, 84%, 50%, .15) 0, hsla(158, 84%, 40%, .05) 50%, hsla(158, 84%, 30%, 0) 80%)"
                            gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(158, 84%, 50%, .10) 0, hsla(158, 84%, 40%, .03) 80%, transparent 100%)"
                            gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(158, 84%, 50%, .08) 0, hsla(158, 84%, 30%, .02) 80%, transparent 100%)"
                            translateY={-150}
                            width={300}
                            height={600}
                            smallWidth={140}
                            duration={10}
                            xOffset={40}
                        />

                        <div className="page-header-inner">
                            <nav className="breadcrumb">
                                <Link to="/">Dashboard</Link>
                                <span className="material-symbols-outlined">chevron_right</span>
                                <Link to="/mla-fund">MLA Fund</Link>
                                <span className="material-symbols-outlined">chevron_right</span>
                                <span className="current">MLA Dashboard</span>
                            </nav>
                            <div className="page-header-content">
                                <h1 className="page-title">MLA Fund Dashboard</h1>
                                <p className="page-subtitle">Detailed constituency-level fund tracking and project metrics across Kerala.</p>
                            </div>
                            <div className="header-actions">
                                <div className="desktop-search">
                                    <span className="material-symbols-outlined search-icon">search</span>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search MLA or Constituency..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="desktop-filter-trigger"
                                    onClick={handleOpenSidebar}
                                >
                                    <span className="material-symbols-outlined">tune</span>
                                    <span>Filter Districts</span>
                                    {selectedDistricts.length > 0 && !selectedDistricts.includes('all') && (
                                        <span className="filter-count-badge">{selectedDistricts.length}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Filters Bar - Fixed/Pills for Mobile, Hidden for Desktop */}
                    <section className="filters-bar mobile-only">
                        <div className="district-toggle">
                            {districtOptions.map(option => (
                                <button
                                    key={option.id}
                                    className={`district-pill ${selectedDistricts.includes(option.id) ? 'active' : ''}`}
                                    onClick={() => setSelectedDistricts([option.id])}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="mobile-search">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search MLA by name or constituency"
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
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </section>

                    <AnimatePresence>
                        {isFilterSidebarOpen && (
                            <>
                                <motion.div
                                    className="filter-overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsFilterSidebarOpen(false)}
                                />
                                <motion.div
                                    className="filter-sidebar-popup"
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                >
                                    <div className="filter-sidebar-header">
                                        <h3>Filter Districts</h3>
                                        <button className="close-filter-btn" onClick={() => setIsFilterSidebarOpen(false)}>
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                    <div className="filter-sidebar-content">
                                        <p className="filter-subtitle">Select one or more districts to filter the dashboard results.</p>
                                        <div className="filter-options-grid">
                                            {districtOptions.map(option => (
                                                <label key={option.id} className={`filter-option ${tempSelectedDistricts.includes(option.id) ? 'active' : ''}`}>
                                                    <div className="filter-checkbox">
                                                        {tempSelectedDistricts.includes(option.id) && (
                                                            <span className="material-symbols-outlined">check</span>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden-checkbox"
                                                        checked={tempSelectedDistricts.includes(option.id)}
                                                        onChange={() => toggleDistrict(option.id)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="filter-sidebar-footer">
                                        <button className="clear-filters-btn" onClick={() => setTempSelectedDistricts(['all'])}>
                                            Reset All
                                        </button>
                                        <button className="apply-filters-btn" onClick={handleApplyFilters}>
                                            Done
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Compact Disclaimer */}
                    <div className="methodology-disclaimer">
                        <span className="material-symbols-outlined disclaimer-icon">info</span>
                        <div className="disclaimer-content">
                            <p className="update-disclaimer">
                                <span className="material-symbols-outlined">update</span>
                                All Data Is Sourced From Public Government Portal , Data Updation Process Is Ongoing
                            </p>
                        </div>
                    </div>

                    {/* MLA Cards */}
                    <section className="mla-cards-section">
                        <div className="section-header mobile-only">
                            <h3>MLA Expenditure Ranking</h3>
                            <span className="view-all">View All</span>
                        </div>

                        <motion.div className="mla-cards-grid" layout>
                            <AnimatePresence mode="popLayout">
                                {paginatedMLAs.map((mla, index) => {
                                    const rank = getRank(mla)
                                    const perfLevel = getPerformanceLevel(rank)
                                    const cleanName = mla.name.replace(/^(Shri|Smt)\s+/i, '')

                                    return (
                                        <motion.div
                                            key={mla.id}
                                            className={`mla-card ${perfLevel}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.03 }}
                                            layout
                                            onClick={() => navigate('/mla-fund-analytics', { state: { selectedMLA: mla.id } })}
                                        >
                                            {/* Glow effect - desktop only via CSS */}
                                            <div className="card-glow" />

                                            {/* Avatar with Rank */}
                                            <div className="mla-avatar-wrapper">
                                                <div className="mla-avatar-placeholder">
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
                                                        <span>{getInitials(mla.name)}</span>
                                                    )}
                                                </div>
                                                <span className={`rank-badge ${rank <= 3 ? 'top-3' : perfLevel}`}>
                                                    #{rank}
                                                </span>
                                            </div>

                                            {/* Mobile Card Content */}
                                            <div className="mla-card-content">
                                                <h3 className="mla-name">{cleanName}</h3>
                                                <div className="mla-constituency">
                                                    <span className="material-symbols-outlined">location_on</span>
                                                    {mla.constituency}
                                                </div>
                                                <p className="mla-amount">
                                                    {formatAmount(mla.totalExpenditure)}
                                                    <span>utilized</span>
                                                </p>
                                            </div>

                                            {/* Mobile Chevron */}
                                            <div className="card-chevron">
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </div>

                                            {/* Desktop Card Header */}
                                            <div className="mla-card-header">
                                                <div className="mla-info">
                                                    <div className="mla-details">
                                                        <h3 className="mla-name">{cleanName}</h3>
                                                        <div className="mla-constituency">
                                                            <span className="material-symbols-outlined">location_on</span>
                                                            {mla.constituency}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="district-badge">{mla.district}</span>
                                            </div>

                                            {/* Desktop Card Body */}
                                            <div className="mla-card-body">
                                                <div className="utilization-header">
                                                    <span className="util-label">Total Expenditure</span>
                                                    <span className={`util-percent ${perfLevel}`}>
                                                        <span className="material-symbols-outlined perf-icon">
                                                            {perfLevel === 'high' && 'check_circle'}
                                                            {perfLevel === 'medium' && 'trending_flat'}
                                                            {perfLevel === 'low' && 'warning'}
                                                        </span>
                                                        {formatAmount(mla.totalExpenditure)}
                                                    </span>
                                                </div>
                                                <div className="fund-details">
                                                    <div className="fund-item">
                                                        <span className="fund-label">Projects</span>
                                                        <span className="fund-value">{mla.projectCount}</span>
                                                    </div>
                                                    <div className="fund-item">
                                                        <span className="fund-label">District</span>
                                                        <span className="fund-value spent">{mla.district}</span>
                                                    </div>
                                                </div>
                                                <div className="card-footer-actions">
                                                    <button
                                                        className="view-more-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate('/mla-fund-analytics', { state: { selectedMLA: mla.id } })
                                                        }}
                                                    >
                                                        View Details
                                                        <span className="material-symbols-outlined">arrow_forward</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}

                            </AnimatePresence>
                        </motion.div>

                        {filteredMLAs.length === 0 && (
                            <div className="empty-state">
                                <span className="material-symbols-outlined">search_off</span>
                                <p>No MLAs found matching your criteria</p>
                            </div>
                        )}
                    </section>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <footer className="pagination">
                            <p className="pagination-info">
                                Showing <span>{paginatedMLAs.length}</span> of <span>{filteredMLAs.length}</span> MLAs
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
                                    Next
                                </button>
                            </div>
                        </footer>
                    )}
                </main>
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    )
}

export default MLADashboardPage
