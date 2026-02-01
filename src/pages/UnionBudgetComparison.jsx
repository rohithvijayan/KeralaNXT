import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import Header from '../components/Header'
import { getUnionBudgetComparison, formatUnionAmount } from '../data/unionBudgetLoader'
import './UnionBudgetComparison.css'

const COLORS = ['#13ecb2', '#0fb48c', '#10221d', '#203c34', '#a0c4bb', '#61897f'];

const UnionBudgetComparison = () => {
    const navigate = useNavigate()
    const comparison = getUnionBudgetComparison()
    const [insightPage, setInsightPage] = useState(0)

    const macroData = comparison.macro_fiscal_framework
    const expenditureData = comparison.expenditure
    const sectorCompareData = comparison.sector_wise_allocation_comparison
    const insights = comparison.key_insights_compressed

    const itemsPerPage = 3
    const totalPages = Math.ceil(insights.length / itemsPerPage)
    const paginatedInsights = insights.slice(insightPage * itemsPerPage, (insightPage + 1) * itemsPerPage)

    // Composition Data for Donut (FY27)
    const totalExp = expenditureData.find(d => d.metric === "Total Expenditure")?.be_2026_27 || 0
    const interest = expenditureData.find(d => d.metric === "Interest Payments")?.be_2026_27 || 0
    const capital = expenditureData.find(d => d.metric === "Capital Expenditure")?.be_2026_27 || 0
    const otherExp = totalExp - interest - capital

    const compositionData = [
        { name: 'Interest', value: interest },
        { name: 'Capital Exp.', value: capital },
        { name: 'Others (Revenue)', value: otherExp }
    ]

    // Sector Comparison Data for Bar Chart
    const sectorChartData = sectorCompareData.map(d => ({
        name: d.sector.length > 15 ? d.sector.substring(0, 12) + '...' : d.sector,
        fullName: d.sector,
        'FY26': d.be_2025_26,
        'FY27': d.be_2026_27
    }))

    const deficitData = macroData.filter(d => d.unit === "Percentage of GDP").map(d => ({
        name: d.metric.replace(' Deficit', ''),
        'FY26': d.be_2025_26,
        'FY27': d.be_2026_27
    }))

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ background: '#fff', padding: '12px', border: '1px solid #dbe6e3', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p className="label" style={{ fontWeight: 800, margin: '0 0 8px', color: '#10221d' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color, margin: '4px 0', fontSize: '13px', fontWeight: 700 }}>
                            {p.name === '2025_26' ? 'FY26 BE' : 'FY27 BE'}: {p.value.toLocaleString('en-IN')}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="comparison-page">
            <Header
                showBack
                title="Budget Visualization"
                onBack={() => navigate('/union-budget-glance')}
            />

            <section className="comp-hero">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h1>Union Budget Decoded</h1>
                    <p>Comparative deep-dive into Union Budget {comparison.metadata.fiscal_years_compared[1]}</p>
                </motion.div>
            </section>

            <main className="comp-section">
                {/* 1. Key Insights Section */}
                <div className="section-header">
                    <h3 className="section-title">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        Strategic Insights
                    </h3>
                    <div className="insight-nav">
                        <button
                            className={`nav-btn ${insightPage === 0 ? 'disabled' : ''}`}
                            onClick={() => setInsightPage(p => Math.max(0, p - 1))}
                            disabled={insightPage === 0}
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <span className="page-indicator">{insightPage + 1} / {totalPages}</span>
                        <button
                            className={`nav-btn ${insightPage >= totalPages - 1 ? 'disabled' : ''}`}
                            onClick={() => setInsightPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={insightPage >= totalPages - 1}
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
                <div className="insights-grid">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={insightPage}
                            className="insights-container"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {paginatedInsights.map((item, i) => (
                                <div key={i} className="insight-card">
                                    <div className="insight-icon">
                                        <span className="material-symbols-outlined">lightbulb</span>
                                    </div>
                                    <p>{item.insight}</p>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. Expenditure Composition (Donut) */}
                <div className="chart-card" style={{ marginTop: '40px' }}>
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="material-symbols-outlined">donut_large</span>
                            Expenditure Composition (FY27)
                        </h3>
                    </div>
                    <div className="chart-flex-container">
                        <div className="chart-wrapper donut-wrap">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={compositionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {compositionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatUnionAmount(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-legend-side">
                            {compositionData.map((item, i) => (
                                <div key={i} className="legend-item-side">
                                    <div className="dot" style={{ background: COLORS[i % COLORS.length] }}></div>
                                    <div className="label-wrap">
                                        <span className="name">{item.name}</span>
                                        <span className="val">{((item.value / totalExp) * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Sector-wise Allocation Comparison (Bar) */}
                <div className="chart-card">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="material-symbols-outlined">bar_chart</span>
                            Sector-wise Shifts
                        </h3>
                    </div>
                    <div className="chart-wrapper sector-chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={sectorChartData}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 700 }}
                                />
                                <Tooltip
                                    formatter={(value, name, props) => [formatUnionAmount(value), name]}
                                    labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                                />
                                <Bar name="FY26" dataKey="FY26" fill="#a0c4bb" radius={[0, 4, 4, 0]} barSize={10} />
                                <Bar name="FY27" dataKey="FY27" fill="var(--comp-primary)" radius={[0, 4, 4, 0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Deficit Targets */}
                <div className="chart-card">
                    <div className="section-header">
                        <h3 className="section-title">Deficit Targets (% of GDP)</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={deficitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 6]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip />
                                <Legend />
                                <Line name="FY26" type="monotone" dataKey="FY26" stroke="#9ca3af" strokeWidth={2} dot={{ r: 4 }} />
                                <Line name="FY27" type="monotone" dataKey="FY27" stroke="var(--comp-primary)" strokeWidth={3} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default UnionBudgetComparison
