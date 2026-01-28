import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import districtsData from '../data/districts.json'
import projectsData from '../data/projects.json'
import categoriesData from '../data/categories.json'
import './DistrictPage.css'

function DistrictPage() {
    const { districtId } = useParams()
    const navigate = useNavigate()
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedProject, setSelectedProject] = useState(null)
    const [scrollPosition, setScrollPosition] = useState('top') // 'top', 'middle', 'bottom'
    const contentRef = useRef(null)

    // Find district
    const district = useMemo(() => {
        return districtsData.districts.find(d => d.id === districtId)
    }, [districtId])

    // Get projects for this district
    const allProjects = useMemo(() => {
        return projectsData.projects.filter(p => p.districtId === districtId)
    }, [districtId])

    // Filter by category
    const filteredProjects = useMemo(() => {
        if (selectedCategory === 'all') return allProjects
        return allProjects.filter(p => p.category === selectedCategory)
    }, [allProjects, selectedCategory])

    // Get available categories for this district
    const availableCategories = useMemo(() => {
        const cats = new Set(allProjects.map(p => p.category))
        return categoriesData.categories.filter(c => c.id === 'all' || cats.has(c.id))
    }, [allProjects])

    // Handle scroll to detect position
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight

            if (scrollTop < 100) {
                setScrollPosition('top')
            } else if (scrollTop > docHeight - 100) {
                setScrollPosition('bottom')
            } else {
                setScrollPosition('middle')
            }
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll() // Initial check

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    }

    if (!district) {
        return (
            <div className="district-not-found">
                <p>District not found</p>
                <button onClick={() => navigate('/')}>Go Home</button>
            </div>
        )
    }

    return (
        <div className="district-page">
            <Header
                showBack
                title={district.name}
                onBack={() => navigate('/')}
            />

            <div className="district-header-desktop desktop-only">
                <nav className="breadcrumb">
                    <Link to="/">Dashboard</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <span className="current">{district.name}</span>
                </nav>
            </div>

            {/* Stats Bar */}
            <div className="district-stats-bar">
                <p className="district-stats-text">
                    <span className="material-symbols-outlined">analytics</span>
                    <span>{district.totalProjects} Projects</span>
                    <span className="district-stats-dot"></span>
                    <span>{district.totalInvestment} Total Investment</span>
                </p>
            </div>

            {/* Category Tabs */}
            <div className="district-tabs-wrapper">
                <div className="district-tabs no-scrollbar">
                    {availableCategories.map((category) => (
                        <button
                            key={category.id}
                            className={`district-tab ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Grid */}
            <main className="district-content" ref={contentRef}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory}
                        className="district-projects-grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="project-grid-item"
                                >
                                    <ProjectCard
                                        project={project}
                                        size="large"
                                        onClick={() => setSelectedProject(project)}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className="district-no-projects">
                                <span className="material-symbols-outlined">folder_off</span>
                                <p>No projects in this category yet</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Scroll Buttons */}
            <div className="scroll-buttons">
                <AnimatePresence>
                    {scrollPosition !== 'top' && (
                        <motion.button
                            className="scroll-btn scroll-to-top"
                            onClick={scrollToTop}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Scroll to top"
                        >
                            <span className="material-symbols-outlined">keyboard_arrow_up</span>
                        </motion.button>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {scrollPosition !== 'bottom' && filteredProjects.length > 3 && (
                        <motion.button
                            className="scroll-btn scroll-to-bottom"
                            onClick={scrollToBottom}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Scroll to bottom"
                        >
                            <span className="material-symbols-outlined">keyboard_arrow_down</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Project Modal */}
            <ProjectModal
                project={selectedProject}
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </div>
    )
}

export default DistrictPage
