import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import ProjectModal from '../components/ProjectModal'
import districtsData from '../data/districts.json'
import projectsData from '../data/projects.json'
import categoriesData from '../data/categories.json'
import './ProjectsPage.css'

// Extract arrays from JSON objects
const districts = districtsData.districts || []
const projects = projectsData.projects || []
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

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDistrict, setSelectedDistrict] = useState('all')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [sortBy, setSortBy] = useState('recent')

    // UI states
    const [showFilters, setShowFilters] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)

    // Get all projects from the data - handle the object format with projects array
    const allProjects = useMemo(() => {
        return projects.map(project => ({
            ...project,
            districtName: districts.find(d => d.id === project.districtId)?.name || 'Unknown'
        }))
    }, [])

    // Filter and sort projects
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
        if (selectedDistrict !== 'all') {
            result = result.filter(p => p.districtId === selectedDistrict)
        }

        // Category filter - check both 'category' and 'categoryId' field names
        if (selectedCategory !== 'all') {
            result = result.filter(p => (p.category === selectedCategory || p.categoryId === selectedCategory))
        }

        // Status filter
        if (selectedStatus !== 'all') {
            result = result.filter(p => p.status === selectedStatus)
        }

        // Sort
        switch (sortBy) {
            case 'budget-high':
                result.sort((a, b) => (b.budget || 0) - (a.budget || 0))
                break
            case 'budget-low':
                result.sort((a, b) => (a.budget || 0) - (b.budget || 0))
                break
            case 'name':
                result.sort((a, b) => a.title.localeCompare(b.title))
                break
            default:
                // Keep original order (most recent)
                break
        }

        return result
    }, [allProjects, searchQuery, selectedDistrict, selectedCategory, selectedStatus, sortBy])

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
                    {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>

                <select
                    className="filter-chip"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

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
                                    className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    <span className="material-symbols-outlined">apps</span>
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        <span className="material-symbols-outlined">{cat.icon}</span>
                                        {cat.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
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
                <div className="projects-grid">
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
                                        <img src={project.image} alt={project.title} />
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
                                        <div className="project-budget">
                                            <span className="budget-label">Budget</span>
                                            <span className="budget-value">{formatBudget(project.budget)}</span>
                                        </div>
                                        <button className="project-arrow">
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
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
                                setSelectedCategory('all')
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
