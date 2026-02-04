import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import {
    getSectors,
    filterProjects,
    formatAmount,
    getSectorIcon,
    getSectorColor,
    DEFAULT_YEAR
} from '../data/budgetLoader'
import './BudgetProjectsPage.css'

function BudgetProjectsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const selectedYear = searchParams.get('year') || DEFAULT_YEAR

    // Data
    // State
    const [sectors, setSectors] = useState([])
    const [projects, setProjects] = useState([])
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
    const [loading, setLoading] = useState(true)
    const [activeSector, setActiveSector] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Load initial sectors
    useEffect(() => {
        const loadInitialSectors = async () => {
            try {
                const data = await getSectors(selectedYear)
                setSectors(data)
            } catch (error) {
                console.error('Error loading sectors:', error)
            }
        }
        loadInitialSectors()
    }, [selectedYear])

    // Load filtered projects
    useEffect(() => {
        const loadFilteredProjects = async () => {
            setLoading(true)
            try {
                const result = await filterProjects({
                    fiscalYear: selectedYear,
                    sector: activeSector,
                    search: searchQuery,
                    page: currentPage,
                    perPage: 20
                })
                setProjects(result.projects)
                setPagination(result.pagination)
            } catch (error) {
                console.error('Error filtering projects:', error)
            } finally {
                setLoading(false)
            }
        }
        loadFilteredProjects()
    }, [selectedYear, activeSector, searchQuery, currentPage])

    // Handlers
    const handleSectorClick = useCallback((sectorKey) => {
        setActiveSector(sectorKey)
        setCurrentPage(1)
    }, [])

    const handleSearch = useCallback((e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }, [])

    if (loading && projects.length === 0) {
        return <div className="loading-container">Loading Budget Projects...</div>
    }

    return (
        <div className="budget-projects-page">
            <Header
                showBack
                title="Budget Projects"
                onBack={() => navigate(-1)}
            />

            {/* Desktop Breadcrumb */}
            <nav className="projects-breadcrumb desktop-only" aria-label="Breadcrumb">
                <Link to="/">Dashboard</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <Link to="/state-budget">State Budget</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <span className="current">Budget Projects</span>
            </nav>

            {/* Hero Section */}
            <section className="projects-hero">
                <div className="hero-icon-wrap">
                    <span className="material-symbols-outlined">engineering</span>
                </div>
                <h1>Major Projects {selectedYear}</h1>
                <p>Detailed view of {pagination.total} infrastructure and development initiatives introduced in the {selectedYear} State Budget</p>
                <div className="hero-stats">
                    <div className="stat">
                        <span className="stat-value">{pagination.total}</span>
                        <span className="stat-label">Total Projects</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">{sectors.length}</span>
                        <span className="stat-label">Sectors</span>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="projects-container">
                {/* Search and Filters Sidebar (Desktop) / Header (Mobile) */}
                <aside className="projects-filters">
                    <div className="filter-card">
                        <div className="filter-section">
                            <h3>Search</h3>
                            <div className="search-wrap">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    type="search"
                                    placeholder="Search by name or description..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="clear-btn">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Sectors</h3>
                            <div className="sector-chips">
                                <button
                                    className={`sector-chip ${activeSector === 'all' ? 'active' : ''}`}
                                    onClick={() => handleSectorClick('all')}
                                >
                                    <span className="material-symbols-outlined">apps</span>
                                    All Sectors
                                </button>
                                {sectors.map(sector => (
                                    <button
                                        key={sector.key}
                                        className={`sector-chip ${activeSector === sector.key ? 'active' : ''}`}
                                        onClick={() => handleSectorClick(sector.key)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {getSectorIcon(sector.key)}
                                        </span>
                                        {sector.name.split('_')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="projects-grid-main">
                    <div className="grid-header">
                        <h2>{activeSector === 'all' ? 'All Projects' : activeSector.replace(/_/g, ' ')}</h2>
                        <span className="count-badge">{pagination.total} projects</span>
                    </div>

                    <div className="projects-grid">
                        <AnimatePresence mode="popLayout">
                            {projects.map((project, index) => (
                                <motion.article
                                    key={project.id}
                                    className="budget-project-card"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.02 }}
                                    layout
                                >
                                    <div className="card-header">
                                        <span className="card-sector" style={{
                                            background: getSectorColor(project.sector_key) + '15',
                                            color: getSectorColor(project.sector_key)
                                        }}>
                                            {project.sector}
                                        </span>
                                        <span className="card-allocation">
                                            {project.allocation || 'N/A'}
                                        </span>
                                    </div>
                                    <h3 className="card-title">{project.title}</h3>
                                    <p className="card-description">
                                        {project.description || project.purpose || 'No description available for this initiative.'}
                                    </p>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {projects.length === 0 && (
                        <div className="empty-state">
                            <span className="material-symbols-outlined">search_off</span>
                            <h3>No matches found</h3>
                            <p>Try broadening your search or choosing another sector</p>
                            <button onClick={() => { setSearchQuery(''); handleSectorClick('all'); }}>
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                aria-label="Previous Page"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span className="page-info">
                                Page <strong>{currentPage}</strong> of {pagination.totalPages}
                            </span>
                            <button
                                disabled={currentPage === pagination.totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                aria-label="Next Page"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </main>
            </div>

            <footer className="projects-footer">
                <div className="footer-note">
                    <span className="material-symbols-outlined">info</span>
                    <div>
                        <strong>State Budget Initiatives</strong>
                        <p>Showing major projects and financial allocations for the fiscal year {selectedYear}.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default BudgetProjectsPage
