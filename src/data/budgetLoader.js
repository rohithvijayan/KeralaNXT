/**
 * Budget Data Loader Utilities
 * Centralizes data access for all budget-related components
 */

import quickGlance from './budget/quickGlanceBudget.json'
import projectsData from './budget/projectsInBudget.json'
import policiesData from './budget/budgetPolicies.json'

// ============== FORMAT HELPERS ==============

/**
 * Format number to Indian currency format (₹ with lakhs/crores)
 * @param {number} amount - Amount in crores
 * @param {boolean} showSymbol - Whether to show ₹ symbol
 * @returns {string} Formatted amount
 */
export function formatAmount(amount, showSymbol = true) {
    if (amount === null || amount === undefined) return 'N/A'

    const num = parseFloat(amount)
    if (isNaN(num)) return amount.toString()

    const symbol = showSymbol ? '₹' : ''

    if (num >= 10000) {
        return `${symbol}${(num / 100000).toFixed(2)}L Cr`
    } else if (num >= 100) {
        return `${symbol}${num.toLocaleString('en-IN')} Cr`
    } else {
        return `${symbol}${num.toFixed(2)} Cr`
    }
}

/**
 * Format percentage with sign
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
    if (value === null || value === undefined) return 'N/A'
    const num = parseFloat(value)
    if (isNaN(num)) return value.toString()

    const sign = num >= 0 ? '+' : ''
    return `${sign}${num.toFixed(2)}%`
}

/**
 * Parse allocation string to number (handles "₹750 Crore", "₹10 Lakhs", etc.)
 * @param {string} allocation - Allocation string
 * @returns {number} Parsed amount in crores
 */
export function parseAllocation(allocation) {
    if (!allocation || allocation === 'Not specified') return 0

    const cleanStr = allocation.replace(/[₹,]/g, '').toLowerCase()

    // Extract numeric value
    const numMatch = cleanStr.match(/[\d.]+/)
    if (!numMatch) return 0

    const num = parseFloat(numMatch[0])

    // Convert to crores
    if (cleanStr.includes('lakh')) {
        return num / 100
    }
    return num
}

// ============== DATA ACCESSORS ==============

/**
 * Get fiscal overview data (KPIs)
 * @returns {Object} Key fiscal indicators
 */
export function getFiscalOverview() {
    const kpi = quickGlance.key_fiscal_indicators_2025_26
    return {
        totalExpenditure: kpi.total_expenditure,
        totalReceipts: kpi.total_receipts,
        revenueDeficit: kpi.revenue_deficit,
        revenueDeficitPercent: kpi.revenue_deficit_gsdp_percentage,
        fiscalDeficit: kpi.fiscal_deficit,
        fiscalDeficitPercent: kpi.fiscal_deficit_gsdp_percentage,
        gsdp: kpi.gsdp_estimate,
        debtPercent: kpi.total_debt_gsdp_percentage
    }
}

/**
 * Get revenue breakdown
 * @returns {Object} Revenue sources with percentages
 */
export function getRevenueBreakdown() {
    const revenue = quickGlance.revenue_insights
    return {
        total: revenue.total_revenue_receipts,
        sources: revenue.sources.map(src => ({
            category: src.category,
            amount: src.amount,
            percentage: src.percentage_of_total_revenue,
            components: src.major_components || []
        }))
    }
}

/**
 * Get expenditure breakdown (CAPEX/REVEX)
 * @returns {Object} Capital and revenue expenditure data
 */
export function getExpenditureBreakdown() {
    const exp = quickGlance.expenditure_insights
    return {
        revenue: {
            total: exp.revenue_expenditure.total,
            allocations: exp.revenue_expenditure.major_allocations
        },
        capital: {
            total: exp.capital_expenditure.total_outlay,
            allocations: exp.capital_expenditure.major_allocations
        },
        capexPercent: ((exp.capital_expenditure.total_outlay / quickGlance.key_fiscal_indicators_2025_26.total_expenditure) * 100).toFixed(1),
        revexPercent: ((exp.revenue_expenditure.total / quickGlance.key_fiscal_indicators_2025_26.total_expenditure) * 100).toFixed(1)
    }
}

/**
 * Get major project highlights grouped by category
 * @returns {Object} Projects by sector
 */
export function getProjectHighlights() {
    return quickGlance.major_project_highlights
}

// ============== PROJECTS DATA ==============

/**
 * Flatten nested projects structure to array
 * @returns {Array} Flat array of all projects with sector info
 */
export function getAllProjects() {
    const budgetData = projectsData.Budget_2025_26_Spending_Only
    const projects = []

    // Process Part I and II (Strategic)
    const partI = budgetData.Part_I_and_II_Strategic_and_New_Initiatives
    Object.entries(partI).forEach(([sectorKey, sectorData]) => {
        Object.entries(sectorData).forEach(([projectKey, project]) => {
            if (project.id) {
                projects.push({
                    ...project,
                    key: projectKey,
                    title: projectKey.replace(/_/g, ' '),
                    sector: sectorKey.replace(/_/g, ' '),
                    sectorKey,
                    part: 'strategic',
                    parsedAllocation: parseAllocation(project.allocation)
                })
            }
        })
    })

    // Process Part III (Sectoral)
    const partIII = budgetData.Part_III_Sectoral_Allocations
    Object.entries(partIII).forEach(([sectorKey, sectorData]) => {
        Object.entries(sectorData).forEach(([projectKey, project]) => {
            if (project.id) {
                projects.push({
                    ...project,
                    key: projectKey,
                    title: projectKey.replace(/_/g, ' '),
                    sector: sectorKey.replace(/_/g, ' '),
                    sectorKey,
                    part: 'sectoral',
                    parsedAllocation: parseAllocation(project.allocation)
                })
            }
        })
    })

    return projects.sort((a, b) => b.parsedAllocation - a.parsedAllocation)
}

/**
 * Get unique sectors with project counts
 * @returns {Array} Sectors with counts and total allocations
 */
export function getSectors() {
    const projects = getAllProjects()
    const sectorMap = new Map()

    projects.forEach(project => {
        const existing = sectorMap.get(project.sectorKey) || {
            key: project.sectorKey,
            name: project.sector,
            count: 0,
            totalAllocation: 0
        }
        existing.count++
        existing.totalAllocation += project.parsedAllocation
        sectorMap.set(project.sectorKey, existing)
    })

    return Array.from(sectorMap.values())
        .sort((a, b) => b.totalAllocation - a.totalAllocation)
}

/**
 * Filter and search projects
 * @param {Object} options - Filter options
 * @returns {Array} Filtered projects
 */
export function filterProjects({ sector, search, page = 1, perPage = 12 } = {}) {
    let projects = getAllProjects()

    // Filter by sector
    if (sector && sector !== 'all') {
        projects = projects.filter(p => p.sectorKey === sector)
    }

    // Search filter
    if (search) {
        const query = search.toLowerCase()
        projects = projects.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.sector.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        )
    }

    // Pagination
    const total = projects.length
    const totalPages = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    const paginatedProjects = projects.slice(start, start + perPage)

    return {
        projects: paginatedProjects,
        pagination: {
            page,
            perPage,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }
}

// ============== POLICIES DATA ==============

/**
 * Get all policies grouped by category
 * @returns {Array} Policy categories with items
 */
export function getPolicies() {
    const policyData = policiesData.Budget_2025_26_Policy_and_Strategy
    const categories = []

    Object.entries(policyData).forEach(([categoryKey, items]) => {
        const policies = Object.entries(items).map(([key, policy]) => ({
            ...policy,
            key,
            title: key.replace(/_/g, ' ')
        }))

        categories.push({
            key: categoryKey,
            name: categoryKey.replace(/_/g, ' '),
            policies
        })
    })

    return categories
}

/**
 * Get policy count
 * @returns {number} Total number of policies
 */
export function getPolicyCount() {
    return getPolicies().reduce((acc, cat) => acc + cat.policies.length, 0)
}

// ============== SUMMARY STATS ==============

/**
 * Get summary statistics for dashboard
 * @returns {Object} Dashboard stats
 */
export function getDashboardStats() {
    const fiscal = getFiscalOverview()
    const expenditure = getExpenditureBreakdown()
    const projects = getAllProjects()
    const sectors = getSectors()

    return {
        totalBudget: fiscal.totalExpenditure,
        capitalExpenditure: expenditure.capital.total,
        revenueExpenditure: expenditure.revenue.total,
        capexPercent: expenditure.capexPercent,
        revexPercent: expenditure.revexPercent,
        projectCount: projects.length,
        sectorCount: sectors.length,
        fiscalDeficit: fiscal.fiscalDeficit,
        fiscalDeficitPercent: fiscal.fiscalDeficitPercent,
        topSectors: sectors.slice(0, 5)
    }
}

// ============== SECTOR ICONS ==============

/**
 * Get Material icon for sector
 * @param {string} sectorKey - Sector key
 * @returns {string} Material icon name
 */
export function getSectorIcon(sectorKey) {
    const iconMap = {
        'Agriculture': 'agriculture',
        'Animal_Husbandry_Dairy': 'pets',
        'Fisheries': 'set_meal',
        'Forestry': 'forest',
        'Rural_Development': 'location_city',
        'Local_Self_Government': 'apartment',
        'Irrigation': 'water',
        'Energy': 'bolt',
        'Industries': 'factory',
        'Information_Technology': 'computer',
        'Transport': 'directions_bus',
        'Tourism_Infrastructure': 'tour',
        'Tourism_Projects': 'beach_access',
        'Education': 'school',
        'Art_and_Culture': 'palette',
        'Sports': 'sports_soccer',
        'Health_Sector': 'medical_services',
        'Water_Supply': 'water_drop',
        'Housing_Schemes': 'home',
        'Urban_Development': 'domain',
        'Labour_Welfare': 'engineering',
        'SC_ST_Development': 'diversity_3',
        'Minority_OBC_Welfare': 'groups',
        'Social_Security': 'security',
        'Admin_and_Governance': 'admin_panel_settings',
        'Disaster_Rehabilitation': 'emergency',
        'Knowledge_Economy_and_Research': 'science',
        'AI_and_Emerging_Tech': 'psychology',
        'Infrastructure_Growth_Corridors': 'route',
        'Green_Energy': 'eco',
        'Social_and_Demographic': 'family_restroom',
        'Miscellaneous_Strategic': 'category',
        'Miscellaneous_Projects': 'more_horiz',
        'Media': 'newspaper'
    }

    return iconMap[sectorKey] || 'category'
}

/**
 * Get sector color
 * @param {string} sectorKey - Sector key
 * @returns {string} CSS color variable or hex
 */
export function getSectorColor(sectorKey) {
    const colorMap = {
        'Infrastructure_Growth_Corridors': 'var(--color-infrastructure)',
        'Transport': 'var(--color-transport)',
        'Health_Sector': 'var(--color-healthcare)',
        'Education': 'var(--color-education)',
        'Housing_Schemes': 'var(--color-welfare)',
        'Energy': '#f59e0b',
        'Information_Technology': '#8b5cf6',
        'Agriculture': '#22c55e',
        'Industries': '#3b82f6',
        'Tourism_Infrastructure': '#ec4899',
        'Tourism_Projects': '#ec4899'
    }

    return colorMap[sectorKey] || 'var(--color-primary)'
}
