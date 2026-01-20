import { motion, AnimatePresence } from 'framer-motion'
import './ProjectModal.css'

function ProjectModal({ project, isOpen, onClose }) {
    if (!project) return null

    const statusConfig = {
        completed: { label: 'Completed', icon: 'check_circle', className: 'status-completed' },
        ongoing: { label: 'Ongoing', icon: 'pending', className: 'status-ongoing' },
        planned: { label: 'Planned', icon: 'schedule', className: 'status-planned' }
    }

    const status = statusConfig[project.status] || statusConfig.planned

    const categoryIcons = {
        infrastructure: 'apartment',
        healthcare: 'local_hospital',
        education: 'school',
        welfare: 'volunteer_activism',
        transport: 'directions_subway',
        tourism: 'travel_explore',
        it: 'computer'
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: project.title,
                    text: `${project.title} - ${project.budget}`,
                    url: window.location.href,
                })
            } catch (err) {
                console.log('Share cancelled')
            }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="project-modal"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        {/* Scrollable Content */}
                        <div className="modal-scroll">
                            {/* Hero Image */}
                            <div className="modal-hero">
                                {project.image ? (
                                    <div
                                        className="modal-hero-image"
                                        style={{ backgroundImage: `url(${project.image})` }}
                                    />
                                ) : (
                                    <div className="modal-hero-gradient" />
                                )}
                                <div className="modal-hero-overlay" />
                            </div>

                            {/* Content */}
                            <div className="modal-content">
                                {/* Status Badge */}
                                <div className={`modal-status ${status.className}`}>
                                    <span className="material-symbols-outlined">{status.icon}</span>
                                    <span>{status.label}</span>
                                </div>

                                {/* Title */}
                                <h1 className="modal-title">{project.title}</h1>

                                {/* Stats Grid */}
                                <div className="modal-stats-grid">
                                    <div className="modal-stat-card">
                                        <div className="modal-stat-header">
                                            <span className="material-symbols-outlined">payments</span>
                                            <span>Budget</span>
                                        </div>
                                        <p className="modal-stat-value">{project.budget}</p>
                                    </div>

                                    <div className="modal-stat-card">
                                        <div className="modal-stat-header">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            <span>Year</span>
                                        </div>
                                        <p className="modal-stat-value">{project.year}</p>
                                    </div>

                                    <div className="modal-stat-card">
                                        <div className="modal-stat-header">
                                            <span className="material-symbols-outlined">
                                                {categoryIcons[project.category] || 'category'}
                                            </span>
                                            <span>Category</span>
                                        </div>
                                        <p className="modal-stat-value">
                                            {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                                        </p>
                                    </div>

                                    <div className="modal-stat-card">
                                        <div className="modal-stat-header">
                                            <span className="material-symbols-outlined">groups</span>
                                            <span>Impact</span>
                                        </div>
                                        <p className="modal-stat-value">{project.impact || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="modal-divider" />

                                {/* Description */}
                                <div className="modal-description">
                                    <h3>About this Project</h3>
                                    <p>{project.description}</p>
                                </div>

                                {/* Tags */}
                                {project.tags && project.tags.length > 0 && (
                                    <div className="modal-tags">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="modal-tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button className="modal-share-btn" onClick={handleShare} aria-label="Share project">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                            <button className="modal-close-btn" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ProjectModal
