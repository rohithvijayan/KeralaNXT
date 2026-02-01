import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
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
    const metadata = getBudgetMetadata()
    const glance = getUnionBudgetGlance()
    const deficits = getDeficitIndicators()
    const { comesFrom, goesTo } = getRupeeProfile()

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
        </div>
    )
}

export default UnionBudgetAtGlance
