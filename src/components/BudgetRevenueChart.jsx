import { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { getRevenueBreakdown } from '../data/budgetLoader'

ChartJS.register(ArcElement, Tooltip, Legend)

const BudgetRevenueChart = ({ fiscalYear }) => {
    const [revenueData, setRevenueData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadRevenueData = async () => {
            setLoading(true)
            try {
                const data = await getRevenueBreakdown(fiscalYear)
                setRevenueData(data)
            } catch (error) {
                console.error('Error loading revenue breakdown:', error)
            } finally {
                setLoading(false)
            }
        }
        loadRevenueData()
    }, [fiscalYear])

    const sources = revenueData?.sources || []

    const data = useMemo(() => ({
        labels: sources.map(s => s.category),
        datasets: [
            {
                data: sources.map(s => s.percentage),
                backgroundColor: [
                    '#10b981', // Emerald
                    '#3b82f6', // Blue
                    '#f59e0b', // Amber
                    '#8b5cf6', // Violet
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 15,
                cutout: '75%'
            },
        ],
    }), [sources])

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                padding: 12,
                borderColor: '#e5e7eb',
                borderWidth: 1,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        return ` ${context.label}: ${context.raw}%`
                    }
                }
            }
        },
        maintainAspectRatio: false
    }

    if (loading) {
        return <div className="chart-loading-placeholder" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Chart...</div>
    }

    if (!revenueData) return null

    return (
        <section className="revenue-viz-section">
            <div className="section-header">
                <h2>Where the Rupee Comes From</h2>
            </div>

            <div className="viz-card">
                <div className="chart-container-donut">
                    <Doughnut data={data} options={options} />
                    <div className="chart-center-label">
                        <span className="label-text">Revenue</span>
                        <span className="label-year">{fiscalYear}</span>
                    </div>
                </div>

                <div className="chart-legend-grid">
                    {sources.map((source, index) => (
                        <div key={source.category} className="legend-item-donut">
                            <div className="legend-marker" style={{ background: data.datasets[0].backgroundColor[index] }} />
                            <div className="legend-info">
                                <span className="legend-name">{source.category}</span>
                                <span className="legend-value">{source.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default BudgetRevenueChart
