import { useState, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import {
    getDashboardStats,
    getExpenditureBreakdown,
    getSectors,
    filterProjects,
    getPolicies,
    formatAmount,
    formatPercentage,
    getSectorIcon,
    getSectorColor
} from '../data/budgetLoader'
import './BudgetPage.css'

function BudgetPage() {
    const navigate = useNavigate()

    // Data
    const stats = useMemo(() => getDashboardStats(), [])
    const expenditure = useMemo(() => getExpenditureBreakdown(), [])
    const sectors = useMemo(() => getSectors(), [])
    const policies = useMemo(() => getPolicies(), [])

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
            perPage: 12
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

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
        <div className="budget-page">
            <Header
                showBack
                title="State Budget 2025-26"
                onBack={() => navigate('/')}
            />

            {/* Desktop Breadcrumb */}
            <nav className="budget-breadcrumb desktop-only" aria-label="Breadcrumb">
                <Link to="/">Dashboard</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <span className="current">State Budget</span>
            </nav>

            {/* Hero Section */}
            <section className="budget-hero" aria-label="Budget Overview">
                <div className="hero-badge">
                    <span className="live-dot" aria-hidden="true"></span>
                    <span>FY 2025-26</span>
                </div>
                <h1 className="hero-amount">{formatAmount(stats.totalBudget)}</h1>
                <p className="hero-label">Total State Budget</p>

                {/* Mini trend bars */}
                <div className="hero-trend" aria-hidden="true">
                    {[35, 55, 75, 60, 85, 70, 100].map((h, i) => (
                        <div
                            key={i}
                            className="trend-bar"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>

                <button
                    className="hero-share-btn"
                    aria-label="Share budget overview"
                >
                    <span className="material-symbols-outlined">share</span>
                </button>
            </section>

            {/* KPI Cards - Horizontal Scroll on Mobile */}
            <section className="kpi-section" aria-label="Key Performance Indicators">
                <div className="kpi-scroll">
                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.totalBudget)}</span>
                            <span className="kpi-label">Total Allocated</span>
                        </div>
                        <div className="kpi-trend positive">
                            <span className="material-symbols-outlined">trending_up</span>
                            <span>+5.2%</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">architecture</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.capitalExpenditure)}</span>
                            <span className="kpi-label">Capital Exp.</span>
                        </div>
                        <div className="kpi-trend">
                            <span>{stats.capexPercent}%</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">sync_alt</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{formatAmount(stats.revenueExpenditure)}</span>
                            <span className="kpi-label">Revenue Exp.</span>
                        </div>
                        <div className="kpi-trend">
                            <span>{stats.revexPercent}%</span>
                        </div>
                    </article>

                    <article className="kpi-card">
                        <div className="kpi-icon">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">{stats.projectCount}</span>
                            <span className="kpi-label">Projects</span>
                        </div>
                        <div className="kpi-trend positive">
                            <span className="material-symbols-outlined">trending_up</span>
                            <span>+12%</span>
                        </div>
                    </article>
                </div>
            </section>

            {/* Sector Allocation Section */}
            <section className="sector-section" aria-label="Sector-wise Allocation">
                <div className="section-header">
                    <h2>Sector-wise Allocation</h2>
                    <span className="section-badge">Top {stats.sectorCount} sectors</span>
                </div>

                <div className="sector-list">
                    {sectors.slice(0, 8).map((sector, index) => (
                        <motion.button
                            key={sector.key}
                            className={`sector-card ${activeSector === sector.key ? 'active' : ''}`}
                            onClick={() => handleSectorClick(sector.key)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            aria-pressed={activeSector === sector.key}
                        >
                            <div
                                className="sector-icon"
                                style={{ background: getSectorColor(sector.key) }}
                            >
                                <span className="material-symbols-outlined">
                                    {getSectorIcon(sector.key)}
                                </span>
                            </div>
                            <div className="sector-info">
                                <span className="sector-name">{sector.name}</span>
                                <span className="sector-amount">{formatAmount(sector.totalAllocation)}</span>
                            </div>
                            <div className="sector-meta">
                                <span className="sector-projects">{sector.count} projects</span>
                                <div className="sector-bar">
                                    <div
                                        className="sector-bar-fill"
                                        style={{
                                            width: `${(sector.totalAllocation / sectors[0].totalAllocation) * 100}%`,
                                            background: getSectorColor(sector.key)
                                        }}
                                    />
                                </div>
                            </div>
                            <span className="material-symbols-outlined sector-arrow">chevron_right</span>
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Projects Section */}
            <section className="projects-section" aria-label="Budget Projects">
                <div className="section-header">
                    <h2>Projects</h2>
                    <span className="results-count">{pagination.total} results</span>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-pills">
                        <button
                            className={`filter-pill ${activeSector === 'all' ? 'active' : ''}`}
                            onClick={() => handleSectorClick('all')}
                        >
                            All
                        </button>
                        {sectors.slice(0, 5).map(sector => (
                            <button
                                key={sector.key}
                                className={`filter-pill ${activeSector === sector.key ? 'active' : ''}`}
                                onClick={() => handleSectorClick(sector.key)}
                            >
                                {sector.name.split('_')[0]}
                            </button>
                        ))}
                    </div>

                    <div className="search-wrapper">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="search"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={handleSearch}
                            aria-label="Search projects"
                        />
                        {searchQuery && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Project Grid */}
                <div className="project-grid">
                    <AnimatePresence mode="popLayout">
                        {projects.map((project, index) => (
                            <motion.article
                                key={project.id}
                                className="budget-project-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.03 }}
                                layout
                            >
                                <div className="card-header">
                                    <span className="card-sector">{project.sector}</span>
                                    <span className="card-allocation">
                                        {project.allocation || 'N/A'}
                                    </span>
                                </div>
                                <h3 className="card-title">{project.title}</h3>
                                {project.description && (
                                    <p className="card-description">{project.description}</p>
                                )}
                                {project.purpose && (
                                    <p className="card-description">{project.purpose}</p>
                                )}
                                <div className="card-footer">
                                    <button className="card-action">
                                        <span>Details</span>
                                        <span className="material-symbols-outlined">arrow_right_alt</span>
                                    </button>
                                    <button
                                        className="card-share"
                                        aria-label={`Share ${project.title}`}
                                    >
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
                        <h3>No projects found</h3>
                        <p>Try adjusting your filters or search</p>
                        <button onClick={() => { setSearchQuery(''); setActiveSector('all'); }}>
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <nav className="pagination" aria-label="Project pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            aria-label="Previous page"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>

                        <span className="page-info">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.hasNext}
                            aria-label="Next page"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </nav>
                )}
            </section>

            {/* Policy Insights CTA */}
            <section className="policy-cta-section" aria-label="Policy Insights">
                <div className="policy-cta-card">
                    <div className="cta-icon">
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div className="cta-content">
                        <h2>Budget Policy Insights</h2>
                        <p>Discover {policies.reduce((a, c) => a + c.policies.length, 0)} strategic policies and vision frameworks guiding Kerala's development</p>
                    </div>
                    <Link to="/policy-insights" className="cta-button">
                        <span>Explore Policies</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <div className="cta-decoration" aria-hidden="true">
                        <span className="material-symbols-outlined">policy</span>
                        <span className="material-symbols-outlined">gavel</span>
                        <span className="material-symbols-outlined">trending_up</span>
                    </div>
                </div>
            </section>

            {/* Footer Note */}
            <footer className="budget-footer">
                <div className="footer-note">
                    <span className="material-symbols-outlined">info</span>
                    <div>
                        <strong>Data Source</strong>
                        <p>Citizen's Guide to Budget 2025-26, Government of Kerala</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default BudgetPage
