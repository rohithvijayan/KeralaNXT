import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import './AboutPage.css'

// Stats data
const stats = [
    { id: 1, value: '₹45k Cr', label: 'Total Investment', icon: 'payments' },
    { id: 2, value: '320+', label: 'Projects Launched', icon: 'rocket_launch' },
    { id: 3, value: '14', label: 'Districts Covered', icon: 'location_on' }
]

// Leadership data
const leadership = [
    {
        id: 1,
        name: 'Shri. Pinarayi Vijayan',
        title: "Hon'ble Chief Minister",
        image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202503/pinarayi-vijayan-252206944-16x9.png?VersionId=IwqEDhi9G_kSIDB4MCur9PY.NHgtufjb&size=690:388'
    },
    {
        id: 2,
        name: 'Shri. P. Rajeeve',
        title: 'Minister for Industries',
        image: 'https://pbs.twimg.com/profile_images/1848690856120786944/H4xLzX3__400x400.jpg'
    }
]

// Quick links
const quickLinks = [
    { id: 1, label: 'Kerala.gov.in', icon: 'public', url: 'https://kerala.gov.in' },
    { id: 2, label: 'IT Mission', icon: 'computer', url: 'https://itmission.kerala.gov.in' },
    { id: 3, label: 'K-DISC', icon: 'hub', url: 'https://kdisc.kerala.gov.in' }
]

function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="about-page">
            <Header showBack title="About" onBack={() => navigate('/')} />

            {/* Hero Section */}
            <section className="about-hero">
                <motion.div
                    className="about-hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Emblem */}
                    <div className="about-emblem">
                        <span className="material-symbols-outlined">account_balance</span>
                    </div>

                    <h1 className="about-title">Kerala Development Showcase</h1>
                    <p className="about-subtitle">2016 — 2025</p>

                    <div className="about-badge">
                        <span className="material-symbols-outlined">verified</span>
                        <span>Official Government Portal</span>
                    </div>
                </motion.div>
            </section>

            {/* Mission Section */}
            <section className="about-section">
                <h2 className="about-section-title">
                    <span className="section-indicator"></span>
                    Our Mission
                </h2>
                <p className="about-mission-text">
                    Our mission is to accelerate the digital transformation of Kerala through
                    innovative governance and citizen-centric services. We are building a future-ready
                    infrastructure that empowers every resident, fosters innovation, and ensures
                    transparent administration for all citizens of God's Own Country.
                </p>
            </section>

            {/* Stats Section */}
            <section className="about-section">
                <h2 className="about-section-title">
                    <span className="section-indicator"></span>
                    Key Achievements
                </h2>
                <div className="about-stats-grid">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            className="about-stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <span className="material-symbols-outlined stat-icon">{stat.icon}</span>
                            <p className="stat-value">{stat.value}</p>
                            <p className="stat-label">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Leadership Section */}
            <section className="about-section">
                <h2 className="about-section-title">
                    <span className="section-indicator"></span>
                    Leadership
                </h2>
                <div className="about-leadership-grid">
                    {leadership.map((leader, index) => (
                        <motion.div
                            key={leader.id}
                            className="leadership-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <div
                                className="leadership-avatar"
                                style={{ backgroundImage: `url(${leader.image})` }}
                            ></div>
                            <div className="leadership-info">
                                <h3 className="leadership-name">{leader.name}</h3>
                                <p className="leadership-title">{leader.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Quote Section */}
            <section className="about-section">
                <blockquote className="about-quote">
                    <span className="quote-icon">"</span>
                    <p>
                        Our goal is not just digital growth, but inclusive development where the
                        benefits of technology reach the last person in society.
                    </p>
                </blockquote>
            </section>

            {/* Quick Links */}
            <section className="about-section">
                <h2 className="about-section-title">
                    <span className="section-indicator"></span>
                    Quick Links
                </h2>
                <div className="about-links-grid">
                    {quickLinks.map((link) => (
                        <a
                            key={link.id}
                            className="about-link-card"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="material-symbols-outlined">{link.icon}</span>
                            <span>{link.label}</span>
                            <span className="material-symbols-outlined link-arrow">arrow_forward</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="about-footer">
                <div className="footer-social">
                    <a href="#" className="social-icon" aria-label="Website">
                        <span className="material-symbols-outlined">public</span>
                    </a>
                    <a href="#" className="social-icon" aria-label="Email">
                        <span className="material-symbols-outlined">mail</span>
                    </a>
                    <a href="#" className="social-icon" aria-label="Share">
                        <span className="material-symbols-outlined">share</span>
                    </a>
                </div>

                <div className="footer-credits">
                    <p className="footer-dept">Government of Kerala</p>
                    <p className="footer-subdept">Information & Public Relations Department</p>
                    <p className="footer-version">Version 1.0.0 • © 2025 All Rights Reserved</p>
                </div>

                <p className="footer-dev">
                    Developed by <strong>IT Mission Kerala</strong>
                </p>
            </footer>
        </div>
    )
}

export default AboutPage
