import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import './AboutPage.css'
import keralaAssembly from '../assets/images/kerala-assembly.jpg'
import kochiMetro from '../assets/images/kochimetro.png'
// Stats data
const stats = [
    { id: 1, value: '1,79,949 Crore', label: 'Tracked Investment', icon: 'payments' },
    { id: 2, value: '900+', label: 'Projects Mapped', icon: 'rocket_launch' },
    { id: 3, value: '14', label: 'Districts Monitored', icon: 'location_on' }
]

// Leadership data
const leadership = [
    {
        "id": 1,
        "name": "Shri. Pinarayi Vijayan",
        "title": "Hon'ble Chief Minister",
        "image": "Pinarayi_Vijayan_brucnt"
    },
    {
        "id": 6,
        "name": "Shri. K.N. Balagopal",
        "title": "Hon'ble Minister for Finance",
        "image": "K.N._Balagopal_zxmh6n"
    },
    {
        "id": 2,
        "name": "Shri. K. Rajan",
        "title": "Hon'ble Minister for Revenue",
        "image": "K._Rajan_vjn7wr"
    },
    {
        "id": 11,
        "name": "Shri. P. Rajeev",
        "title": "Hon'ble Minister for Industries and Law",
        "image": "p-rajeev_member_15_105_dabz8o"
    },
    {
        "id": 9,
        "name": "Shri. P.A. Mohammed Riyas",
        "title": "Hon'ble Minister for Public Works and Tourism",
        "image": "P.A._Mohammed_Riyas_ebujct"
    },
    {
        "id": 15,
        "name": "Smt. Veena George",
        "title": "Hon'ble Minister for Health and Family Welfare",
        "image": "Veena_George_j1hiy2"
    },
    {
        "id": 13,
        "name": "Shri. V. Sivankutty",
        "title": "Hon'ble Minister for General Education and Labour",
        "image": "V_sivankutty_j5plyf"
    },
    {
        "id": 18,
        "name": "Shri. M.B. Rajesh",
        "title": "Hon'ble Minister for Local Self-Government",
        "image": "M.B._Rajesh_rqjmcw"
    },
    {
        "id": 4,
        "name": "Shri. K. Krishnankutty",
        "title": "Hon'ble Minister for Electricity",
        "image": "K._Krishnankutty_pebrpk"
    },
    {
        "id": 3,
        "name": "Shri. Roshy Augustine",
        "title": "Hon'ble Minister for Water Resources",
        "image": "Roshy_Augustine_lya4l3"
    },
    {
        "id": 10,
        "name": "Shri. P. Prasad",
        "title": "Hon'ble Minister for Agriculture",
        "image": "P._Prasad_rnieq5"
    },
    {
        "id": 17,
        "name": "Shri. G.R. Anil",
        "title": "Hon'ble Minister for Food and Civil Supplies",
        "image": "G.R._Anil_hwrbsf"
    },
    {
        "id": 7,
        "name": "Dr. R. Bindu",
        "title": "Hon'ble Minister for Higher Education and Social Justice",
        "image": "Dr._R._Bindu_gkgceb"
    },
    {
        "id": 14,
        "name": "Shri. V.N. Vasavan",
        "title": "Hon'ble Minister for Cooperation and Registration",
        "image": "Vasavanmla_t2tjcc"
    },
    {
        "id": 12,
        "name": "Shri. Saji Cherian",
        "title": "Hon'ble Minister for Fisheries and Culture",
        "image": "Saji_Cherian_bqx9jt"
    },
    {
        "id": 20,
        "name": "Shri. K.B. Ganesh Kumar",
        "title": "Hon'ble Minister for Transport",
        "image": "K.B._Ganesh_Kumar_gq4etg"
    },
    {
        "id": 5,
        "name": "Shri. A.K. Saseendran",
        "title": "Hon'ble Minister for Forests and Wildlife",
        "image": "A.K._Saseendran_caax2i"
    },
    {
        "id": 19,
        "name": "Shri. O.R. Kelu",
        "title": "Hon'ble Minister for Welfare of SC/ST and Devaswoms",
        "image": "O.R._Kelu_qpi0em"
    },
    {
        "id": 21,
        "name": "Shri. Kadannappalli Ramachandran",
        "title": "Hon'ble Minister for Ports",
        "image": "Kadannappalli_Ramachandran_jhcyg3"
    },
    {
        "id": 8,
        "name": "Smt. J. Chinchu Rani",
        "title": "Hon'ble Minister for Animal Husbandry and Dairy Development",
        "image": "J._Chinchu_Rani_ppqxpc"
    },
    {
        "id": 16,
        "name": "Shri. V. Abdurahiman",
        "title": "Hon'ble Minister for Sports and Wakf",
        "image": "V._Abdurahiman_bsen1r"
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
    const [leaderIndex, setLeaderIndex] = useState(0) // Desktop slider
    const [mobileIndex, setMobileIndex] = useState(0) // Mobile mini cards slider
    const cardsToShow = 5
    const miniCardsToShow = 4

    const nextLeader = () => {
        setLeaderIndex((prev) => (prev + 5) % leadership.length)
    }

    const prevLeader = () => {
        setLeaderIndex((prev) => (prev - 5 + leadership.length) % leadership.length)
    }

    const nextMobile = () => {
        const remaining = leadership.length - 1 // Exclude CM (20 ministers)
        const totalPages = Math.ceil(remaining / miniCardsToShow) // 5 pages
        setMobileIndex((prev) => {
            const nextPage = prev + miniCardsToShow
            return nextPage >= remaining ? 0 : nextPage
        })
    }

    const prevMobile = () => {
        const remaining = leadership.length - 1 // Exclude CM (20 ministers)
        setMobileIndex((prev) => {
            const prevPage = prev - miniCardsToShow
            // Wrap to last valid page if going below 0
            if (prevPage < 0) {
                const lastPageStart = Math.floor((remaining - 1) / miniCardsToShow) * miniCardsToShow
                return lastPageStart
            }
            return prevPage
        })
    }

    // Chief Minister is always index 0
    const cm = leadership[0]

    // Get remaining ministers (excluding CM) for mobile view
    const remainingLeaders = leadership.slice(1)

    const visibleMiniLeaders = useMemo(() => {
        const result = []
        for (let i = 0; i < miniCardsToShow; i++) {
            result.push(remainingLeaders[(mobileIndex + i) % remainingLeaders.length])
        }
        return result
    }, [mobileIndex])

    const visibleLeaders = useMemo(() => {
        const result = []
        for (let i = 0; i < cardsToShow; i++) {
            result.push(leadership[(leaderIndex + i) % leadership.length])
        }
        return result
    }, [leaderIndex])

    return (
        <div className="about-page">
            <Header showBack title="About" onBack={() => navigate('/')} />

            <div className="about-header-desktop desktop-only">
                <nav className="breadcrumb">
                    <Link to="/">Dashboard</Link>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <span className="current">About keralaStory</span>
                </nav>
            </div>

            {/* Hero Section */}
            <section
                className="about-hero"
                style={{
                    background: ` url(${kochiMetro})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 85%'
                }}
            >
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

                    <h1 className="about-title">KeralaStory</h1>
                    <p className="about-subtitle">Bridging Citizens with Public Data</p>

                    <div className="about-badge">
                        <span className="material-symbols-outlined">verified</span>
                        <span>Community Driven | Open Source</span>
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
                    This project is an open-source initiative dedicated to aggregating, visualizing, and simplifying access to public development data in Kerala. Built by the community for the community, we aim to foster transparency and civic engagement by transforming complex government reports into an accessible, interactive dashboard. We believe that informed citizens are the pillars of a thriving democracy
                </p>

                {/* Data Disclosure Section */}
                <div className="disclaimer-card" style={{ marginTop: '2rem' }}>
                    <span className="material-symbols-outlined">database</span>
                    <div className="disclaimer-content">
                        <h3>Data Sources & Disclaimer</h3>
                        <p>Project data presented in this dashboard is curated from official and public records:</p>
                        <ul>
                            <li><strong>KIIFB Official Website</strong> (Infrastructure & Funding Data)</li>
                            <li><strong>Kerala Government Annual Progress Reports</strong></li>
                            <li>Official data available on various <strong>public government websites</strong></li>
                        </ul>
                    </div>
                </div>
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
            <section className="about-section leadership-section">
                <h2 className="about-section-title">
                    <span className="section-indicator"></span>
                    Kerala's Leadership
                </h2>

                {/* Mobile View: CM Prominent Card + Others Flex Column */}
                <div className="leadership-mobile-view">
                    <div className="cm-prominent-card">
                        <div
                            className="leadership-avatar cm-avatar"
                            style={{ backgroundImage: `url(${cm.image})` }}
                        ></div>
                        <div className="leadership-info">
                            <h3 className="leadership-name">{cm.name}</h3>
                            <p className="leadership-title">{cm.title}</p>
                        </div>
                    </div>

                    <div className="mobile-mini-slider">
                        <button className="mobile-slider-btn prev" onClick={prevMobile} aria-label="Previous">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>

                        <div className="mobile-mini-container">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={mobileIndex}
                                    className="mobile-mini-track"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                >
                                    {visibleMiniLeaders.map((leader) => (
                                        <div key={leader.id} className="leadership-card-mini">
                                            <div
                                                className="leadership-avatar mini-avatar"
                                                style={{ backgroundImage: `url(${leader.image})` }}
                                            ></div>
                                            <div className="leadership-info">
                                                <h4 className="leadership-name">{leader.name}</h4>
                                                <p className="leadership-title">{leader.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <button className="mobile-slider-btn next" onClick={nextMobile} aria-label="Next">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Desktop View: 5 Cards Slider */}
                <div className="leadership-desktop-slider">
                    <button className="slider-btn prev" onClick={prevLeader} aria-label="Previous">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    <div className="slider-container">
                        <AnimatePresence mode='popLayout'>
                            <div className="slider-track">
                                {visibleLeaders.map((leader, index) => (
                                    <motion.div
                                        key={leader.id}
                                        className="leadership-card"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
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
                        </AnimatePresence>
                    </div>

                    <button className="slider-btn next" onClick={nextLeader} aria-label="Next">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </section>

            {/* Quote Section */}
            <section className="about-section">
                <blockquote className="about-quote">
                    <span className="quote-icon">"</span>
                    <p>
                        Transparency is not just about making data available; it's about making it understandable.
                        By opening up development data, we empower every Malayali to participate in the narrative of our state's growth.
                    </p>
                </blockquote>
            </section>

            {/* Feedback CTA Section */}
            <section className="about-section feedback-section">
                <motion.div
                    className="feedback-cta-card"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('https://forms.gle/9qW7iq5XYHV76A1R6', '_blank')}
                >
                    <div className="feedback-content">
                        <div className="feedback-icon-wrapper">
                            <span className="material-symbols-outlined">forum</span>
                        </div>
                        <div className="feedback-text">
                            <h3>How is the Real KeralaStory?</h3>
                            <p>Your feedback Matters a lot</p>
                        </div>
                    </div>
                    <button className="feedback-action-btn">
                        <span>Share Feedback</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </motion.div>
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
                    <p className="footer-dept">Open Source Community Initiative</p>
                    <p className="footer-subdept">Data sourced from KIIFB, Govt Reports & Public Websites</p>
                    <p className="footer-version">Disclaimer: This is a privately maintained open-source project and is not officially affiliated with the Government of Kerala.</p>
                </div>

                <p className="footer-dev">
                    Developed by <strong>RohithVijayan</strong>
                </p>
            </footer>
        </div>
    )
}

export default AboutPage
