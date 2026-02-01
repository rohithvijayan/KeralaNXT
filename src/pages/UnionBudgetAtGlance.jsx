import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import CldImage from '../components/CldImage'
import { shareElementAsImage } from '../utils/shareUtils'
import {
    getUnionBudgetGlance,
    getBudgetMetadata,
    formatUnionAmount,
    getDeficitIndicators,
    getRupeeProfile,
    getSectoralAllocations
} from '../data/unionBudgetLoader'
import './UnionBudgetAtGlance.css'

const UnionBudgetAtGlance = () => {
    const navigate = useNavigate()
    const [isKeralaModalOpen, setIsKeralaModalOpen] = useState(false)
    const metadata = getBudgetMetadata()
    // ... rest of the constants
    const glance = getUnionBudgetGlance()
    const deficits = getDeficitIndicators()
    const { comesFrom, goesTo } = getRupeeProfile()
    const sectoral = getSectoralAllocations()

    const handleShare = () => {
        shareElementAsImage('kerala-share-card', {
            title: "Kerala's Budget Share 2026",
            text: "Analyzing Kerala's share in the Union Budget 2026 via KeralaNXT.",
            fileName: 'kerala-budget-share-2026.png',
            backgroundColor: '#ffffff'
        })
    }
    const totalExpenditure = glance.budget_aggregates.data.find(d => d.category === "Total Expenditure")?.["2026_27_budget_estimates"] || 0

    const colors = [
        '#13ecb2', '#0fb48c', '#203c34', '#1e463a', '#a0c4bb', '#61897f', '#dbe6e3'
    ]

    const usageColors = [
        '#ef4444', '#f87171', '#fca5a5', '#fee2e2', '#d1d5db', '#9ca3af', '#6b7280'
    ]

    return (
        <div className="union-glance-page">
            <Header
                showBack
                title="Union Budget 2026"
                onBack={() => navigate('/state-budget')}
            />

            <main>
                <section className="union-hero">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="hero-tag">Union Budget {metadata.financial_year} At a Glance</span>
                        <h1 className="hero-title">Total Expenditure: {formatUnionAmount(totalExpenditure)}</h1>
                        <p className="hero-desc">
                            Strategic allocation focused on infrastructure growth, digital economy, and social welfare for a future-ready India.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-hero" onClick={() => navigate('/union-budget-comparison')}>
                                <span className="material-symbols-outlined">stacked_bar_chart</span> Comparative Analysis
                            </button>
                            <button className="btn-cta keral-highlight" onClick={() => setIsKeralaModalOpen(true)}>
                                <div className="cta-kerala-content">
                                    <span className="kerala-label">Special View</span>
                                    <h3>What Kerala Got?</h3>
                                </div>
                                <span className="material-symbols-outlined">explore</span>
                            </button>
                        </div>
                    </motion.div>
                </section>

                <section className="glance-section">
                    <div className="section-header">
                        <h2 className="section-title">Key Fiscal Indicators</h2>
                        <span className="kpi-label-tag">BE 2026-27</span>
                    </div>

                    <div className="kpi-scroll">
                        {deficits.map((d, i) => (
                            <motion.div
                                key={i}
                                className="kpi-card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="kpi-top">
                                    <div className="kpi-icon-box">
                                        <span className="material-symbols-outlined">
                                            {d.indicator.includes('Deficit') ? 'trending_down' : 'payments'}
                                        </span>
                                    </div>
                                    <span className="kpi-label-tag">{d["2026_27_percent_gdp"] ? 'OF GDP' : 'INR CR'}</span>
                                </div>
                                <div className="kpi-val-container">
                                    <p>{d.indicator}</p>
                                    <h3 className="kpi-value">
                                        {d["2026_27_percent_gdp"]
                                            ? `${d["2026_27_percent_gdp"]}%`
                                            : formatUnionAmount(d["2026_27_amount"], true)}
                                    </h3>
                                    {d.indicator === 'Fiscal Deficit' && <span className="kpi-sub">Target: 4.5%</span>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="glance-section rupee-breakdown">
                    <div className="rupee-container">
                        {/* Comes From */}
                        <div className="rupee-card">
                            <div className="rupee-header">
                                <span className="material-symbols-outlined" style={{ color: 'var(--union-primary)' }}>login</span>
                                <h3>Rupee Comes From</h3>
                            </div>
                            <div className="rupee-bar">
                                {comesFrom.map((item, i) => (
                                    <div
                                        key={i}
                                        className="bar-segment"
                                        style={{ width: `${item.percentage}%`, background: colors[i % colors.length] }}
                                    ></div>
                                ))}
                            </div>
                            <div className="rupee-list">
                                {comesFrom.slice(0, 5).map((item, i) => (
                                    <div key={i} className="rupee-item">
                                        <div className="item-left">
                                            <div className="dot" style={{ background: colors[i % colors.length] }}></div>
                                            <span>{item.source}</span>
                                        </div>
                                        <span className="item-val">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Goes To */}
                        <div className="rupee-card">
                            <div className="rupee-header">
                                <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>logout</span>
                                <h3>Rupee Goes To</h3>
                            </div>
                            <div className="rupee-bar">
                                {goesTo.map((item, i) => (
                                    <div
                                        key={i}
                                        className="bar-segment"
                                        style={{ width: `${item.percentage}%`, background: usageColors[i % usageColors.length] }}
                                    ></div>
                                ))}
                            </div>
                            <div className="rupee-list">
                                {goesTo.slice(0, 5).map((item, i) => (
                                    <div key={i} className="rupee-item">
                                        <div className="item-left">
                                            <div className="dot" style={{ background: usageColors[i % usageColors.length] }}></div>
                                            <span>{item.item}</span>
                                        </div>
                                        <span className="item-val">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="glance-section">
                    <div className="section-header">
                        <h2 className="section-title">Key Sectoral Allocations</h2>
                    </div>
                    <div className="sector-cta-wrap">
                        <button className="btn-cta" onClick={() => navigate('/union-sector-allocation')}>
                            <span>Sectoral Allocation</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <button className="btn-cta secondary" onClick={() => navigate('/union-budget-highlights')}>
                            <span>Budget Highlights</span>
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </button>
                    </div>
                </section>
            </main>

            <AnimatePresence>
                {isKeralaModalOpen && (
                    <div className="kerala-modal-overlay" onClick={() => setIsKeralaModalOpen(false)}>
                        <motion.div
                            className="kerala-modal-card"
                            id="kerala-share-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-actions-top">
                                <button className="modal-close-btn" onClick={() => setIsKeralaModalOpen(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="kerala-modal-header">
                                <span className="kerala-label">Union Budget Analysis</span>
                                <h2>Kerala's Share in 2026</h2>
                            </div>

                            <div className="kerala-modal-body">
                                <div className="egg-image-container">
                                    <CldImage
                                        src="close-up-boiled-egg-removebg-preview_cuzaz3"
                                        alt="What Kerala Got"
                                        className="egg-image"
                                        width={400}
                                        height={400}
                                    />
                                </div>
                                <div className="insight-message">
                                    <CldImage
                                        src="സുരേഷ്_ഗോപിടെ_AIIMS_വന്നില്ല_ശ്രീധരന്റെ_Speed_Railum_വന്നില്ല_ഒരു_മണ്ണാങ്കട്ടയും_വന്നില്ല_1_jrihjo"
                                        alt="Budget Satire"
                                        className="insight-image"
                                        width={600}
                                        height={400}
                                        mode="fit"
                                    />
                                    <span className="insight-tag">Net Impact Analysis</span>
                                </div>
                            </div>

                            <button className="modal-share-cta" onClick={handleShare}>
                                <span className="material-symbols-outlined">share</span>
                                Share
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UnionBudgetAtGlance
