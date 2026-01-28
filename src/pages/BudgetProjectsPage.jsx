import { useState, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import {
    getSectors,
    filterProjects,
    formatAmount,
    getSectorIcon,
    getSectorColor
} from '../data/budgetLoader'
import './BudgetProjectsPage.css'

function BudgetProjectsPage() {
    const navigate = useNavigate()

    // Data
    const sectors = useMemo(() => getSectors(), [])

    // State
    const [activeSector, setActiveSector] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Filtered projects
    const { projects, pagination } = useMemo(() => {
        return filterProjects({
            sector: activeSector,
            search: searchQuery,
            page: currentPage,
            perPage: 20
        })
    }, [activeSector, searchQuery, currentPage])

    // Handlers
    const handleSectorClick = useCallback((sectorKey) => {
        setActiveSector(sectorKey)
        setCurrentPage(1)
    }, [])

    const handleSearch = useCallback((e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }, [])

    return (
        <div className="budget-projects-page">
            <Header
                showBack
                title="Budget Projects"
                onBack={() => navigate('/state-budget')}
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
                <h1>Major Projects 2025-26</h1>
                <p>Detailed view of 333 infrastructure and development initiatives introduced in the latest State Budget</p>
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
                                    <div className="card-footer">
                                        <button className="card-action">
                                            <span>Details</span>
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                        <button className="card-share" aria-label="Share">
                                            <span className="material-symbols-outlined">share</span>
                                        </button>
                                    </div>
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
                        <p>Showing major projects and financial allocations for the fiscal year 2025-26.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default BudgetProjectsPage
