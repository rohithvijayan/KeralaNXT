import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import initiativesData from '../data/policy&Initatives.json'
import './InitiativesPage.css'

// Extract initiatives array
const initiatives = initiativesData.initiatives || []

// Get unique categories from data
const categoryOptions = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'political', label: 'Political', icon: 'gavel' },
    { id: 'social justice', label: 'Social Justice', icon: 'balance' },
    { id: 'social welfare', label: 'Welfare', icon: 'volunteer_activism' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'digital', label: 'Digital', icon: 'language' },
    { id: 'health', label: 'Health', icon: 'health_and_safety' },
    { id: 'housing', label: 'Housing', icon: 'home_work' },
    { id: 'labor', label: 'Labor', icon: 'engineering' },
    { id: 'labor welfare', label: 'Labor Welfare', icon: 'groups' }
]

// Status badge styling
const getStatusStyle = (status) => {
    const styles = {
        passed: { bg: 'var(--color-primary)', color: 'white' },
        ongoing: { bg: 'rgba(75, 124, 111, 0.15)', color: 'var(--color-primary)' },
        enforced: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
        active: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
        proposed: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
        implemented: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }
    }
    return styles[status] || styles.ongoing
}

// Category color mapping for desktop cards
const getCategoryColor = (category) => {
    const colors = {
        'political': '#13ecb2',
        'social justice': '#f59e0b',
        'social welfare': '#f59e0b',
        'education': '#8b5cf6',
        'digital': '#10b981',
        'health': '#38bdf8',
        'housing': '#f97316',
        'labor': '#6366f1',
        'labor welfare': '#6366f1'
    }
    return colors[category] || '#13ecb2'
}

// Impact level to border color
const getImpactColor = (level) => {
    switch (level) {
        case 'very high': return 'var(--color-primary)'
        case 'high': return 'var(--color-primary)'
        case 'medium': return '#f59e0b'
        default: return 'var(--color-border)'
    }
}

// Category icon mapping
const getCategoryIcon = (category) => {
    const cat = categoryOptions.find(c => c.id === category)
    return cat?.icon || 'category'
}

function InitiativesPage() {
    const navigate = useNavigate()

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategories, setSelectedCategories] = useState(['all'])
    const [selectedInitiative, setSelectedInitiative] = useState(null)

    // Compute stats
    const stats = useMemo(() => ({
        total: initiatives.length,
        years: `${Math.min(...initiatives.map(i => i.year))}-${Math.max(...initiatives.map(i => i.year))}`,
        ongoing: initiatives.filter(i => i.status === 'ongoing').length,
        passed: initiatives.filter(i => i.status === 'passed').length,
        totalBeneficiaries: '3.5Cr+'
    }), [])

    // Toggle category for desktop checkboxes
    const toggleCategory = (catId) => {
        if (catId === 'all') {
            setSelectedCategories(['all'])
        } else {
            setSelectedCategories(prev => {
                const withoutAll = prev.filter(c => c !== 'all')
                if (withoutAll.includes(catId)) {
                    const result = withoutAll.filter(c => c !== catId)
                    return result.length === 0 ? ['all'] : result
                } else {
                    return [...withoutAll, catId]
                }
            })
        }
    }

    // Check if category is selected
    const isCategorySelected = (catId) => {
        if (catId === 'all') return selectedCategories.includes('all')
        return selectedCategories.includes(catId)
    }

    // Filter initiatives
    const filteredInitiatives = useMemo(() => {
        let result = [...initiatives]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(i =>
                i.title.toLowerCase().includes(query) ||
                i.description.toLowerCase().includes(query) ||
                i.department.toLowerCase().includes(query) ||
                i.tags.some(t => t.toLowerCase().includes(query))
            )
        }

        // Category filter
        if (!selectedCategories.includes('all')) {
            result = result.filter(i => selectedCategories.includes(i.category))
        }

        // Sort by year descending
        result.sort((a, b) => b.year - a.year)

        return result
    }, [searchQuery, selectedCategories])

    // Group by year for timeline effect
    const groupedByYear = useMemo(() => {
        const groups = {}
        filteredInitiatives.forEach(init => {
            if (!groups[init.year]) groups[init.year] = []
            groups[init.year].push(init)
        })
        return Object.entries(groups).sort((a, b) => b[0] - a[0])
    }, [filteredInitiatives])

    return (
        <div className="initiatives-page">
            <Header showBack title="Initiatives & Reforms" onBack={() => navigate('/')} />

            {/* Desktop Layout Wrapper */}
            <div className="initiatives-layout">
                {/* Desktop Sidebar */}
                <aside className="initiatives-sidebar">
                    {/* Quick Stats Section */}
                    <div className="sidebar-section">
                        <h3 className="sidebar-section-title">State Overview</h3>
                        <div className="sidebar-stats">
                            <div className="sidebar-stat-card">
                                <div className="stat-card-header">
                                    <span className="material-symbols-outlined">description</span>
                                    <span className="stat-badge">+12%</span>
                                </div>
                                <p className="stat-number">{stats.total}+</p>
                                <p className="stat-label">Total Initiatives</p>
                            </div>

                            <div className="sidebar-stat-card">
                                <div className="stat-card-header">
                                    <span className="material-symbols-outlined">groups</span>
                                    <span className="stat-badge">Active</span>
                                </div>
                                <p className="stat-number">{stats.totalBeneficiaries}</p>
                                <p className="stat-label">Total Beneficiaries</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="sidebar-section">
                        <h3 className="sidebar-section-title">Filter by Sector</h3>
                        <div className="sidebar-filters">
                            {categoryOptions.filter(c => c.id !== 'all').map(cat => (
                                <label key={cat.id} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isCategorySelected(cat.id)}
                                        onChange={() => toggleCategory(cat.id)}
                                    />
                                    <span className="filter-label">{cat.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>


                </aside>

                {/* Main Content Area */}
                <main className="initiatives-content">
                    {/* Desktop Header */}
                    <div className="desktop-header">
                        <nav className="breadcrumb">
                            <Link to="/">Dashboard</Link>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <span className="current">Policy Timeline</span>
                        </nav>
                        <h1 className="page-title">
                            Policy Initiatives <span className="year-highlight">{stats.years}</span>
                        </h1>
                        <p className="page-subtitle">
                            Tracking state reforms, flagship missions, and strategic development projects shaping the future of Kerala.
                        </p>
                    </div>

                    {/* Mobile Hero Stats Section */}
                    <section className="initiatives-hero mobile-only">
                        <div className="hero-stats-card">
                            <div className="hero-content">
                                <h1 className="hero-title">{stats.total}+ Initiatives</h1>
                                <p className="hero-subtitle">Policy reforms & welfare programs launched {stats.years}</p>
                                <div className="hero-badges">
                                    <span className="hero-badge">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        {stats.passed} Passed
                                    </span>
                                    <span className="hero-badge">
                                        <span className="material-symbols-outlined">pending</span>
                                        {stats.ongoing} Ongoing
                                    </span>
                                </div>
                            </div>
                            <div className="hero-chart" aria-hidden="true">
                                {[40, 60, 35, 80, 55, 95, 70].map((h, i) => (
                                    <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Search & Filters */}
                    <div className="initiatives-controls">
                        <div className="search-bar">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder="Search by initiative name, department, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="clear-search" onClick={() => setSearchQuery('')}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            )}
                        </div>
                        {/*
                        <button className="sort-button">
                            <span className="material-symbols-outlined">filter_list</span>
                            Sort
                        </button>
                        */}
                    </div>

                    {/* Mobile Category Pills */}
                    <div className="category-pills-scroll mobile-only">
                        {categoryOptions.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-pill ${selectedCategories.includes(cat.id) || (cat.id === 'all' && selectedCategories.includes('all')) ? 'active' : ''}`}
                                onClick={() => toggleCategory(cat.id)}
                            >
                                <span className="material-symbols-outlined">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Results Count */}
                    <div className="initiatives-meta">
                        <p className="results-count">
                            Showing <strong>{filteredInitiatives.length}</strong> initiatives
                        </p>
                    </div>

                    {/* Initiatives Timeline */}
                    {groupedByYear.length > 0 ? (
                        <div className="initiatives-timeline">
                            {/* Desktop Timeline Line */}
                            <div className="timeline-line desktop-only" />

                            {groupedByYear.map(([year, inits], yearIndex) => (
                                <div key={year} className="timeline-year-group">
                                    {/* Year Marker */}
                                    <div className="timeline-year-marker">
                                        <span className={`year-badge ${yearIndex === 0 ? 'current' : ''}`}>{year}</span>
                                        <div className="year-line mobile-only" />
                                    </div>

                                    {/* Desktop: Two-column alternating grid */}
                                    <div className="timeline-cards">
                                        {inits.map((initiative, index) => (
                                            <motion.article
                                                key={initiative.id}
                                                className={`initiative-card ${index % 2 === 0 ? 'left' : 'right'}`}
                                                style={{
                                                    '--card-accent': getCategoryColor(initiative.category),
                                                    borderLeftColor: getImpactColor(initiative.impactLevel)
                                                }}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setSelectedInitiative(initiative)}
                                            >
                                                {/* Desktop Timeline Node */}
                                                <div className="timeline-node desktop-only" style={{ borderColor: getCategoryColor(initiative.category) }} />

                                                {/* Mobile Icon */}
                                                <div className="initiative-icon mobile-only">
                                                    <span className="material-symbols-outlined">
                                                        {getCategoryIcon(initiative.category)}
                                                    </span>
                                                </div>

                                                <div className="initiative-content">
                                                    <div className="initiative-header">
                                                        <div className="header-text">
                                                            <span className="initiative-category">{initiative.category}</span>
                                                            <h3 className="initiative-title">{initiative.title}</h3>
                                                        </div>
                                                        <span
                                                            className="initiative-status"
                                                            style={{
                                                                background: getStatusStyle(initiative.status).bg,
                                                                color: getStatusStyle(initiative.status).color
                                                            }}
                                                        >
                                                            {initiative.status}
                                                        </span>
                                                    </div>

                                                    <p className="initiative-description">{initiative.description}</p>

                                                    {/* Impact Metrics Chips - Desktop */}
                                                    <div className="initiative-metrics desktop-only">
                                                        {initiative.beneficiaries && initiative.beneficiaries !== 'N/A' && (
                                                            <div className="metric-chip">
                                                                <span className="material-symbols-outlined">group</span>
                                                                <span>{initiative.beneficiaries}</span>
                                                            </div>
                                                        )}
                                                        {initiative.budget && initiative.budget !== 'N/A' && (
                                                            <div className="metric-chip">
                                                                <span className="material-symbols-outlined">attach_money</span>
                                                                <span>{initiative.budget}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Mobile Meta */}
                                                    <div className="initiative-meta mobile-only">
                                                        <span className="meta-item">
                                                            <span className="material-symbols-outlined">business</span>
                                                            {initiative.department.split('/')[0].trim()}
                                                        </span>
                                                        {initiative.beneficiaries && initiative.beneficiaries !== 'N/A' && (
                                                            <span className="meta-item">
                                                                <span className="material-symbols-outlined">groups</span>
                                                                {initiative.beneficiaries}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="initiative-tags">
                                                        {initiative.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="tag">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="initiative-arrow mobile-only">
                                                    <span className="material-symbols-outlined">chevron_right</span>
                                                </div>
                                            </motion.article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-initiatives">
                            <span className="material-symbols-outlined">search_off</span>
                            <h3>No initiatives found</h3>
                            <p>Try adjusting your search or filters</p>
                            <button onClick={() => { setSearchQuery(''); setSelectedCategories(['all']); }}>
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Archive Button - Desktop */}
                    <div className="archive-section desktop-only">
                        <button className="archive-button">
                            <span className="material-symbols-outlined">history</span>
                            View Policy Archive (Pre-2016)
                        </button>
                        <p className="archive-footer">© 2024 Government of Kerala. All policy data is current as of June 2024.</p>
                    </div>
                </main>
            </div>

            {/* Initiative Detail Modal */}
            <AnimatePresence>
                {selectedInitiative && (
                    <motion.div
                        className="initiative-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedInitiative(null)}
                    >
                        <motion.div
                            className="initiative-modal"
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setSelectedInitiative(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <div className="modal-header">
                                <div
                                    className="modal-icon"
                                    style={{ borderColor: getImpactColor(selectedInitiative.impactLevel) }}
                                >
                                    <span className="material-symbols-outlined">
                                        {getCategoryIcon(selectedInitiative.category)}
                                    </span>
                                </div>
                                <div className="modal-title-group">
                                    <span
                                        className="modal-status"
                                        style={{
                                            background: getStatusStyle(selectedInitiative.status).bg,
                                            color: getStatusStyle(selectedInitiative.status).color
                                        }}
                                    >
                                        {selectedInitiative.status}
                                    </span>
                                    <h2 className="modal-title">{selectedInitiative.title}</h2>
                                    <p className="modal-department">{selectedInitiative.department}</p>
                                </div>
                            </div>

                            <div className="modal-body">
                                <p className="modal-description">{selectedInitiative.description}</p>

                                {/* Key Points */}
                                <div className="modal-section">
                                    <h4>Key Points</h4>
                                    <ul className="key-points">
                                        {selectedInitiative.keyPoints.map((point, i) => (
                                            <li key={i}>
                                                <span className="material-symbols-outlined">check_circle</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Stats Grid */}
                                <div className="modal-stats">
                                    <div className="modal-stat">
                                        <span className="stat-label">Year</span>
                                        <span className="stat-value">{selectedInitiative.year}</span>
                                    </div>
                                    {selectedInitiative.budget !== 'N/A' && (
                                        <div className="modal-stat">
                                            <span className="stat-label">Budget</span>
                                            <span className="stat-value">{selectedInitiative.budget}</span>
                                        </div>
                                    )}
                                    <div className="modal-stat">
                                        <span className="stat-label">Impact</span>
                                        <span className="stat-value impact">{selectedInitiative.impactLevel}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="modal-tags">
                                    {selectedInitiative.tags.map(tag => (
                                        <span key={tag} className="modal-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating CTA */}
            <motion.button
                className="impact-report-fab"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="material-symbols-outlined">analytics</span>
                <span>Impact Report</span>
            </motion.button>
        </div>
    )
}

export default InitiativesPage
