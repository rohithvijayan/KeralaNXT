import CldImage from './CldImage'
import './ProjectCard.css'

function ProjectCard({ project, size = 'large', onClick }) {
    const statusConfig = {
        completed: { label: 'Completed', icon: 'check_circle', className: 'badge-completed' },
        ongoing: { label: 'Ongoing', icon: 'pending', className: 'badge-ongoing' },
        planned: { label: 'Planned', icon: 'schedule', className: 'badge-planned' }
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

    if (size === 'small') {
        return (
            <div className="project-card-small" onClick={onClick}>
                <div className="project-card-small-image">
                    <CldImage
                        src={project.image}
                        alt={project.title}
                        className="project-card-small-bg"
                        width={400}
                        height={225}
                    />
                    <div className="project-card-small-overlay" />
                    <span className={`project-card-badge ${status.className}`}>
                        {status.label}
                    </span>
                </div>
                <div className="project-card-small-content">
                    <h3 className="project-card-small-title">{project.shortTitle || project.title}</h3>
                    <p className="project-card-small-budget">{project.budget}</p>
                </div>
            </div>
        )
    }

    return (
        <article className="project-card" onClick={onClick}>
            <div className="project-card-image">
                <CldImage
                    src={project.image}
                    alt={project.title}
                    className="project-card-bg"
                    width={800}
                    height={450}
                />
                <div className="project-card-gradient" />
                <span className={`project-card-badge ${status.className}`}>
                    <span className="material-symbols-outlined">{status.icon}</span>
                    {status.label}
                </span>
            </div>
            <div className="project-card-content">
                <h2 className="project-card-title">{project.title}</h2>
                <div className="project-card-meta">
                    <div className="project-card-category">
                        <span className="material-symbols-outlined">
                            {categoryIcons[project.category] || 'category'}
                        </span>
                        <span className="project-card-category-name">
                            {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                        </span>
                    </div>
                    <div className="project-card-budget">
                        <span>{project.budget}</span>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default ProjectCard
