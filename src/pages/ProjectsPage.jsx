import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import ProjectModal from '../components/ProjectModal'
import CldImage from '../components/CldImage'
import districtsData from '../data/districts.json'
import categoriesData from '../data/categories.json'
import { loadAllProjects } from '../data/projectLoader'
import './ProjectsPage.css'

// Extract arrays from JSON objects
const districts = districtsData.districts || []
const categories = (categoriesData.categories || []).filter(c => c.id !== 'all')

const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
    { id: 'planned', label: 'Planned' }
]

const sortOptions = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'budget-high', label: 'Budget: High to Low' },
    { id: 'budget-low', label: 'Budget: Low to High' },
    { id: 'name', label: 'A-Z' }
]

function ProjectsPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDistrict, setSelectedDistrict] = useState('all')
    const [selectedCategories, setSelectedCategories] = useState(['all'])
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [sortBy, setSortBy] = useState('recent')
    const [includeStatewide, setIncludeStatewide] = useState(true)

    // UI states
    const [showFilters, setShowFilters] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)

    // Project loading states
    const [allProjects, setAllProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Sync district filter from navigation state (from HomePage bottom sheet)
    useEffect(() => {
        if (location.state?.selectedDistrict) {
            setSelectedDistrict(location.state.selectedDistrict)
            // When coming from bottom sheet, include statewide projects to match the count
            setIncludeStatewide(true)
        }
    }, [location.state])

    // Load all projects on mount
    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true)
            try {
                const projects = await loadAllProjects()
                // Enrich with district names
                const enrichedProjects = projects.map(project => ({
                    ...project,
                    districtName: project.districtId === 'statewide'
                        ? 'Statewide'
                        : districts.find(d => d.id === project.districtId)?.name || 'Unknown',
                    isStatewide: project.districtId === 'statewide'
                }))
                setAllProjects(enrichedProjects)
            } catch (error) {
                console.error('Error loading projects:', error)
                setAllProjects([])
            } finally {
                setIsLoading(false)
            }
        }

        loadProjects()
    }, [])

    // Helper function to parse budget string to number
    const parseBudget = (budget) => {
        if (!budget) return 0
        if (typeof budget === 'number') return budget
        // Handle strings like "₹19.43 Crore", "₹2,134.50 Crore", "₹0.00", etc.
        const cleaned = budget.replace(/[₹,]/g, '').trim()
        const match = cleaned.match(/^([\d.]+)/)
        if (match) {
            return parseFloat(match[1]) || 0
        }
        return 0
    }

    // Filter and sort projects
    const handleCategoryToggle = (categoryId) => {
        if (categoryId === 'all') {
            setSelectedCategories(['all'])
            return
        }

        setSelectedCategories(prev => {
            const isAll = prev.includes('all')
            const filtered = isAll ? [] : [...prev]

            if (filtered.includes(categoryId)) {
                const updated = filtered.filter(c => c !== categoryId)
                return updated.length === 0 ? ['all'] : updated
            } else {
                if (filtered.length < 3) {
                    return [...filtered, categoryId]
                }
                return prev // Limit reached
            }
        })
    }

    const filteredProjects = useMemo(() => {
        let result = [...allProjects]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.districtName.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            )
        }

        // District filter
        if (selectedDistrict === 'statewide') {
            // Show only statewide projects
            result = result.filter(p => p.isStatewide)
        } else if (selectedDistrict !== 'all') {
            // Show district projects + optionally statewide
            result = result.filter(p =>
                p.districtId === selectedDistrict ||
                (includeStatewide && p.isStatewide)
            )
        } else if (!includeStatewide) {
            // "All" selected but exclude statewide
            result = result.filter(p => !p.isStatewide)
        }

        // Category filter - support multiple categories (up to 3)
        if (!selectedCategories.includes('all')) {
            result = result.filter(p => (
                selectedCategories.includes(p.category) ||
                selectedCategories.includes(p.categoryId)
            ))
        }

        // Status filter
        if (selectedStatus !== 'all') {
            result = result.filter(p => p.status === selectedStatus)
        }

        // Sort - apply sorting to a new array
        const sortedResult = [...result]
        switch (sortBy) {
            case 'budget-high':
                sortedResult.sort((a, b) => parseBudget(b.budget) - parseBudget(a.budget))
                break
            case 'budget-low':
                sortedResult.sort((a, b) => parseBudget(a.budget) - parseBudget(b.budget))
                break
            case 'name':
                sortedResult.sort((a, b) => a.title.localeCompare(b.title))
                break
            case 'recent':
                // Sort by year descending (most recent first)
                sortedResult.sort((a, b) => (b.year || 0) - (a.year || 0))
                break
            default:
                break
        }

        return sortedResult
    }, [allProjects, searchQuery, selectedDistrict, selectedCategories, selectedStatus, sortBy, includeStatewide])

    const handleShare = (e, project) => {
        e.stopPropagation()
        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: `${project.title} - Kerala Development Showcase\n💰 Budget: ${project.budget}\n📅 Year: ${project.year}`,
                url: window.location.href,
            }).catch(console.error)
        } else {
            navigator.clipboard.writeText(`${project.title} - ${window.location.href}`)
            alert('Link copied to clipboard!')
        }
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'status-completed'
            case 'ongoing': return 'status-ongoing'
            case 'planned': return 'status-planned'
            default: return ''
        }
    }

    const formatBudget = (budget) => {
        if (!budget) return 'TBD'
        // If already formatted (string with ₹), return as-is
        if (typeof budget === 'string') return budget
        if (budget >= 1000) return `₹${(budget / 1000).toFixed(1)}k Cr`
        return `₹${budget} Cr`
    }

    const getCategoryIcon = (project) => {
        const catId = project.category || project.categoryId
        const category = categories.find(c => c.id === catId)
        return category?.icon || 'category'
    }

    return (
        <div className="projects-page">
            <Header showBack title="All Projects" onBack={() => navigate('/')} />

            <div className="projects-header-desktop desktop-only">
                <nav className="breadcrumb">
                    <Link to="/">Dashboard</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <span className="current">All Projects</span>
                </nav>
            </div>

            {/* Search & Filter Bar */}
            <div className="projects-controls">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                <button
                    className={`filter-toggle ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span className="material-symbols-outlined">tune</span>
                    <span className="filter-toggle-text">Filters</span>
                </button>
            </div>

            {/* Filter Chips (Mobile) */}
            <div className="filter-chips-mobile">
                <select
                    className="filter-chip"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                    <option value="all">All Districts</option>
                    <option value="statewide">🌐 Statewide Projects</option>
                    {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>

                <div className="filter-chip-wrapper">
                    <span className="filter-label-mobile">Categories:</span>
                    <div className="horizontal-chips-mobile">
                        <button
                            className={`mobile-category-chip ${selectedCategories.includes('all') ? 'active' : ''}`}
                            onClick={() => handleCategoryToggle('all')}
                        >
                            All
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                className={`mobile-category-chip ${selectedCategories.includes(c.id) ? 'active' : ''}`}
                                onClick={() => handleCategoryToggle(c.id)}
                                disabled={!selectedCategories.includes(c.id) && selectedCategories.length >= 3 && !selectedCategories.includes('all')}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                <select
                    className="filter-chip"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    {statusOptions.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                </select>
            </div>

            {/* Sidebar Filters (Desktop) */}
            <AnimatePresence>
                {showFilters && (
                    <motion.aside
                        className="filters-sidebar"
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                    >
                        <div className="sidebar-header">
                            <h3>Filters</h3>
                            <button className="close-sidebar" onClick={() => setShowFilters(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="filter-section">
                            <h4>Category</h4>
                            <div className="category-chips">
                                <button
                                    className={`category-chip ${selectedCategories.includes('all') ? 'active' : ''}`}
                                    onClick={() => handleCategoryToggle('all')}
                                >
                                    <span className="material-symbols-outlined">apps</span>
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`category-chip ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
                                        onClick={() => handleCategoryToggle(cat.id)}
                                        disabled={!selectedCategories.includes(cat.id) && selectedCategories.length >= 3 && !selectedCategories.includes('all')}
                                    >
                                        <span className="material-symbols-outlined">{cat.icon}</span>
                                        {cat.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                            <p className="filter-limit-hint">Select up to 3 categories</p>
                        </div>

                        {/* Districts */}
                        <div className="filter-section">
                            <div className="filter-header">
                                <h4>Districts</h4>
                                {selectedDistrict !== 'all' && (
                                    <button className="clear-filter" onClick={() => setSelectedDistrict('all')}>
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="district-list">
                                <label className="district-checkbox statewide-option">
                                    <input
                                        type="radio"
                                        name="district"
                                        checked={selectedDistrict === 'statewide'}
                                        onChange={() => setSelectedDistrict('statewide')}
                                    />
                                    <span>🌐 Statewide Projects</span>
                                </label>
                                {districts.map(d => (
                                    <label key={d.id} className="district-checkbox">
                                        <input
                                            type="radio"
                                            name="district"
                                            checked={selectedDistrict === d.id}
                                            onChange={() => setSelectedDistrict(d.id)}
                                        />
                                        <span>{d.name}</span>
                                    </label>
                                ))}
                            </div>
                            {/* Include statewide toggle - only show when a specific district is selected */}
                            {selectedDistrict !== 'all' && selectedDistrict !== 'statewide' && (
                                <label className="include-statewide-toggle">
                                    <input
                                        type="checkbox"
                                        checked={includeStatewide}
                                        onChange={(e) => setIncludeStatewide(e.target.checked)}
                                    />
                                    <span>Include statewide projects</span>
                                </label>
                            )}
                        </div>

                        {/* Status */}
                        <div className="filter-section">
                            <h4>Status</h4>
                            <div className="status-toggles">
                                {statusOptions.slice(1).map(status => (
                                    <label key={status.id} className="status-toggle">
                                        <span>{status.label}</span>
                                        <input
                                            type="checkbox"
                                            checked={selectedStatus === status.id || selectedStatus === 'all'}
                                            onChange={(e) => {
                                                if (e.target.checked && selectedStatus !== 'all') {
                                                    setSelectedStatus(status.id)
                                                } else if (!e.target.checked && selectedStatus === status.id) {
                                                    setSelectedStatus('all')
                                                }
                                            }}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`projects-main ${showFilters ? 'with-sidebar' : ''}`}>
                {/* Header Bar */}
                <div className="projects-header-bar">
                    <div className="projects-count">
                        <span className="count-number">{filteredProjects.length}</span>
                        <span className="count-label">
                            {filteredProjects.length === 1 ? 'project' : 'projects'} found
                        </span>
                    </div>

                    <div className="sort-control">
                        <span className="sort-label">Sort:</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            {sortOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Projects Grid */}
                <div
                    className="projects-grid"
                    key={`${selectedCategories.join('-')}-${selectedDistrict}-${selectedStatus}-${searchQuery}-${includeStatewide}`}
                >
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project, index) => (
                            <motion.article
                                key={project.id}
                                className="project-card-grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                onClick={() => setSelectedProject(project)}
                            >
                                {/* Image */}
                                <div className="project-card-image">
                                    {project.image ? (
                                        <CldImage
                                            src={project.image}
                                            alt={project.title}
                                            width={600}
                                            height={338}
                                        />
                                    ) : (
                                        <div className={`project-placeholder cat-${project.category || project.categoryId}`}>
                                            <span className="material-symbols-outlined">
                                                {getCategoryIcon(project)}
                                            </span>
                                        </div>
                                    )}
                                    <span className={`project-status-badge ${getStatusClass(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="project-card-content">
                                    <div className="project-location">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <span>{project.districtName}</span>
                                    </div>

                                    <h3 className="project-title">{project.title}</h3>

                                    <div className="project-meta">
                                        {project.budget && (
                                            <div className="project-budget">
                                                <span className="budget-label">Budget</span>
                                                <span className="budget-value">{formatBudget(project.budget)}</span>
                                            </div>
                                        )}
                                        <div className="project-card-actions">
                                            <button className="project-share-btn" onClick={(e) => handleShare(e, project)}>
                                                <span className="material-symbols-outlined">share</span>
                                            </button>
                                            <button className="project-arrow">
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    ) : (
                        <div className="no-projects">
                            <span className="material-symbols-outlined">search_off</span>
                            <h3>No projects found</h3>
                            <p>Try adjusting your filters or search query</p>
                            <button onClick={() => {
                                setSearchQuery('')
                                setSelectedDistrict('all')
                                setSelectedCategories(['all'])
                                setSelectedStatus('all')
                            }}>
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Back to Map Button */}
            <motion.button
                className="back-to-map-fab"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="fab-icon">🗺️</span>
                <span className="fab-text">Back to Map</span>
            </motion.button>

            {/* Project Modal */}
            <ProjectModal
                project={selectedProject}
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </div>
    )
}

export default ProjectsPage
