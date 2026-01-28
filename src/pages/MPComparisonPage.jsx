import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import { getAllMPs } from '../data/mpFundLoader'
import { getMPSpendingBreakdown } from '../data/mpAnalyticsLoader'
import { shareElementAsImage } from '../utils/shareUtils'
import './MPComparisonPage.css'

const MPComparisonPage = () => {
    const navigate = useNavigate()
    const [mpA, setMpA] = useState('')
    const [mpB, setMpB] = useState('')

    // Get all MPs data
    const mpsData = useMemo(() => getAllMPs(), [])

    // Set initial selections
    useEffect(() => {
        if (mpsData.length > 0 && !mpA) {
            setMpA(mpsData[0].fullName)
        }
        if (mpsData.length > 1 && !mpB) {
            setMpB(mpsData[1].fullName)
        }
    }, [mpsData, mpA, mpB])

    // Get spending data for both MPs
    const mpAData = useMemo(() => {
        if (!mpA) return null
        return getMPSpendingBreakdown(mpA)
    }, [mpA])

    const mpBData = useMemo(() => {
        if (!mpB) return null
        return getMPSpendingBreakdown(mpB)
    }, [mpB])

    // Get MP details from mpsData
    const mpADetails = useMemo(() =>
        mpsData.find(mp => mp.fullName === mpA), [mpsData, mpA])

    const mpBDetails = useMemo(() =>
        mpsData.find(mp => mp.fullName === mpB), [mpsData, mpB])

    // Calculate comparison data
    const comparisonData = useMemo(() => {
        if (!mpAData || !mpBData) return []

        // Group categories from both MPs
        const categories = new Map()

        // Add MP A categories
        mpAData.breakdown.forEach(item => {
            categories.set(item.label, {
                label: item.label,
                mpA: item.value,
                mpB: 0
            })
        })

        // Add MP B categories
        mpBData.breakdown.forEach(item => {
            if (categories.has(item.label)) {
                categories.get(item.label).mpB = item.value
            } else {
                categories.set(item.label, {
                    label: item.label,
                    mpA: 0,
                    mpB: item.value
                })
            }
        })

        return Array.from(categories.values()).sort((a, b) =>
            (b.mpA + b.mpB) - (a.mpA + a.mpB)
        )
    }, [mpAData, mpBData])

    // Format currency in Crores
    const formatCrores = (value) => {
        return `₹${(value / 10000000).toFixed(2)} Cr`
    }

    // Format currency in Lakhs
    const formatLakhs = (value) => {
        return `₹${(value / 100000).toFixed(2)} L`
    }

    // Calculate utilization percentage
    const calculateUtilization = (mpDetails) => {
        if (!mpDetails) return 0
        const allocated = parseFloat(mpDetails.allocatedFund.replace(/[^\d.]/g, ''))
        const utilized = parseFloat(mpDetails.utilisedFund.replace(/[^\d.]/g, ''))
        return allocated > 0 ? ((utilized / allocated) * 100).toFixed(1) : 0
    }

    // Calculate percentage difference
    const calculateDelta = (valA, valB) => {
        if (valB === 0) return valA > 0 ? 100 : 0
        return (((valA - valB) / valB) * 100).toFixed(1)
    }

    // Get icon for category
    const getCategoryIcon = (label) => {
        const normalizedLabel = label.toLowerCase()
        if (normalizedLabel.includes('road') || normalizedLabel.includes('connectivity')) return 'route'
        if (normalizedLabel.includes('school') || normalizedLabel.includes('education')) return 'school'
        if (normalizedLabel.includes('hospital') || normalizedLabel.includes('health')) return 'medical_services'
        if (normalizedLabel.includes('water')) return 'water_drop'
        if (normalizedLabel.includes('community') || normalizedLabel.includes('hall')) return 'groups'
        if (normalizedLabel.includes('vehicle')) return 'directions_bus'
        return 'category'
    }

    const handleShare = () => {
        shareElementAsImage('comparison-card', {
            title: 'MP Fiscal Comparison',
            text: `Comparing the fund utilization of ${mpADetails?.name} and ${mpBDetails?.name} via KeralaNXT.`,
            fileName: `comparison-${mpADetails?.name}-${mpBDetails?.name}.png`.replace(/\s+/g, '-').toLowerCase()
        })
    }

    return (
        <div className="comparison-page">
            <Header
                showBack={true}
                title="MP Comparison"
                onBack={() => navigate('/mp-fund-dashboard')}
            />

            <div className="comparison-container">
                {/* Page Header */}
                <motion.div
                    className="comparison-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-top">
                        <div className="title-group">
                            <h1>MP Fiscal Comparison</h1>
                            <p>High-density performance analysis and fund utilization breakdown</p>
                        </div>
                        <button className="share-comparison-btn" onClick={handleShare}>
                            <span className="material-symbols-outlined">share</span>
                            <span>Share Comparison</span>
                        </button>
                    </div>
                </motion.div>

                {/* Comparison Split View */}
                <div id="comparison-card">
                    <motion.div
                        className="comparison-split"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* MP A Panel */}
                        <div className="comparison-panel panel-a">
                            <div className="panel-content">
                                {/* Selector */}
                                <div className="mp-selector">
                                    <label>Select Member A</label>
                                    <select value={mpA} onChange={(e) => setMpA(e.target.value)}>
                                        {mpsData.map(mp => (
                                            <option key={mp.fullName} value={mp.fullName}>
                                                {mp.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Profile Card */}
                                {mpADetails && (
                                    <div className="profile-card card-a">
                                        <div className="profile-image">
                                            {mpADetails.image ? (
                                                <img
                                                    src={mpADetails.image}
                                                    alt={mpADetails.name}
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined">person</span>
                                            )}
                                        </div>
                                        <div className="profile-info">
                                            <h3>{mpADetails.name}</h3>
                                            <p className="constituency">{mpADetails.constituency}</p>
                                            <div className="badges">
                                                <span className="badge badge-primary">{mpADetails.house}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Spending Stats */}
                                {mpAData && mpADetails && (
                                    <div className="spending-stats">
                                        <div className="stats-info">
                                            <p className="stats-label">Total Spending</p>
                                            <p className="stats-amount amount-a">{formatCrores(mpAData.totalExpenditure)}</p>
                                            <p className="stats-utilization">
                                                <span className="material-symbols-outlined">analytics</span>
                                                {calculateUtilization(mpADetails)}% Utilized
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MP B Panel */}
                        <div className="comparison-panel panel-b">
                            <div className="panel-content">
                                {/* Selector */}
                                <div className="mp-selector">
                                    <label>Select Member B</label>
                                    <select value={mpB} onChange={(e) => setMpB(e.target.value)}>
                                        {mpsData.map(mp => (
                                            <option key={mp.fullName} value={mp.fullName}>
                                                {mp.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Profile Card */}
                                {mpBDetails && (
                                    <div className="profile-card card-b">
                                        <div className="profile-image">
                                            {mpBDetails.image ? (
                                                <img
                                                    src={mpBDetails.image}
                                                    alt={mpBDetails.name}
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined">person</span>
                                            )}
                                        </div>
                                        <div className="profile-info">
                                            <h3>{mpBDetails.name}</h3>
                                            <p className="constituency">{mpBDetails.constituency}</p>
                                            <div className="badges">
                                                <span className="badge badge-secondary">{mpBDetails.house}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Spending Stats */}
                                {mpBData && mpBDetails && (
                                    <div className="spending-stats">
                                        <div className="stats-info">
                                            <p className="stats-label">Total Spending</p>
                                            <p className="stats-amount amount-b">{formatCrores(mpBData.totalExpenditure)}</p>
                                            <p className="stats-utilization">
                                                <span className="material-symbols-outlined">analytics</span>
                                                {calculateUtilization(mpBDetails)}% Utilized
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Category Comparison */}
                <motion.div
                    className="category-comparison"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="section-header">
                        <h2>Category Comparison</h2>
                        <p>Fund allocation across key sectors</p>
                    </div>

                    <div className="comparison-table">
                        <div className="table-header">
                            <div className="header-cell category-header">Expenditure Category</div>
                            <div className="header-cell mp-header mp-a-header">
                                {mpADetails?.name || 'MP A'}
                            </div>
                            <div className="header-cell mp-header mp-b-header">
                                {mpBDetails?.name || 'MP B'}
                            </div>
                            <div className="header-cell delta-header">Delta (%)</div>
                        </div>

                        <AnimatePresence>
                            {comparisonData.map((category, index) => {
                                const delta = calculateDelta(category.mpA, category.mpB)
                                const isPositive = delta > 0

                                return (
                                    <motion.div
                                        key={category.label}
                                        className="table-row"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="table-cell category-cell">
                                            <span className="material-symbols-outlined">{getCategoryIcon(category.label)}</span>
                                            <span>{category.label}</span>
                                        </div>
                                        <div className="table-cell amount-cell amount-a">
                                            <span className="mobile-label">{mpADetails?.name || 'MP A'}:</span>
                                            {formatLakhs(category.mpA)}
                                        </div>
                                        <div className="table-cell amount-cell amount-b">
                                            <span className="mobile-label">{mpBDetails?.name || 'MP B'}:</span>
                                            {formatLakhs(category.mpB)}
                                        </div>
                                        <div className="table-cell delta-cell">
                                            <span className="mobile-label">Delta:</span>
                                            <span className={`delta-badge ${isPositive ? 'positive' : 'negative'}`}>
                                                <span className="material-symbols-outlined">
                                                    {isPositive ? 'arrow_upward' : 'arrow_downward'}
                                                </span>
                                                {Math.abs(delta)}%
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default MPComparisonPage
