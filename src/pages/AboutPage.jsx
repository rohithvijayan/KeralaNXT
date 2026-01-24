import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
        "image": "https://media.licdn.com/dms/image/v2/D4E03AQG07S2RCr12JA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1721387982183?e=2147483647&v=beta&t=phfKoe458ElcjJdMc0xyYqSfe14tqjq3-EtEdBbzJ0c"
    },
    {
        "id": 6,
        "name": "Shri. K.N. Balagopal",
        "title": "Hon'ble Minister for Finance",
        "image": "https://minister-finance.kerala.gov.in/wp-content/uploads/2021/09/profilekn.png"
    },
    {
        "id": 2,
        "name": "Shri. K. Rajan",
        "title": "Hon'ble Minister for Revenue",
        "image": "https://lh6.googleusercontent.com/proxy/a4kfnlIm855AcwUVJS5r5XgxtT81selI2uKNfFtFpwcQ2N4PIqSv0UDBmNK1UhIp9dig1RaS6ESn2-kRPonznya1sf0BHre1T4MEcGnBn3YHipcI_za1PKV6eJSbYrJMkWo"
    },
    {
        "id": 11,
        "name": "Shri. P. Rajeev",
        "title": "Hon'ble Minister for Industries and Law",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/P._Rajeev_2023.tif/lossy-page1-800px-P._Rajeev_2023.tif.jpg"
    },
    {
        "id": 9,
        "name": "Shri. P.A. Mohammed Riyas",
        "title": "Hon'ble Minister for Public Works and Tourism",
        "image": "https://minister-pwd.kerala.gov.in/wp-content/uploads/2021/08/Mohamed-Riyas.jpg"
    },
    {
        "id": 15,
        "name": "Smt. Veena George",
        "title": "Hon'ble Minister for Health and Family Welfare",
        "image": "https://minister-health.kerala.gov.in/wp-content/uploads/2021/09/veenageorge-274x300.jpg"
    },
    {
        "id": 13,
        "name": "Shri. V. Sivankutty",
        "title": "Hon'ble Minister for General Education and Labour",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/V_sivankutty.jpg/1200px-V_sivankutty.jpg"
    },
    {
        "id": 18,
        "name": "Shri. M.B. Rajesh",
        "title": "Hon'ble Minister for Local Self-Government",
        "image": "https://minister-lsg.kerala.gov.in/wp-content/uploads/2022/09/mbrajesh-1.png"
    },
    {
        "id": 4,
        "name": "Shri. K. Krishnankutty",
        "title": "Hon'ble Minister for Electricity",
        "image": "https://minister-electricity.kerala.gov.in/wp-content/uploads/2021/10/08a-scaled.jpg"
    },
    {
        "id": 3,
        "name": "Shri. Roshy Augustine",
        "title": "Hon'ble Minister for Water Resources",
        "image": "https://minister-waterresources.kerala.gov.in/wp-content/uploads/2021/06/minister-irrigation-273x300.jpg"
    },
    {
        "id": 10,
        "name": "Shri. P. Prasad",
        "title": "Hon'ble Minister for Agriculture",
        "image": "https://minister-agriculture.kerala.gov.in/wp-content/uploads/2021/09/prasad-profile.jpg"
    },
    {
        "id": 17,
        "name": "Shri. G.R. Anil",
        "title": "Hon'ble Minister for Food and Civil Supplies",
        "image": "https://minister-food.kerala.gov.in/wp-content/uploads/2021/08/Adv.-G.-R.-Anil-273x300.jpg"
    },
    {
        "id": 7,
        "name": "Dr. R. Bindu",
        "title": "Hon'ble Minister for Higher Education and Social Justice",
        "image": "https://minister-highereducation.kerala.gov.in/wp-content/uploads/2021/08/bindhu_minister-273x300.jpg"
    },
    {
        "id": 14,
        "name": "Shri. V.N. Vasavan",
        "title": "Hon'ble Minister for Cooperation and Registration",
        "image": "https://upload.wikimedia.org/wikipedia/commons/6/69/Vasavanmla.jpg"
    },
    {
        "id": 12,
        "name": "Shri. Saji Cherian",
        "title": "Hon'ble Minister for Fisheries and Culture",
        "image": "https://minister-fisheries.kerala.gov.in/wp-content/uploads/2021/08/sajicheriyan_profile.png"
    },
    {
        "id": 20,
        "name": "Shri. K.B. Ganesh Kumar",
        "title": "Hon'ble Minister for Transport",
        "image": "https://minister-transport.kerala.gov.in/wp-content/uploads/2024/01/414896051_940715817674953_512883159468637855_n-1.jpg"
    },
    {
        "id": 5,
        "name": "Shri. A.K. Saseendran",
        "title": "Hon'ble Minister for Forests and Wildlife",
        "image": "https://minister-forest.kerala.gov.in/wp-content/uploads/2021/09/Shri.-A.-K.-Saseendran-273x300.jpg"
    },
    {
        "id": 19,
        "name": "Shri. O.R. Kelu",
        "title": "Hon'ble Minister for Welfare of SC/ST and Devaswoms",
        "image": "https://www.deccanchronicle.com/h-upload/2024/06/20/1098470-orkelu.jpg"
    },
    {
        "id": 21,
        "name": "Shri. Kadannappalli Ramachandran",
        "title": "Hon'ble Minister for Ports",
        "image": "https://minister-registration.kerala.gov.in/wp-content/uploads/2024/01/IMG_6710-1-scaled.jpg"
    },
    {
        "id": 8,
        "name": "Smt. J. Chinchu Rani",
        "title": "Hon'ble Minister for Animal Husbandry and Dairy Development",
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4_Ql7n2BPGi3olw2ELXiWLXbyr7iZKQ0VEg&s"
    },
    {
        "id": 16,
        "name": "Shri. V. Abdurahiman",
        "title": "Hon'ble Minister for Sports and Wakf",
        "image": "https://minister-sports.kerala.gov.in/wp-content/uploads/2021/08/Shri.-V.-Abdurahiman.jpg"
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

                    <h1 className="about-title">Kerala Development Tracker</h1>
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
                    <p className="footer-subdept">Data sourced from public records & official reports</p>
                    <p className="footer-version">Disclaimer: This is a privately maintained open-source project and is not officially affiliated with the Government of Kerala. All data is sourced from public domains.</p>
                </div>

                <p className="footer-dev">
                    Developed by <strong>RohithVijayan</strong>
                </p>
            </footer>
        </div>
    )
}

export default AboutPage
