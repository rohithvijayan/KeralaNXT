import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import highlightsData from '../data/budget2026/budgetHighlights.json'
import { shareElementAsImage } from '../utils/shareUtils'
import './BudgetHighlightsPage.css'

const BudgetHighlightsPage = () => {
    const navigate = useNavigate()
    const data = highlightsData.kerala_budget_2026_27_engagement_highlights
    const [activeCategory, setActiveCategory] = useState('all')

    const categories = useMemo(() => {
        const cats = data.categories.map(cat => ({
            name: cat.category_name,
            icon: cat.category_name.split(' ')[0], // Extract emoji as icon
            label: cat.category_name.split(' ').slice(1).join(' ')
        }))
        return [{ name: 'all', icon: '🎯', label: 'All Highlights' }, ...cats]
    }, [data.categories])

    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') {
            return data.categories.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category_name })))
        }
        const category = data.categories.find(cat => cat.category_name === activeCategory)
        return category ? category.items.map(item => ({ ...item, category: category.category_name })) : []
    }, [activeCategory, data.categories])

    const handleShare = (id, headline) => {
        shareElementAsImage(`highlight-${id}`, {
            title: 'Budget 2026 Highlight',
            text: `Check out this Kerala Budget 2026 highlight: ${headline}`,
            fileName: `budget-highlight-${id}.png`,
            backgroundColor: '#0c1613'
        })
    }

    return (
        <div className="budget-highlights-page">
            <Header
                showBack={true}
                title="Budget Highlights"
                onBack={() => navigate('/state-budget?year=2026-27')}
            />

            <div className="highlights-container">
                <header className="highlights-header">
                    <motion.div
                        className="hero-tag"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Top {data.total_items} Highlights
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Kerala Budget <span className="highlight-year">2026-27</span>
                    </motion.h1>
                    <motion.p
                        className="header-desc"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {data.description}
                    </motion.p>
                </header>

                <div className="category-scroller no-scrollbar">
                    {categories.map((cat, idx) => (
                        <motion.button
                            key={cat.name}
                            className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.name)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                        >
                            <span className="cat-icon">{cat.icon}</span>
                            <span className="cat-label">{cat.label}</span>
                        </motion.button>
                    ))}
                </div>

                <div className="highlights-grid">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                id={`highlight-${item.id}`}
                                className="highlight-card-wrapper"
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <div className="highlight-card glass-card">
                                    <div className="card-top">
                                        <span className="item-category">{item.category}</span>
                                        <button
                                            className="card-share-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShare(item.id, item.headline);
                                            }}
                                        >
                                            <span className="material-symbols-outlined">share</span>
                                        </button>
                                    </div>

                                    <h3 className="item-headline">{item.headline}</h3>
                                    <p className="item-details">{item.details}</p>

                                    <div className="card-stats">
                                        {item.allocation && (
                                            <div className="stat-item allocation">
                                                <span className="stat-label">Allocation</span>
                                                <span className="stat-value">{item.allocation}</span>
                                            </div>
                                        )}
                                        {item.impact && (
                                            <div className="stat-item impact">
                                                <span className="stat-label">Impact</span>
                                                <span className="stat-value">{item.impact}</span>
                                            </div>
                                        )}
                                    </div>

                                    {item.funding && (
                                        <div className="funding-source">
                                            <span className="material-symbols-outlined">payments</span>
                                            <span>Funding: {item.funding}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bottom-spacing" />
        </div>
    )
}

export default BudgetHighlightsPage
