import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import KeralaMap from '../components/KeralaMap'
import BottomSheet from '../components/BottomSheet'
import districtsData from '../data/districts.json'
import { loadDistrictProjects, loadStatewideProjects } from '../data/projectLoader'
import './HomePage.css'

function HomePage() {
    const [selectedDistrict, setSelectedDistrict] = useState(null)
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
    const [selectedProjects, setSelectedProjects] = useState([])
    const [isLoadingProjects, setIsLoadingProjects] = useState(false)

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
        investment: "₹45,000 Cr",
        projects: "320+"
    }), [districts])

    // Top performing districts (sorted by investment)
    const topDistricts = useMemo(() => {
        return [...districts]
            .sort((a, b) => {
                const aVal = parseInt(a.totalInvestment.replace(/[^0-9]/g, ''))
                const bVal = parseInt(b.totalInvestment.replace(/[^0-9]/g, ''))
                return bVal - aVal
            })
            .slice(0, 3)
    }, [districts])

    return (
        <div className="home-page">
            <Header />

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
                        <span>Live Dashboard</span>
                    </div>
                    <h1 className="home-title">Kerala Development Showcase</h1>
                    <p className="home-subtitle">2016 — 2025</p>
                    <p className="home-description">
                        A professional overview of state-wide projects and district-wise investments
                        helping to shape the future of God's Own Country.
                    </p>
                </motion.div>

                {/* Main Grid Layout */}
                <div className="home-grid">
                    {/* Left Column - Top Performing (Desktop) */}
                    <div className="home-sidebar home-sidebar-left">
                        <motion.div
                            className="sidebar-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="sidebar-card-header">
                                <span className="material-symbols-outlined">trending_up</span>
                                <span>Top Performing</span>
                            </div>
                            <div className="sidebar-card-list">
                                {topDistricts.map((district) => (
                                    <div key={district.id} className="sidebar-list-item">
                                        <span className="sidebar-list-name">{district.name}</span>
                                        <span className="sidebar-list-value">{district.totalInvestment}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="sidebar-actions">
                            <h3 className="sidebar-actions-title">Quick Actions</h3>
                            <button className="sidebar-action-btn">
                                <div className="sidebar-action-icon">
                                    <span className="material-symbols-outlined">description</span>
                                </div>
                                <span>Download Reports</span>
                                <span className="material-symbols-outlined sidebar-action-arrow">chevron_right</span>
                            </button>
                            <button className="sidebar-action-btn">
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
                                <span className="stat-card-label">Total Investment</span>
                                <div className="stat-card-icon">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                            </div>
                            <p className="stat-card-value">₹45k<span className="stat-card-suffix">Cr</span></p>
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
                            <p className="stat-card-unit">Completed Projects</p>
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
                            <p className="mobile-stat-value">₹45,000 Cr</p>
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
                        <p className="footer-copyright">© 2024 Government of Kerala</p>
                        <p className="footer-department">Department of Planning & Economic Affairs</p>
                    </div>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Us</a>
                    </div>
                    <div className="footer-social">
                        <a href="#" aria-label="Website">
                            <span className="material-symbols-outlined">public</span>
                        </a>
                        <a href="#" aria-label="Email">
                            <span className="material-symbols-outlined">mail</span>
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
        </div>
    )
}

export default HomePage
