import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import './ProjectModal.css'

function ProjectModal({ project, isOpen, onClose }) {
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const shareCardRef = useRef(null)

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

    // Generate shareable image from hidden template
    const generateShareImage = async () => {
        if (!shareCardRef.current) return null

        setIsGenerating(true)
        try {
            const canvas = await html2canvas(shareCardRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                logging: false
            })

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob)
                }, 'image/png', 1.0)
            })
        } catch (error) {
            console.error('Error generating image:', error)
            return null
        } finally {
            setIsGenerating(false)
        }
    }

    // Share via Web Share API with image
    const handleShareWithImage = async (platform) => {
        const imageBlob = await generateShareImage()

        if (!imageBlob) {
            // Fallback to text share
            handleTextShare()
            return
        }

        const file = new File([imageBlob], `${project.title.replace(/\s+/g, '_')}_kerala.png`, { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: project.title,
                    text: `${project.title} - Kerala Development Showcase\n${project.budget} | ${project.year}`,
                })
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.log('Share failed, trying fallback')
                    handleDownloadImage(imageBlob)
                }
            }
        } else {
            // Browser doesn't support file sharing - download instead
            handleDownloadImage(imageBlob)
        }

        setShowShareMenu(false)
    }

    // Fallback text share
    const handleTextShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: project.title,
                    text: `${project.title} - Kerala Development Showcase\n💰 Budget: ${project.budget}\n📅 Year: ${project.year}\n\nExplore more at:`,
                    url: window.location.href,
                })
            } catch (err) {
                console.log('Share cancelled')
            }
        }
        setShowShareMenu(false)
    }

    // Download image
    const handleDownloadImage = async (existingBlob = null) => {
        const imageBlob = existingBlob || await generateShareImage()

        if (imageBlob) {
            const url = URL.createObjectURL(imageBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${project.title.replace(/\s+/g, '_')}_kerala.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }

        setShowShareMenu(false)
    }

    // Copy link
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            // Could add a toast notification here
        } catch (err) {
            console.error('Failed to copy link')
        }
        setShowShareMenu(false)
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
                            <div className="share-container">
                                <button
                                    className="modal-share-btn"
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    aria-label="Share project"
                                    disabled={isGenerating}
                                >
                                    <span className="material-symbols-outlined">
                                        {isGenerating ? 'hourglass_empty' : 'share'}
                                    </span>
                                </button>

                                {/* Share Menu */}
                                <AnimatePresence>
                                    {showShareMenu && (
                                        <motion.div
                                            className="share-menu"
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <button
                                                className="share-menu-item"
                                                onClick={() => handleShareWithImage('story')}
                                            >
                                                <span className="material-symbols-outlined">photo_camera</span>
                                                <span>Share as Story</span>
                                            </button>
                                            <button
                                                className="share-menu-item"
                                                onClick={handleTextShare}
                                            >
                                                <span className="material-symbols-outlined">send</span>
                                                <span>Share Link</span>
                                            </button>
                                            <button
                                                className="share-menu-item"
                                                onClick={() => handleDownloadImage()}
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                                <span>Download Image</span>
                                            </button>
                                            <button
                                                className="share-menu-item"
                                                onClick={handleCopyLink}
                                            >
                                                <span className="material-symbols-outlined">content_copy</span>
                                                <span>Copy Link</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button className="modal-close-btn" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </motion.div>

                    {/* Hidden Share Card Template (for image generation) */}
                    <div
                        ref={shareCardRef}
                        className="share-card-template"
                        style={{
                            position: 'fixed',
                            left: '-9999px',
                            top: 0,
                            width: '540px',
                            height: '960px',
                            background: 'linear-gradient(135deg, #1a5d4a 0%, #0d3d30 100%)',
                            padding: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            color: 'white',
                            borderRadius: '24px'
                        }}
                    >
                        {/* Top Section */}
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '40px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '24px' }}>🌴</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Kerala Development</p>
                                    <p style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Showcase</p>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                display: 'inline-block',
                                marginBottom: '24px'
                            }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                                    {status.label}
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: '36px',
                                fontWeight: 800,
                                lineHeight: 1.2,
                                margin: '0 0 24px 0'
                            }}>
                                {project.title}
                            </h1>

                            <p style={{
                                fontSize: '16px',
                                lineHeight: 1.6,
                                opacity: 0.9,
                                margin: 0
                            }}>
                                {project.description?.substring(0, 150)}...
                            </p>
                        </div>

                        {/* Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            marginBottom: '40px'
                        }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '20px'
                            }}>
                                <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 8px 0' }}>Budget</p>
                                <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{project.budget}</p>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '20px'
                            }}>
                                <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 8px 0' }}>Year</p>
                                <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{project.year}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.2)',
                            paddingTop: '24px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>
                                Government of Kerala • 2016-2025
                            </p>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ProjectModal

