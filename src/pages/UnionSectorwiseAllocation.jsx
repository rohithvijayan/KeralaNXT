import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { getUnionSectorWiseAllocation, formatUnionAmount } from '../data/unionBudgetLoader'
import './UnionSectorwiseAllocation.css'

const UnionSectorwiseAllocation = () => {
    const navigate = useNavigate()
    const data = getUnionSectorWiseAllocation()

    const categories = [
        {
            title: "Social Services",
            icon: "group",
            total: data.total_social_services,
            items: [
                { name: "Education", val: data.education },
                { name: "Health", val: data.health },
                { name: "Women & Child Development", val: data.women_and_child_development },
                { name: "Social Welfare & Nutrition", val: data.social_welfare_and_nutrition }
            ]
        },
        {
            title: "Agri & Rural",
            icon: "agriculture",
            total: data.total_agriculture_and_rural_development,
            items: [
                { name: "Agriculture & Allied", val: data.agriculture_and_allied_activities },
                { name: "Rural Development", val: data.rural_development }
            ]
        },
        {
            title: "Infrastructure & Econ",
            icon: "construction",
            total: data.total_infrastructure_and_economic_services,
            items: [
                { name: "Transport", val: data.transport },
                { name: "Energy", val: data.energy },
                { name: "Industry & Commerce", val: data.industry_and_commerce },
                { name: "IT & Telecom", val: data.communications_it_and_telecom }
            ]
        },
        {
            title: "Urban & Housing",
            icon: "apartment",
            total: data.total_urban_development_and_housing,
            items: [
                { name: "Urban Development", val: data.urban_development },
                { name: "Housing", val: data.housing_and_urban_affairs }
            ]
        },
        {
            title: "General Services",
            icon: "account_balance",
            total: data.total_general_services,
            items: [
                { name: "Interest Payments", val: data.interest_payments },
                { name: "Pensions", val: data.pensions },
                { name: "Administrative Services", val: data.administrative_services }
            ]
        },
        {
            title: "Defence",
            icon: "shield",
            total: data.total_defence,
            items: [
                { name: "Defence Revenue & Capital", val: data.defence_services_revenue_and_capital }
            ]
        }
    ]

    return (
        <div className="sector-allocation-page">
            <Header
                showBack
                title="Sector Allocation"
                onBack={() => navigate('/union-budget-glance')}
            />

            <section className="allocation-summary">
                <span className="summary-label">Union Budget {data.budget_year} Total Expenditure</span>
                <h1 className="summary-total">{formatUnionAmount(data.total_covered_expenditure)}</h1>
                <p className="summary-meta">Breakdown of primary allocations across major government sectors.</p>
            </section>

            <main className="allocation-list">
                {categories.map((cat, idx) => (
                    <motion.div
                        key={cat.title}
                        className="category-group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="category-header">
                            <div className="cat-title-wrap">
                                <div className="cat-icon-box">
                                    <span className="material-symbols-outlined">{cat.icon}</span>
                                </div>
                                <span className="cat-title">{cat.title}</span>
                            </div>
                            <span className="cat-total">{formatUnionAmount(cat.total, true)}</span>
                        </div>
                        <div className="category-items">
                            {cat.items.map(item => (
                                <div key={item.name} className="sector-row">
                                    <div className="sector-info">
                                        <span className="sector-name">{item.name}</span>
                                        <span className="sector-val">{formatUnionAmount(item.val, true)}</span>
                                    </div>
                                    <div className="progress-track">
                                        <motion.div
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.val / cat.total) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </main>
        </div>
    )
}

export default UnionSectorwiseAllocation
