import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import {
    getMLASpendingBreakdown,
    getMLAProjects,
    getCategoryColor,
    getCategoryIcon,
    formatAmountCr,
    getInitials,
    getAllMLAsForAnalytics
} from '../data/mlaAnalyticsLoader'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CldImage from '../components/CldImage'
import './MLAProjectsPage.css'

const MLAProjectsPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { mlaId } = useParams()

    const [selectedMLA, setSelectedMLA] = useState(() => {
        return mlaId || location.state?.selectedMLA || sessionStorage.getItem('last_selected_mla') || ''
    })
    const [mlaData, setMlaData] = useState(null)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    // MLA Switcher State
    const [mlaSearchQuery, setMlaSearchQuery] = useState('')
    const [isMlaSearchOpen, setIsMlaSearchOpen] = useState(false)
    const [isMLASidebarOpen, setIsMLASidebarOpen] = useState(false) // Mobile sidebar state
    const allMLAs = useMemo(() => getAllMLAsForAnalytics(), [])

    // Initialize Fuse for fuzzy search
    const fuse = useMemo(() => {
        return new Fuse(projects, {
            keys: [
                { name: 'project_name', weight: 0.7 },
                { name: 'category', weight: 0.2 },
                { name: 'implementing_agency', weight: 0.1 }
            ],
            threshold: 0.4,
            distance: 100,
            ignoreLocation: true,
            minMatchCharLength: 2
        })
    }, [projects])

    // Initialize Fuse for MLA search
    const mlaFuse = useMemo(() => {
        return new Fuse(allMLAs, {
            keys: [
                { name: 'displayName', weight: 0.7 },
                { name: 'constituency', weight: 0.2 },
                { name: 'district', weight: 0.1 }
            ],
            threshold: 0.3
        })
    }, [allMLAs])

    const suggestedMLAs = useMemo(() => {
        if (!mlaSearchQuery) return []
        return mlaFuse.search(mlaSearchQuery).slice(0, 5).map(match => match.item)
    }, [mlaSearchQuery, mlaFuse])

    // Load MLA details and projects
    useEffect(() => {
        const loadData = async () => {
            if (!selectedMLA) {
                // No MLA selected - show empty state with switcher
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const [details, projectsList] = await Promise.all([
                    getMLASpendingBreakdown(selectedMLA),
                    getMLAProjects(selectedMLA)
                ])
                setMlaData(details)
                setProjects(projectsList)
                // Persist for refresh state
                sessionStorage.setItem('last_selected_mla', selectedMLA)
            } catch (error) {
                console.error('Error loading MLA projects:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [selectedMLA, navigate])

    // Categories for filter
    const categories = useMemo(() => {
        const cats = new Set(projects.map(p => p.category).filter(Boolean))
        return ['all', ...Array.from(cats)].sort()
    }, [projects])

    // Filtered projects
    const filteredProjects = useMemo(() => {
        let result = projects

        // Step 1: Filter by category if one is selected
        if (selectedCategory !== 'all') {
            result = result.filter(p => p.category === selectedCategory)
        }

        // Step 2: Apply fuzzy search if query exists
        if (searchQuery.trim() !== '') {
            if (selectedCategory !== 'all') {
                // If category is already filtered, search within those results
                const subFuse = new Fuse(result, {
                    keys: ['project_name', 'category', 'implementing_agency'],
                    threshold: 0.4
                })
                result = subFuse.search(searchQuery).map(match => match.item)
            } else {
                // Search across all projects
                result = fuse.search(searchQuery).map(match => match.item)
            }
        }

        return result
    }, [projects, searchQuery, selectedCategory, fuse])

    // Pagination
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredProjects.slice(start, start + itemsPerPage)
    }, [filteredProjects, currentPage])

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedCategory])

    if (loading && !mlaData) {
        return (
            <div className="mla-projects-page loading">
                <div className="loading-spinner"></div>
                <p>Loading Detailed Projects...</p>
            </div>
        )
    }

    return (
        <div className="mla-projects-page">
            <Header
                showBack={true}
                title="Detailed Project Dashboard"
                isDark={true}
                onBack={() => navigate('/mla-fund-analytics', { state: { selectedMLA } })}
            />
            <main className="projects-main-content">
                <div className="projects-main">
                    {/* Empty State - No MLA Selected */}
                    {!selectedMLA && !loading && (
                        <section className="mla-profile-banner">
                            <div className="profile-glass">
                                <div className="empty-state-content">
                                    <div className="empty-state-icon">
                                        <span className="material-symbols-outlined">person_search</span>
                                    </div>
                                    <h2>Search for an MLA</h2>
                                    <p>Use the search bar below to find and view detailed project information for any MLA in Kerala</p>

                                    <div className="mla-switcher">
                                        <div className={`mla-search-input-wrapper ${isMlaSearchOpen ? 'active' : ''}`}>
                                            <span className="material-symbols-outlined search-icon">person_search</span>
                                            <input
                                                type="text"
                                                placeholder="Search for an MLA by name, constituency, or district..."
                                                value={mlaSearchQuery}
                                                onChange={(e) => {
                                                    setMlaSearchQuery(e.target.value)
                                                    if (!isMlaSearchOpen) setIsMlaSearchOpen(true)
                                                }}
                                                onFocus={() => setIsMlaSearchOpen(true)}
                                                autoFocus
                                            />
                                            {isMlaSearchOpen && (
                                                <button
                                                    className="close-search"
                                                    onClick={() => {
                                                        setIsMlaSearchOpen(false)
                                                        setMlaSearchQuery('')
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {isMlaSearchOpen && suggestedMLAs.length > 0 && (
                                                <motion.div
                                                    className="mla-suggestions"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                >
                                                    {suggestedMLAs.map((mla) => (
                                                        <button
                                                            key={mla.id}
                                                            className="suggestion-item"
                                                            onClick={() => {
                                                                setSelectedMLA(mla.id)
                                                                setMlaSearchQuery('')
                                                                setIsMlaSearchOpen(false)
                                                                // Navigate with state instead of URL param
                                                                navigate('/mla-projects', { state: { selectedMLA: mla.id } })
                                                            }}
                                                        >
                                                            <div className="suggestion-avatar">
                                                                {mla.image ? (
                                                                    <CldImage src={mla.image} width={32} height={32} />
                                                                ) : (
                                                                    <span className="avatar-initials-sm">{getInitials(mla.name)}</span>
                                                                )}
                                                            </div>
                                                            <div className="suggestion-info">
                                                                <div className="s-name">{mla.displayName}</div>
                                                                <div className="s-meta">{mla.constituency} • {mla.district}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* MLA Profile Header */}
                    {mlaData && (
                        <section className="mla-profile-banner">
                            <div className="profile-glass">
                                <div className="profile-content">
                                    <div className="profile-info-section">
                                        <div className="profile-avatar">
                                            {mlaData.image ? (
                                                <CldImage
                                                    src={mlaData.image}
                                                    alt={mlaData.name}
                                                    width={80}
                                                    height={80}
                                                    className="mla-photo"
                                                />
                                            ) : (
                                                <span className="avatar-initials">{getInitials(mlaData.name)}</span>
                                            )}
                                        </div>
                                        <div className="profile-text">
                                            <h2>{mlaData.displayName}</h2>
                                            <div className="profile-meta">
                                                <span>{mlaData.constituency}</span>
                                                <span className="divider">•</span>
                                                <span>{mlaData.district}</span>
                                            </div>
                                            <div className="profile-stats">
                                                <div className="stat-pill">
                                                    <span className="label">Total Spent</span>
                                                    <span className="value">{formatAmountCr(mlaData.totalExpenditure)}</span>
                                                </div>
                                                <div className="stat-pill">
                                                    <span className="label">Projects</span>
                                                    <span className="value">{projects.length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="profile-search-section">
                                        {/* Mobile: Button to open sidebar */}
                                        <button
                                            className="mla-switcher-mobile-btn"
                                            onClick={() => setIsMLASidebarOpen(true)}
                                        >
                                            <span className="material-symbols-outlined">person_search</span>
                                            <span>Switch MLA</span>
                                        </button>

                                        {/* Desktop: Inline switcher */}
                                        <div className="mla-switcher mla-switcher-desktop">
                                            <div className={`mla-search-input-wrapper ${isMlaSearchOpen ? 'active' : ''}`}>
                                                <span className="material-symbols-outlined search-icon">person_search</span>
                                                <input
                                                    type="text"
                                                    placeholder="Switch to another MLA..."
                                                    value={mlaSearchQuery}
                                                    onChange={(e) => {
                                                        setMlaSearchQuery(e.target.value)
                                                        if (!isMlaSearchOpen) setIsMlaSearchOpen(true)
                                                    }}
                                                    onFocus={() => setIsMlaSearchOpen(true)}
                                                />
                                                {isMlaSearchOpen && (
                                                    <button
                                                        className="close-search"
                                                        onClick={() => {
                                                            setIsMlaSearchOpen(false)
                                                            setMlaSearchQuery('')
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {isMlaSearchOpen && suggestedMLAs.length > 0 && (
                                                    <motion.div
                                                        className="mla-suggestions"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                    >
                                                        {suggestedMLAs.map((mla) => (
                                                            <button
                                                                key={mla.id}
                                                                className="suggestion-item"
                                                                onClick={() => {
                                                                    setSelectedMLA(mla.id)
                                                                    setMlaSearchQuery('')
                                                                    setIsMlaSearchOpen(false)
                                                                    // Navigate with state instead of URL param
                                                                    navigate('/mla-projects', { state: { selectedMLA: mla.id } })
                                                                }}
                                                            >
                                                                <div className="suggestion-avatar">
                                                                    {mla.image ? (
                                                                        <CldImage src={mla.image} width={32} height={32} />
                                                                    ) : (
                                                                        <span className="avatar-initials-sm">{getInitials(mla.name)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="suggestion-info">
                                                                    <div className="s-name">{mla.displayName}</div>
                                                                    <div className="s-meta">{mla.constituency} • {mla.district}</div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Filters Row */}
                    <section className="controls-row">
                        <div className="search-box">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder="Find a project by name or agency..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-box">
                            <span className="material-symbols-outlined">filter_list</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Sectors</option>
                                {categories.filter(c => c !== 'all').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* Projects Table / Grid */}
                    <section className="projects-container">
                        <div className="table-wrapper desktop-only">
                            <table className="projects-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Project Description</th>
                                        <th>Category</th>
                                        <th>Implementing Agency</th>
                                        <th className="text-right">Amount (Lakhs)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedProjects.map((p, index) => (
                                        <tr key={index}>
                                            <td className="row-id">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="project-name-cell">
                                                <div className="project-name">{p.project_name || 'N/A'}</div>
                                                <div className="project-fy">FY {p.fy || 'Unknown'}</div>
                                            </td>
                                            <td className="category-cell">
                                                <span
                                                    className="cat-badge"
                                                    style={{
                                                        backgroundColor: `${getCategoryColor(categories.indexOf(p.category))}15`,
                                                        color: getCategoryColor(categories.indexOf(p.category))
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">{getCategoryIcon(p.category)}</span>
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="agency-cell">{p.implementing_agency || 'N/A'}</td>
                                            <td className="amount-cell text-right">
                                                ₹{(p.estimate_lakhs || 0).toFixed(2)} L
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="mobile-cards mobile-only">
                            {paginatedProjects.map((p, index) => (
                                <motion.div
                                    className="project-card"
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="card-top">
                                        <span className="card-fy">FY {p.fy}</span>
                                        <span className="card-amount">₹{p.estimate_lakhs?.toFixed(2)} L</span>
                                    </div>
                                    <p className="card-name">{p.project_name}</p>
                                    <div className="card-footer">
                                        <div className="card-cat">
                                            <span className="material-symbols-outlined">{getCategoryIcon(p.category)}</span>
                                            {p.category}
                                        </div>
                                        <div className="card-agency">{p.implementing_agency}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredProjects.length === 0 && (
                            <div className="no-results">
                                <span className="material-symbols-outlined">search_off</span>
                                <p>No projects found matching your search.</p>
                            </div>
                        )}
                    </section>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <section className="pagination-row">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="nav-btn"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                                Prev
                            </button>
                            <div className="page-info">
                                Page <span>{currentPage}</span> of {totalPages}
                            </div>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="nav-btn"
                            >
                                Next
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </section>
                    )}
                </div>
            </main>

            {/* Mobile MLA Switcher Sidebar */}
            <AnimatePresence>
                {isMLASidebarOpen && (
                    <>
                        <motion.div
                            className="filter-sidebar-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMLASidebarOpen(false)}
                        />
                        <motion.div
                            className="filter-sidebar-popup mla-sidebar-popup"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="filter-sidebar-header">
                                <h3>Switch MLA</h3>
                                <button className="close-filter-btn" onClick={() => setIsMLASidebarOpen(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="filter-sidebar-content">
                                <p className="filter-subtitle">Search for any MLA in Kerala to view their detailed project information.</p>

                                {/* Search Input */}
                                <div className="mla-sidebar-search">
                                    <div className={`mla-search-input-wrapper ${mlaSearchQuery ? 'active' : ''}`}>
                                        <span className="material-symbols-outlined search-icon">person_search</span>
                                        <input
                                            type="text"
                                            placeholder="Search by name, constituency, or district..."
                                            value={mlaSearchQuery}
                                            onChange={(e) => setMlaSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        {mlaSearchQuery && (
                                            <button
                                                className="close-search"
                                                onClick={() => setMlaSearchQuery('')}
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* MLA List */}
                                <div className="mla-sidebar-list">
                                    {suggestedMLAs.length > 0 ? (
                                        suggestedMLAs.map((mla) => (
                                            <button
                                                key={mla.id}
                                                className="mla-sidebar-item"
                                                onClick={() => {
                                                    setSelectedMLA(mla.id)
                                                    setMlaSearchQuery('')
                                                    setIsMLASidebarOpen(false)
                                                    navigate('/mla-projects', { state: { selectedMLA: mla.id } })
                                                }}
                                            >
                                                <div className="suggestion-avatar">
                                                    {mla.image ? (
                                                        <CldImage src={mla.image} width={48} height={48} />
                                                    ) : (
                                                        <span className="avatar-initials-sm">{getInitials(mla.name)}</span>
                                                    )}
                                                </div>
                                                <div className="suggestion-info">
                                                    <div className="s-name">{mla.displayName}</div>
                                                    <div className="s-meta">{mla.constituency} • {mla.district}</div>
                                                </div>
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        ))
                                    ) : mlaSearchQuery ? (
                                        <div className="no-results-sidebar">
                                            <span className="material-symbols-outlined">search_off</span>
                                            <p>No MLAs found matching "{mlaSearchQuery}"</p>
                                        </div>
                                    ) : (
                                        <div className="sidebar-hint">
                                            <span className="material-symbols-outlined">info</span>
                                            <p>Start typing to search for an MLA</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    )
}

export default MLAProjectsPage
