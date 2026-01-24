import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProjectCard from './ProjectCard'
import './BottomSheet.css'

function BottomSheet({ isOpen, onClose, district, projects }) {
    const navigate = useNavigate()

    if (!district) return null

    const handleViewAll = () => {
        // Navigate to projects page with district pre-selected
        navigate('/projects', { state: { selectedDistrict: district.id } })
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="bottom-sheet-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="bottom-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) {
                                onClose()
                            }
                        }}
                    >
                        {/* Drag Handle */}
                        <div className="bottom-sheet-handle">
                            <div className="bottom-sheet-handle-bar" />
                        </div>

                        {/* Header */}
                        <div className="bottom-sheet-header">
                            <h2 className="bottom-sheet-title">
                                <span className="bottom-sheet-pin">📍</span>
                                {district.name}
                            </h2>
                            <p className="bottom-sheet-subtitle">
                                {district.totalProjects} Projects •
                                <span className="bottom-sheet-investment">{district.totalInvestment}</span>
                            </p>
                        </div>

                        {/* Projects Grid */}
                        <div className="bottom-sheet-content">
                            <div className="bottom-sheet-grid">
                                {projects.slice(0, 4).map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ProjectCard project={project} size="small" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="bottom-sheet-footer">
                            <button className="bottom-sheet-cta" onClick={handleViewAll}>
                                <span>View All {district.totalProjects} Projects</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default BottomSheet
