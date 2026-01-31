import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import CldImage from './CldImage'
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
            handleTextShare()
            return
        }

        const file = new File([imageBlob], `${project.title.replace(/\s+/g, '_')}_kerala.png`, { type: 'image/png' })

        // Try Web Share API first (works best on mobile)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: project.title,
                    text: `${project.title} - KeralaStory Showcase\n${project.budget} | ${project.year}`,
                })
                setShowShareMenu(false)
                return
            } catch (err) {
                if (err.name === 'AbortError') {
                    setShowShareMenu(false)
                    return
                }
                // Continue to fallback
            }
        }

        // Platform-specific fallback
        if (platform === 'instagram') {
            await handleInstagramShare(imageBlob)
        } else {
            handleDownloadImage(imageBlob)
        }

        setShowShareMenu(false)
    }

    // Instagram-specific share handler
    const handleInstagramShare = async (imageBlob) => {
        // Try to copy image to clipboard for pasting
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': imageBlob
                })
            ])
        } catch (err) {
            console.log('Clipboard write failed')
        }

        // Download the image as backup
        const url = URL.createObjectURL(imageBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.title.replace(/\s+/g, '_')}_kerala_story.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Try to open Instagram Stories (deep link)
        setTimeout(() => {
            window.location.href = 'instagram-stories://share'

            // Fallback instruction if deep link doesn't work
            setTimeout(() => {
                alert('Image saved! Open Instagram → Stories → Add from Gallery to share.')
            }, 1500)
        }, 300)
    }

    // WhatsApp direct share
    const handleWhatsAppShare = async () => {
        const imageBlob = await generateShareImage()

        if (imageBlob) {
            const file = new File([imageBlob], `${project.title.replace(/\s+/g, '_')}_kerala.png`, { type: 'image/png' })

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: project.title,
                        text: `${project.title} - KeralaStory Showcase`,
                    })
                    setShowShareMenu(false)
                    return
                } catch (err) {
                    // Continue to text fallback
                }
            }
        }

        // Fallback: WhatsApp text share
        const text = encodeURIComponent(
            `*${project.title}*\n\n` +
            `💰 Budget: ${project.budget}\n` +
            `📅 Year: ${project.year}\n` +
            `📍 Status: ${status.label}\n\n` +
            `Explore more: ${window.location.href}`
        )
        window.open(`https://wa.me/?text=${text}`, '_blank')
        setShowShareMenu(false)
    }


    // Fallback text share
    const handleTextShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: project.title,
                    text: `${project.title} - KeralaStory Showcase\n💰 Budget: ${project.budget}\n📅 Year: ${project.year}\n\nExplore more at:`,
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
                                    <CldImage
                                        src={project.image}
                                        alt={project.title}
                                        className="modal-hero-image"
                                        width={1200}
                                        height={675}
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
                                    {project.budget && (
                                        <div className="modal-stat-card">
                                            <div className="modal-stat-header">
                                                <span className="material-symbols-outlined">payments</span>
                                                <span>Budget</span>
                                            </div>
                                            <p className="modal-stat-value">{project.budget}</p>
                                        </div>
                                    )}

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
                                    <span className="share-btn-text">Share</span>
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
                                                className="share-menu-item share-instagram"
                                                onClick={() => handleShareWithImage('instagram')}
                                            >
                                                <span className="material-symbols-outlined">photo_camera</span>
                                                <span>Instagram Story</span>
                                            </button>
                                            <button
                                                className="share-menu-item share-whatsapp"
                                                onClick={handleWhatsAppShare}
                                            >
                                                <span className="material-symbols-outlined">chat</span>
                                                <span>WhatsApp</span>
                                            </button>
                                            <button
                                                className="share-menu-item"
                                                onClick={handleTextShare}
                                            >
                                                <span className="material-symbols-outlined">share</span>
                                                <span>More Options</span>
                                            </button>
                                            <button
                                                className="share-menu-item"
                                                onClick={() => handleDownloadImage()}
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                                <span>Save Image</span>
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
                            background: 'linear-gradient(180deg, #0f513f 0%, #0a3329 100%)',
                            fontFamily: 'Arial, sans-serif',
                            color: '#ffffff',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Brand Title - Fixed at top */}
                        <div style={{
                            position: 'absolute',
                            top: '50px',
                            left: '0',
                            right: '0',
                            textAlign: 'center',
                            paddingLeft: '40px',
                            paddingRight: '40px'
                        }}>
                            <div style={{
                                fontSize: '44px',
                                fontWeight: '900',
                                color: '#ffffff',
                                marginBottom: '10px',
                                letterSpacing: '-1px'
                            }}>
                                kerala<span style={{ color: '#10b77f' }}>Story</span>
                            </div>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#10b77f',
                                fontStyle: 'italic'
                            }}>
                                Not The Propaganda, only facts & data
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '180px',
                            left: '40px',
                            background: status.className === 'status-completed' ? '#10b981' :
                                status.className === 'status-ongoing' ? '#f59e0b' : '#3b82f6',
                            padding: '10px 20px',
                            borderRadius: '20px'
                        }}>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: '#ffffff'
                            }}>
                                {status.label}
                            </span>
                        </div>

                        {/* District */}
                        <div style={{
                            position: 'absolute',
                            top: '235px',
                            left: '40px',
                            right: '40px',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#10b77f',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            📍 {project.districtName || 'KERALA'}
                        </div>

                        {/* Project Title */}
                        <div style={{
                            position: 'absolute',
                            top: '270px',
                            left: '40px',
                            right: '40px',
                            fontSize: '36px',
                            fontWeight: '800',
                            color: '#ffffff',
                            lineHeight: '1.2',
                            maxHeight: '130px',
                            overflow: 'hidden',
                            wordWrap: 'break-word'
                        }}>
                            {project.title}
                        </div>

                        {/* Description */}
                        {project.description && (
                            <div style={{
                                position: 'absolute',
                                top: '420px',
                                left: '40px',
                                right: '40px',
                                fontSize: '15px',
                                lineHeight: '1.5',
                                color: '#ffffff',
                                opacity: 0.9,
                                maxHeight: '110px',
                                overflow: 'hidden',
                                wordWrap: 'break-word'
                            }}>
                                {project.description.substring(0, 160)}{project.description.length > 160 ? '...' : ''}
                            </div>
                        )}

                        {/* Budget Card */}
                        {project.budget && (
                            <div style={{
                                position: 'absolute',
                                bottom: '150px',
                                left: '40px',
                                width: project.budget ? '220px' : '460px',
                                background: 'rgba(16, 183, 127, 0.15)',
                                border: '2px solid rgba(16, 183, 127, 0.3)',
                                borderRadius: '20px',
                                padding: '24px'
                            }}>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#ffffff',
                                    opacity: 0.7,
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: '700'
                                }}>BUDGET</div>
                                <div style={{
                                    fontSize: '26px',
                                    fontWeight: '800',
                                    color: '#10b77f',
                                    lineHeight: '1.1',
                                    wordWrap: 'break-word'
                                }}>{project.budget}</div>
                            </div>
                        )}

                        {/* Year Card */}
                        <div style={{
                            position: 'absolute',
                            bottom: '150px',
                            right: '40px',
                            width: project.budget ? '220px' : '460px',
                            background: 'rgba(16, 183, 127, 0.15)',
                            border: '2px solid rgba(16, 183, 127, 0.3)',
                            borderRadius: '20px',
                            padding: '24px'
                        }}>
                            <div style={{
                                fontSize: '11px',
                                color: '#ffffff',
                                opacity: 0.7,
                                marginBottom: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: '700'
                            }}>YEAR</div>
                            <div style={{
                                fontSize: '26px',
                                fontWeight: '800',
                                color: '#10b77f',
                                lineHeight: '1.1'
                            }}>{project.year}</div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            height: '80px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                fontSize: '13px',
                                color: '#ffffff',
                                opacity: 0.8,
                                fontWeight: '600',
                                letterSpacing: '0.5px'
                            }}>
                                Government of Kerala • 2016-2025
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ProjectModal

