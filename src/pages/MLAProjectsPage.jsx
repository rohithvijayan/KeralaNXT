import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    getMLASpendingBreakdown,
    getMLAProjects,
    getCategoryColor,
    getCategoryIcon,
    formatAmountCr,
    getInitials
} from '../data/mlaAnalyticsLoader'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CldImage from '../components/CldImage'
import './MLAProjectsPage.css'

const MLAProjectsPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [selectedMLA, setSelectedMLA] = useState(location.state?.selectedMLA || '')
    const [mlaData, setMlaData] = useState(null)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    // Load MLA details and projects
    useEffect(() => {
        const loadData = async () => {
            if (!selectedMLA) {
                // If no MLA selected, navigate back to dashboard
                navigate('/mla-fund-dashboard')
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
        return projects.filter(p => {
            const matchesSearch = p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.implementing_agency?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [projects, searchQuery, selectedCategory])

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
                onBack={() => navigate('/mla-fund-analytics', { state: { selectedMLA } })}
            />

            <main className="projects-main">
                {/* MLA Profile Header */}
                {mlaData && (
                    <section className="mla-profile-banner">
                        <div className="profile-glass">
                            <div className="profile-content">
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
            </main>

            <BottomNav />
        </div>
    )
}

export default MLAProjectsPage
