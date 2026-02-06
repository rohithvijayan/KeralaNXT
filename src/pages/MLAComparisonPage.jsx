import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import { getAllMLAs } from '../data/mlaFundLoader'
import { getMLASpendingBreakdown, getCategoryIcon, formatAmountCr } from '../data/mlaAnalyticsLoader'
import { shareElementAsImage } from '../utils/shareUtils'
import CldImage from '../components/CldImage'
import './MLAComparisonPage.css'

const MLAComparisonPage = () => {
    const navigate = useNavigate()
    const [mlaA, setMlaA] = useState('')
    const [mlaB, setMlaB] = useState('')
    const [mlasData, setMlasData] = useState([])
    const [loading, setLoading] = useState(true)
    const [mlaAFullData, setMlaAFullData] = useState(null)
    const [mlaBFullData, setMlaBFullData] = useState(null)

    // Load all MLAs data
    useEffect(() => {
        const loadMLAs = async () => {
            setLoading(true)
            try {
                const data = getAllMLAs()
                setMlasData(data)

                // Set initial selections once data is loaded
                if (data.length > 0) {
                    setMlaA(data[0].id)
                }
                if (data.length > 1) {
                    setMlaB(data[1].id)
                }
            } catch (error) {
                console.error('Error loading MLAs for comparison:', error)
            } finally {
                setLoading(false)
            }
        }
        loadMLAs()
    }, [])

    // Fetch detailed data for MLA A
    useEffect(() => {
        const loadMlaAData = async () => {
            if (!mlaA) return
            const data = await getMLASpendingBreakdown(mlaA)
            setMlaAFullData(data)
        }
        loadMlaAData()
    }, [mlaA])

    // Fetch detailed data for MLA B
    useEffect(() => {
        const loadMlaBData = async () => {
            if (!mlaB) return
            const data = await getMLASpendingBreakdown(mlaB)
            setMlaBFullData(data)
        }
        loadMlaBData()
    }, [mlaB])

    // Get simple MLA details from mlasData for profiles
    const mlaADetails = useMemo(() =>
        mlasData.find(mla => mla.id === mlaA), [mlasData, mlaA])

    const mlaBDetails = useMemo(() =>
        mlasData.find(mla => mla.id === mlaB), [mlasData, mlaB])

    // Calculate comparison data
    const comparisonData = useMemo(() => {
        if (!mlaAFullData || !mlaBFullData || !mlaAFullData.breakdown || !mlaBFullData.breakdown) return []

        const categories = new Map()

        // Add MLA A categories
        mlaAFullData.breakdown.forEach(item => {
            categories.set(item.label, {
                label: item.label,
                mlaA: item.value,
                mlaB: 0
            })
        })

        // Add MLA B categories
        mlaBFullData.breakdown.forEach(item => {
            if (categories.has(item.label)) {
                categories.get(item.label).mlaB = item.value
            } else {
                categories.set(item.label, {
                    label: item.label,
                    mlaA: 0,
                    mlaB: item.value
                })
            }
        })

        return Array.from(categories.values()).sort((a, b) =>
            (b.mlaA + b.mlaB) - (a.mlaA + a.mlaB)
        )
    }, [mlaAFullData, mlaBFullData])

    // Calculate percentage difference
    const calculateDelta = (valA, valB) => {
        if (valB === 0) return valA > 0 ? 100 : 0
        return (((valA - valB) / valB) * 100).toFixed(1)
    }

    const handleShare = () => {
        shareElementAsImage('comparison-card', {
            title: 'MLA Fiscal Comparison',
            text: `Comparing the fund utilization of ${mlaADetails?.name} and ${mlaBDetails?.name} via keralaStory.`,
            fileName: `mla-comparison-${mlaADetails?.name}-${mlaBDetails?.name}.png`.replace(/\s+/g, '-').toLowerCase()
        })
    }

    if (loading) return <div className="loading-container">Loading MLA Fund Data...</div>

    return (
        <div className="comparison-page">
            <Header
                showBack={true}
                title="MLA Comparison"
                onBack={() => navigate('/mla-fund-dashboard')}
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
                            <h1>MLA Fiscal Comparison</h1>
                            <p>Premium performance analysis and fund utilization breakdown</p>
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
                        {/* MLA A Panel */}
                        <div className="comparison-panel panel-a">
                            <div className="panel-content">
                                {/* Selector */}
                                <div className="mla-selector">
                                    <label>Select MLA A</label>
                                    <select value={mlaA} onChange={(e) => setMlaA(e.target.value)}>
                                        {mlasData.map(mla => (
                                            <option key={mla.id} value={mla.id}>
                                                {mla.name} ({mla.constituency})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Profile Card */}
                                {mlaADetails && (
                                    <div className="profile-card card-a">
                                        <div className="profile-image">
                                            {mlaADetails.image ? (
                                                <CldImage
                                                    src={mlaADetails.image}
                                                    alt={mlaADetails.name}
                                                    width={300}
                                                    height={300}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined">person</span>
                                            )}
                                        </div>
                                        <div className="profile-info">
                                            <h3>{mlaADetails.name.replace(/^(Shri|Smt|Dr\.?)\s+/i, '')}</h3>
                                            <p className="constituency">{mlaADetails.constituency}</p>
                                            <div className="badges">
                                                <span className="badge badge-primary">{mlaADetails.district}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Spending Stats */}
                                {mlaAFullData && (
                                    <div className="spending-stats">
                                        <div className="stats-info">
                                            <p className="stats-label">Total Expenditure</p>
                                            <p className="stats-amount amount-a">{formatAmountCr(mlaAFullData.totalExpenditure)}</p>
                                            <p className="stats-utilization">
                                                <span className="material-symbols-outlined">analytics</span>
                                                {mlaAFullData.projectCount} Projects Tracked
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MLA B Panel */}
                        <div className="comparison-panel panel-b">
                            <div className="panel-content">
                                {/* Selector */}
                                <div className="mla-selector">
                                    <label>Select MLA B</label>
                                    <select value={mlaB} onChange={(e) => setMlaB(e.target.value)}>
                                        {mlasData.map(mla => (
                                            <option key={mla.id} value={mla.id}>
                                                {mla.name} ({mla.constituency})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Profile Card */}
                                {mlaBDetails && (
                                    <div className="profile-card card-b">
                                        <div className="profile-image">
                                            {mlaBDetails.image ? (
                                                <CldImage
                                                    src={mlaBDetails.image}
                                                    alt={mlaBDetails.name}
                                                    width={300}
                                                    height={300}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined">person</span>
                                            )}
                                        </div>
                                        <div className="profile-info">
                                            <h3>{mlaBDetails.name.replace(/^(Shri|Smt|Dr\.?)\s+/i, '')}</h3>
                                            <p className="constituency">{mlaBDetails.constituency}</p>
                                            <div className="badges">
                                                <span className="badge badge-secondary">{mlaBDetails.district}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Spending Stats */}
                                {mlaBFullData && (
                                    <div className="spending-stats">
                                        <div className="stats-info">
                                            <p className="stats-label">Total Expenditure</p>
                                            <p className="stats-amount amount-b">{formatAmountCr(mlaBFullData.totalExpenditure)}</p>
                                            <p className="stats-utilization">
                                                <span className="material-symbols-outlined">analytics</span>
                                                {mlaBFullData.projectCount} Projects Tracked
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
                        <p>Fund allocation across key sectors (in Crores)</p>
                    </div>

                    <div className="comparison-table">
                        <div className="table-header">
                            <div className="header-cell category-header">Expenditure Category</div>
                            <div className="header-cell mp-header mp-a-header">
                                {mlaADetails?.name.replace(/^(Shri|Smt|Dr\.?)\s+/i, '') || 'MLA A'}
                            </div>
                            <div className="header-cell mp-header mp-b-header">
                                {mlaBDetails?.name.replace(/^(Shri|Smt|Dr\.?)\s+/i, '') || 'MLA B'}
                            </div>
                            <div className="header-cell delta-header">Delta (%)</div>
                        </div>

                        <AnimatePresence>
                            {comparisonData.map((category, index) => {
                                const delta = calculateDelta(category.mlaA, category.mlaB)
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
                                            <span className="mobile-label">{mlaADetails?.name.replace(/^(Shri|Smt|Dr\.?)\s+/i, '') || 'MLA A'}:</span>
                                            {category.mlaA.toFixed(2)} Cr
                                        </div>
                                        <div className="table-cell amount-cell amount-b">
                                            <span className="mobile-label">{mlaBDetails?.name.replace(/^(Shri|Smt|Dr\.?)\s+/i, '') || 'MLA B'}:</span>
                                            {category.mlaB.toFixed(2)} Cr
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

export default MLAComparisonPage
