import { useState, useMemo } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import { getPolicies, DEFAULT_YEAR } from '../data/budgetLoader'
import './PolicyInsightsPage.css'

function PolicyInsightsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const selectedYear = searchParams.get('year') || DEFAULT_YEAR

    const policies = useMemo(() => getPolicies(selectedYear), [selectedYear])

    const [expandedItems, setExpandedItems] = useState(new Set())
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Get total policy count
    const totalPolicies = policies.reduce((acc, cat) => acc + cat.policies.length, 0)

    // Filter policies based on category and search
    const filteredPolicies = useMemo(() => {
        let result = policies

        if (activeCategory !== 'all') {
            result = result.filter(cat => cat.key === activeCategory)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.map(cat => ({
                ...cat,
                policies: cat.policies.filter(p =>
                    p.title.toLowerCase().includes(query) ||
                    (p.statement && p.statement.toLowerCase().includes(query)) ||
                    (p.policy && p.policy.toLowerCase().includes(query)) ||
                    (p.description && p.description.toLowerCase().includes(query))
                )
            })).filter(cat => cat.policies.length > 0)
        }

        return result
    }, [policies, activeCategory, searchQuery])

    const toggleItem = (policyId) => {
        setExpandedItems(prev => {
            const next = new Set(prev)
            if (next.has(policyId)) {
                next.delete(policyId)
            } else {
                next.add(policyId)
            }
            return next
        })
    }

    // Category icons
    const getCategoryIcon = (key) => {
        const iconMap = {
            'Strategic_Vision_and_Overview': 'visibility',
            'Development_Policy_Frameworks': 'developer_board',
            'Fiscal_Federalism_and_Central_Relations': 'account_balance',
            'Investment_Roadmap_4_Pillars': 'trending_up',
            // 2026-27 keys
            'Strategic_and_Macro_Economic_Policies': 'analytics',
            'Fiscal_and_Tax_Reforms': 'payments',
            'Sectoral_Development_Policies': 'domain',
            'Governance_and_Social_Welfare_Policies': 'diversity_3'
        }
        return iconMap[key] || 'policy'
    }

    return (
        <div className="policy-insights-page">
            <Header
                showBack
                title="Policy Insights"
                onBack={() => navigate(`/state-budget?year=${selectedYear}`)}
            />

            {/* Desktop Breadcrumb */}
            <nav className="policy-breadcrumb desktop-only" aria-label="Breadcrumb">
                <Link to="/">Dashboard</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <Link to="/state-budget">State Budget</Link>
                <span className="material-symbols-outlined">chevron_right</span>
                <span className="current">Policy Insights</span>
            </nav>

            {/* Hero Section */}
            <section className="policy-hero">
                <div className="hero-icon-wrap">
                    <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <h1>Budget Policy Insights {selectedYear}</h1>
                <p>Strategic vision and policy frameworks guiding Kerala's development trajectory for {selectedYear}</p>
                <div className="hero-stats">
                    <div className="stat">
                        <span className="stat-value">{totalPolicies}</span>
                        <span className="stat-label">Policies</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">{policies.length}</span>
                        <span className="stat-label">Categories</span>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <div className="policy-filter-bar">
                <div className="category-pills">
                    <button
                        className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        <span className="material-symbols-outlined">apps</span>
                        All
                    </button>
                    {policies.map(cat => (
                        <button
                            key={cat.key}
                            className={`category-pill ${activeCategory === cat.key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.key)}
                        >
                            <span className="material-symbols-outlined">{getCategoryIcon(cat.key)}</span>
                            {cat.name.split('_').slice(0, 2).join(' ')}
                        </button>
                    ))}
                </div>

                <div className="search-box">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="search"
                        placeholder="Search policies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search policies"
                    />
                    {searchQuery && (
                        <button
                            className="clear-btn"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Policy Categories */}
            <div className="policy-categories">
                {filteredPolicies.map((category, catIndex) => (
                    <motion.section
                        key={category.key}
                        className="category-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.1 }}
                    >
                        <div className="category-header">
                            <div className="category-icon">
                                <span className="material-symbols-outlined">
                                    {getCategoryIcon(category.key)}
                                </span>
                            </div>
                            <div className="category-info">
                                <h2>{category.name}</h2>
                                <span className="policy-count">{category.policies.length} policies</span>
                            </div>
                        </div>

                        <div className="policy-cards">
                            {category.policies.map((policy, index) => {
                                const isExpanded = expandedItems.has(policy.id)
                                const content = policy.statement || policy.policy || policy.details || policy.description || ''
                                const isLong = content.length > 200

                                return (
                                    <motion.article
                                        key={policy.id}
                                        className={`policy-card ${isExpanded ? 'expanded' : ''}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <div className="policy-card-header">
                                            <h3>{policy.title}</h3>
                                            {policy.context && (
                                                <span className="policy-source">{policy.context}</span>
                                            )}
                                        </div>

                                        <p className={`policy-content ${isExpanded ? 'full' : 'truncated'}`}>
                                            {content}
                                        </p>

                                        {isLong && (
                                            <button
                                                className="read-more-btn"
                                                onClick={() => toggleItem(policy.id)}
                                            >
                                                {isExpanded ? 'Show Less' : 'Read More'}
                                                <span className="material-symbols-outlined">
                                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                                </span>
                                            </button>
                                        )}

                                        <div className="policy-card-footer">
                                            <button className="share-btn" aria-label={`Share ${policy.title}`}>
                                                <span className="material-symbols-outlined">share</span>
                                            </button>
                                            <button className="bookmark-btn" aria-label={`Bookmark ${policy.title}`}>
                                                <span className="material-symbols-outlined">bookmark_border</span>
                                            </button>
                                        </div>
                                    </motion.article>
                                )
                            })}
                        </div>
                    </motion.section>
                ))}
            </div>

            {/* Empty State */}
            {filteredPolicies.length === 0 && (
                <div className="empty-state">
                    <span className="material-symbols-outlined">search_off</span>
                    <h3>No policies found</h3>
                    <p>Try adjusting your search or filters</p>
                    <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Footer */}
            <footer className="policy-footer">
                <div className="footer-content">
                    <span className="material-symbols-outlined">info</span>
                    <div>
                        <strong>Source</strong>
                        <p>Citizen's Guide to Budget {selectedYear}, Government of Kerala</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default PolicyInsightsPage
