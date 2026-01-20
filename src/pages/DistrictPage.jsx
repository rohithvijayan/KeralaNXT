import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

            {/* Project List */}
            <main className="district-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory}
                        className="district-projects"
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
