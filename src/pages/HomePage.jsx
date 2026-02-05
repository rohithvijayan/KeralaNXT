import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import KeralaMap from '../components/KeralaMap'
import BottomSheet from '../components/BottomSheet'
import districtsData from '../data/districts.json'
import { loadDistrictProjects, loadStatewideProjects } from '../data/projectLoader'
import BudgetSelectorSheet from '../components/BudgetSelectorSheet'
import './HomePage.css'

function HomePage() {
    const navigate = useNavigate()
    const [selectedDistrict, setSelectedDistrict] = useState(null)
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
    const [selectedProjects, setSelectedProjects] = useState([])
    const [isLoadingProjects, setIsLoadingProjects] = useState(false)
    const [showBudgetPopup, setShowBudgetPopup] = useState(false)
    const [isBudgetSelectorOpen, setIsBudgetSelectorOpen] = useState(false)

    // ... (rest of the logic remains same, just adding state and usage)

    // Show popup after a delay on mobile
    useEffect(() => {
        const isMobile = window.innerWidth <= 768
        if (isMobile) {
            const timer = setTimeout(() => {
                setShowBudgetPopup(true)
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [])

    const districts = districtsData.districts

    // Load projects when district is selected
    useEffect(() => {
        if (!selectedDistrict) {
            setSelectedProjects([])
            return
        }

        const loadProjects = async () => {
            setIsLoadingProjects(true)
            try {
                // Load district projects and statewide projects in parallel
                const [districtProjects, statewideProjects] = await Promise.all([
                    loadDistrictProjects(selectedDistrict.id),
                    loadStatewideProjects()
                ])
                setSelectedProjects([...districtProjects, ...statewideProjects])
            } catch (error) {
                console.error('Error loading projects:', error)
                setSelectedProjects([])
            } finally {
                setIsLoadingProjects(false)
            }
        }

        loadProjects()
    }, [selectedDistrict])

    const handleDistrictSelect = (district) => {
        setSelectedDistrict(district)
        setIsBottomSheetOpen(true)
    }

    const handleCloseSheet = () => {
        setIsBottomSheetOpen(false)
        setTimeout(() => setSelectedDistrict(null), 300)
    }

    // Calculate total stats
    const totalStats = useMemo(() => ({
        districts: districts.length,
        investment: "₹1,79,949 Crore",
        projects: "900+"
    }), [districts])

    // Top categories by spending (Hardcoded)
    const topCategories = [
        { id: 'infra', name: 'Infrastructure', value: '₹48,000 Cr' },
        { id: 'transport', name: 'Transport', value: '₹49,446.64 Cr' },
        { id: 'health', name: 'Healthcare', value: '₹6,312.78 Cr' },
        { id: 'housing', name: 'Housing', value: '₹25,559.13 Cr' },
        { id: 'industry', name: 'Industry', value: '₹18,000 Cr' }
    ]

    return (
        <div className="home-page">
            <Header
                rightContent={
                    <>
                        <nav className="header-nav desktop-only">
                            <Link to="/projects" className="header-nav-link">Projects</Link>
                            <div
                                className="header-nav-link"
                                onClick={() => setIsBudgetSelectorOpen(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                Budget
                            </div>
                            <Link to="/initiatives" className="header-nav-link">Policies</Link>
                            <Link to="/mla-fund" className="header-nav-link">Track Your MLA</Link>
                            <Link to="/mp-fund-dashboard" className="header-nav-link">MP Fund</Link>
                            <Link to="/about" className="header-nav-link">About</Link>
                        </nav>
                        <a
                            href="https://forms.gle/9qW7iq5XYHV76A1R6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="header-feedback-btn"
                        >
                            <span className="material-symbols-outlined">forum</span>
                            <span>FeedBack</span>
                        </a>
                    </>
                }
            />

            {/* Existing main content ... */}

            <BudgetSelectorSheet
                isOpen={isBudgetSelectorOpen}
                onClose={() => setIsBudgetSelectorOpen(false)}
            />

            <main className="home-main">
                {/* Hero Header */}
                <motion.div
                    className="home-hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="home-live-badge">
                        <span className="home-live-dot"></span>
                        <span>State Development Tracker</span>
                    </div>
                    <h1 className="home-title">Bridging Citizens with Public Data</h1>
                    <p className="home-description">
                        Comprehensive insights into Kerala's development, public spending, and policy outcomes since 2016.
                    </p>
                    <p className="home-tagline">
                        Bringing Transparancy Through Public Data.
                    </p>
                </motion.div>

                {/* Main Grid Layout */}
                <div className="home-grid">
                    {/* Left Column - Top Categories (Desktop) */}
                    <div className="home-sidebar home-sidebar-left">
                        <motion.div
                            className="sidebar-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="sidebar-card-header">
                                <span className="material-symbols-outlined">pie_chart</span>
                                <span>Top Categories</span>
                            </div>
                            <div className="sidebar-card-list">
                                {topCategories.map((category) => (
                                    <div key={category.id} className="sidebar-list-item">
                                        <span className="sidebar-list-name">{category.name}</span>
                                        <span className="sidebar-list-value">{category.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="sidebar-actions">
                            <h3 className="sidebar-actions-title">Quick Actions</h3>
                            <button className="sidebar-action-btn" onClick={() => navigate('/budget-highlights')}>
                                <div className="sidebar-action-icon">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                                <span>Budget Highlights</span>
                                <span className="material-symbols-outlined sidebar-action-arrow">chevron_right</span>
                            </button>

                            <button className="sidebar-action-btn" onClick={() => navigate('/projects')}>
                                <div className="sidebar-action-icon">
                                    <span className="material-symbols-outlined">filter_alt</span>
                                </div>
                                <span>Filter Projects</span>
                                <span className="material-symbols-outlined sidebar-action-arrow">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Center Column - Map */}
                    <motion.div
                        className="home-map-section"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        <KeralaMap
                            districts={districts}
                            onDistrictSelect={handleDistrictSelect}
                            selectedDistrict={selectedDistrict}
                        />
                    </motion.div>

                    {/* Right Column - Stats */}
                    <div className="home-sidebar home-sidebar-right">
                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="stat-card-header">
                                <span className="stat-card-label">Total Coverage</span>
                                <div className="stat-card-icon">
                                    <span className="material-symbols-outlined">grid_view</span>
                                </div>
                            </div>
                            <p className="stat-card-value">{totalStats.districts}</p>
                            <p className="stat-card-unit">Districts</p>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="stat-card-header">
                                <span className="stat-card-label">Total Investment Tracked</span>
                                <div className="stat-card-icon">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                            </div>
                            <p className="stat-card-value">{totalStats.investment} <span className="stat-card-suffix"></span></p>
                            <p className="stat-card-unit">Allocated Funds</p>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="stat-card-header">
                                <span className="stat-card-label">Progress</span>
                                <div className="stat-card-icon">
                                    <span className="material-symbols-outlined">engineering</span>
                                </div>
                            </div>
                            <p className="stat-card-value">{totalStats.projects}</p>
                            <p className="stat-card-unit"> Projects</p>
                        </motion.div>
                    </div>
                </div>

                {/* Mobile Stats Scroll */}
                <div className="home-mobile-stats">
                    <div className="mobile-stats-scroll">
                        <div className="mobile-stat-pill">
                            <p className="mobile-stat-label">Districts</p>
                            <p className="mobile-stat-value">{totalStats.districts}</p>
                        </div>
                        <div className="mobile-stat-pill">
                            <p className="mobile-stat-label">Investment</p>
                            <p className="mobile-stat-value">2,19,495 Crore</p>
                        </div>
                        <div className="mobile-stat-pill">
                            <p className="mobile-stat-label">Projects</p>
                            <p className="mobile-stat-value">{totalStats.projects}</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-info">
                        <p className="footer-copyright">© keralaStory</p>
                        <p className="footer-disclaimer">
                            Data sources: Aggregated from official public reports and disclosures.
                            In case of data mismatch, inform via feedback.
                        </p>
                    </div>
                    <div className="footer-social">
                        <a href="https://github.com/rohithvijayan/KeralaNXT" aria-label="Website">
                            <span className="material-symbols-outlined">code</span>
                        </a>
                    </div>
                </div>
            </footer>

            {/* Bottom Sheet */}
            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={handleCloseSheet}
                district={selectedDistrict}
                projects={selectedProjects}
            />

            {/* Mobile Budget Popup */}
            <AnimatePresence>
                {showBudgetPopup && (
                    <motion.div
                        className="budget-popup-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="budget-popup-card"
                            initial={{ opacity: 0, scale: 0.3, y: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{
                                type: "spring",
                                damping: 15,
                                stiffness: 200,
                                mass: 0.8
                            }}
                        >
                            <button
                                className="popup-close-btn"
                                onClick={() => setShowBudgetPopup(false)}
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="popup-content">
                                <div className="popup-icon">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <h2>Kerala Budget — real Kerala story 🔍</h2>
                                <p>Where We Spend, Where We Earned Everything At One Click</p>
                                <div className="popup-btn-group">
                                    <Link to="/budget-highlights" className="popup-cta-btn highlight">
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                        Union Budget
                                    </Link>
                                    <Link to="/state-budget?year=2026-27" className="popup-cta-btn secondary">
                                        Kerala State Budget
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default HomePage
