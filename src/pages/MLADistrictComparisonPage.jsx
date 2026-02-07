import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import districtData from '../data/districtSummary.json'
import './MLADistrictComparisonPage.css'

const SectorItem = ({ sector, index }) => (
    <motion.div
        className="dc-sector-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <div className="dc-sector-header">
            <span className="dc-sector-icon">{getSectorIcon(sector.label)}</span>
            <span className="dc-sector-name">{sector.label}</span>
        </div>
        <div className="dc-progress-bar">
            <motion.div
                className="dc-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (sector.value_crores / 10) * 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
            />
        </div>
        <div className="dc-sector-amount">₹{sector.value_crores.toFixed(1)} Cr</div>
    </motion.div>
)

const ConstituencyCard = ({ constituency }) => (
    <div className="dc-constituency-pill">
        <div className="dc-constituency-circle">
            <svg viewBox="0 0 36 36">
                <path
                    className="dc-circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                    className="dc-circle-fill"
                    strokeDasharray={`${constituency.utilization}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
            <div className="dc-circle-text">
                <span className="dc-circle-amount">{Math.round(constituency.expenditure)}</span>
                <span className="dc-circle-unit">Cr</span>
            </div>
        </div>
        <span className="dc-constituency-name">{constituency.name}</span>
    </div>
)

const DistrictCard = ({ district, rank, isExpanded, onToggle }) => {
    const scrollRef = useRef(null)

    const handleScroll = (direction, e) => {
        e.stopPropagation()
        if (scrollRef.current) {
            const scrollAmount = 300
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className={`dc-district-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="dc-card-main" onClick={onToggle}>
                <div className="dc-rank-section">
                    <div className={`dc-rank-badge rank-${rank}`}>
                        {rank}
                    </div>
                    <div className="dc-district-info">
                        <h3>{district.name}</h3>
                        {rank <= 3 && <span className="dc-performer-badge">Top Performer</span>}
                    </div>
                </div>
                <div className="dc-expenditure-section">
                    <div className="dc-main-amount">
                        ₹{district.totalExpenditure.toFixed(1)} <span className="dc-unit">Cr</span>
                    </div>
                    <div className="dc-util-row">
                        <span className="material-symbols-outlined">trending_up</span>
                        <span>{district.utilization}% Utilized</span>
                    </div>
                </div>
                <span className="material-symbols-outlined dc-expand-icon">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="dc-card-expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="dc-expanded-content">
                            <div className="dc-section-label">Sectoral Breakdown</div>
                            <div className="dc-sectors-grid">
                                {district.sectors.slice(0, 4).map((s, i) => (
                                    <SectorItem key={s.label} sector={s} index={i} />
                                ))}
                            </div>

                            <div className="dc-section-label">Constituency Expenditure</div>
                            <div className="dc-scroll-wrapper">
                                <button
                                    className="dc-scroll-btn prev"
                                    onClick={(e) => handleScroll('left', e)}
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>

                                <div className="dc-constituency-scroll" ref={scrollRef}>
                                    {district.constituencies.map(c => (
                                        <ConstituencyCard key={c.name} constituency={c} />
                                    ))}
                                </div>

                                <button
                                    className="dc-scroll-btn next"
                                    onClick={(e) => handleScroll('right', e)}
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function MLADistrictComparisonPage() {
    const navigate = useNavigate()
    const [expandedDistrict, setExpandedDistrict] = useState(districtData[0].name)

    const handleToggle = (name) => {
        setExpandedDistrict(expandedDistrict === name ? null : name)
    }

    return (
        <div className="dc-page">
            <Header
                showBack
                title="District Comparison"
                onBack={() => navigate('/mla-fund')}
            />

            <main className="dc-container">
                <div className="dc-header">
                    <h1 className="dc-title">Leaderboard</h1>
                    <p className="dc-subtitle">Comparing fund utilization across 14 Kerala districts</p>
                </div>

                <div className="dc-list">
                    {districtData.map((district, index) => (
                        <DistrictCard
                            key={district.name}
                            district={district}
                            rank={index + 1}
                            isExpanded={expandedDistrict === district.name}
                            onToggle={() => handleToggle(district.name)}
                        />
                    ))}
                </div>

                <div className="dc-ambient-glow-1" />
                <div className="dc-ambient-glow-2" />
            </main>
        </div>
    )
}

// Helpers
function getSectorIcon(label) {
    const iconMap = {
        'Road': '🛣️',
        'Roads': '🛣️',
        'Education': '🎓',
        'School': '🎓',
        'Healthcare': '🏥',
        'Health': '🏥',
        'Irrigation': '💧',
        'Water': '💧',
        'Infrastructure': '🏗️',
        'Electricity': '⚡',
        'Sports': '🏆',
        'Others': '📂'
    }
    return iconMap[label] || '📂'
}

export default MLADistrictComparisonPage
