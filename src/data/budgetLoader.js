/**
 * Budget Data Loader Utilities
 * Centralizes data access for all budget-related components
 */

import quickGlance from './budget/quickGlanceBudget.json'
import projectsData from './budget/projectsInBudget.json'
import policiesData from './budget/budgetPolicies.json'
import budget2026Data from './budget2026/budgetAtAGlance2026.json'
import projects2026Data from './budget2026/projectsinBudget2026.json'
import policies2026Data from './budget2026/budgetPolicies2026.json'
import majorFinancials from './MajorFinancialIndicators.json'
import sectorAllocations from './sectorwiseallocation.json'
import projects2026_1 from './budget2026/projectInBudget-1.json'
import projects2026_2 from './budget2026/projectInBudget-2.json'
import projects2026_3 from './budget2026/projectInBudget-3.json'

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

export const DEFAULT_YEAR = '2026-27'
export const BASELINE_YEAR = '2025-26'

/**
 * Internal helper to get data source based on fiscal year
 */
function getDataSourceForYear(year) {
    if (year === '2026-27') {
        return budget2026Data
    }
    return quickGlance
}

/**
 * Get fiscal overview data (KPIs)
 * @param {string} fiscalYear - The fiscal year (e.g., '2025-26')
 * @returns {Object} Key fiscal indicators
 */
export function getFiscalOverview(fiscalYear = DEFAULT_YEAR) {
    const financials = majorFinancials.financial_indicators[fiscalYear]?.budget_estimates

    if (financials) {
        return {
            year: fiscalYear,
            totalExpenditure: financials.total_expenditure_cr,
            totalReceipts: financials.total_revenue_receipts_cr,
            revenueDeficit: financials.revenue_deficit_cr,
            revenueDeficitPercent: financials.revenue_deficit_percent_gsdp,
            fiscalDeficit: financials.fiscal_deficit_cr,
            fiscalDeficitPercent: financials.fiscal_deficit_percent_gsdp,
            gsdp: (financials.fiscal_deficit_cr / (financials.fiscal_deficit_percent_gsdp / 100)), // Back-calculate GSDP for accuracy
            debtPercent: fiscalYear === '2026-27' ? 34.2 : 35.1 // Default from glance data if not in indicators
        }
    }

    // Fallback to existing logic if year not found in indicators
    const data = getDataSourceForYear(fiscalYear)
    const kpiKey = fiscalYear === '2026-27' ? 'key_fiscal_indicators_2026_27' : 'key_fiscal_indicators_2025_26'
    const kpi = data[kpiKey] || {}

    return {
        year: fiscalYear,
        totalExpenditure: kpi.total_expenditure || 0,
        totalReceipts: kpi.total_receipts || 0,
        revenueDeficit: kpi.revenue_deficit || 0,
        revenueDeficitPercent: kpi.revenue_deficit_gsdp_percentage || 0,
        fiscalDeficit: kpi.fiscal_deficit || 0,
        fiscalDeficitPercent: kpi.fiscal_deficit_gsdp_percentage || 0,
        gsdp: kpi.gsdp_estimate || 0,
        debtPercent: kpi.total_debt_gsdp_percentage || 0
    }
}

/**
 * Get revenue breakdown
 * @param {string} fiscalYear - The fiscal year
 * @returns {Object} Revenue sources with percentages
 */
export function getRevenueBreakdown(fiscalYear = DEFAULT_YEAR) {
    const financials = majorFinancials.financial_indicators[fiscalYear]?.budget_estimates

    if (financials) {
        return {
            year: fiscalYear,
            total: financials.total_revenue_receipts_cr,
            sources: [
                {
                    category: "State's Own Tax Revenue",
                    amount: financials.state_own_tax_revenue_cr,
                    percentage: ((financials.state_own_tax_revenue_cr / financials.total_revenue_receipts_cr) * 100).toFixed(1),
                    components: []
                },
                {
                    category: "Central Tax Share",
                    amount: financials.central_tax_share_cr,
                    percentage: ((financials.central_tax_share_cr / financials.total_revenue_receipts_cr) * 100).toFixed(1),
                    components: []
                },
                {
                    category: "Central Grants & Aid",
                    amount: financials.central_grants_cr,
                    percentage: ((financials.central_grants_cr / financials.total_revenue_receipts_cr) * 100).toFixed(1),
                    components: []
                },
                {
                    category: "Non-Tax & Others",
                    amount: financials.total_revenue_receipts_cr - financials.state_own_tax_revenue_cr - financials.central_tax_share_cr - financials.central_grants_cr,
                    percentage: (((financials.total_revenue_receipts_cr - financials.state_own_tax_revenue_cr - financials.central_tax_share_cr - financials.central_grants_cr) / financials.total_revenue_receipts_cr) * 100).toFixed(1),
                    components: []
                }
            ]
        }
    }

    const data = getDataSourceForYear(fiscalYear)
    const revenue = data.revenue_insights || {}

    // Original fallback logic
    return {
        year: fiscalYear,
        total: revenue.total_revenue_receipts || 0,
        sources: (revenue.sources || []).map(src => ({
            category: src.category,
            amount: src.amount,
            percentage: src.percentage_of_total_revenue,
            components: src.major_components || []
        }))
    }
}

/**
 * Get expenditure breakdown (CAPEX/REVEX)
 * @param {string} fiscalYear - The fiscal year
 * @returns {Object} Capital and revenue expenditure data
 */
export function getExpenditureBreakdown(fiscalYear = DEFAULT_YEAR) {
    const financials = majorFinancials.financial_indicators[fiscalYear]?.budget_estimates

    if (financials) {
        const revTotal = financials.revenue_expenditure_cr
        const capTotal = financials.capital_expenditure_cr
        const totalExp = financials.total_expenditure_cr

        return {
            year: fiscalYear,
            revenue: {
                total: revTotal,
                allocations: [] // We could populate this from sectorwiseallocations.json if needed
            },
            capital: {
                total: capTotal,
                allocations: []
            },
            capexPercent: ((capTotal / totalExp) * 100).toFixed(1),
            revexPercent: ((revTotal / totalExp) * 100).toFixed(1)
        }
    }

    const data = getDataSourceForYear(fiscalYear)
    const kpiKey = fiscalYear === '2026-27' ? 'key_fiscal_indicators_2026_27' : 'key_fiscal_indicators_2025_26'
    const kpi = data[kpiKey] || {}

    // Fallback logic
    const exp = data.expenditure_insights || {}
    const revTotal = exp.total_revenue_expenditure || exp.revenue_expenditure?.total || 0
    const capTotal = exp.total_capital_outlay || exp.capital_expenditure?.total_outlay || 0
    const totalExp = kpi.total_expenditure || (revTotal + capTotal)

    return {
        year: fiscalYear,
        revenue: {
            total: revTotal,
            allocations: exp.major_revenue_sectors || exp.revenue_expenditure?.major_allocations || []
        },
        capital: {
            total: capTotal,
            allocations: exp.major_capital_sectors || exp.capital_expenditure?.major_allocations || []
        },
        capexPercent: totalExp ? ((capTotal / totalExp) * 100).toFixed(1) : 0,
        revexPercent: totalExp ? ((revTotal / totalExp) * 100).toFixed(1) : 0
    }
}

/**
 * Get major project highlights grouped by category
 * @param {string} fiscalYear - The fiscal year
 * @returns {Object} Projects by sector
 */
export function getProjectHighlights(fiscalYear = DEFAULT_YEAR) {
    const data = getDataSourceForYear(fiscalYear)
    return data.major_project_highlights
}

// ============== PROJECTS DATA ==============

/**
 * Get projects data source based on year
 */
function getProjectsDataSource(year) {
    if (year === '2026-27') {
        return projects2026Data
    }
    return projectsData
}

/**
 * Flatten nested projects structure to array
 * @param {string} fiscalYear - The fiscal year
 * @returns {Array} Flat array of all projects with sector info
 */
export function getAllProjects(fiscalYear = DEFAULT_YEAR) {
    const projects = []

    // Handle 2026-27 data format (Multiple files with Batches)
    if (fiscalYear === '2026-27') {
        const dataSources = [projects2026_1, projects2026_2, projects2026_3]

        dataSources.forEach(source => {
            const allocations = source.Budget_2026_27_Detailed_Allocations || {}
            Object.values(allocations).forEach(batch => {
                batch.forEach(project => {
                    const desc = (project.description || "").toLowerCase()
                    const name = (project.project_name || "").toLowerCase()
                    const fullText = `${name} ${desc}`

                    // NOISE FILTER: Ignore historical averages, previous government tenure stats
                    const noiseKeywords = [
                        'tenure of', 'previous government', 'oommen chandy', 'during 2024-25',
                        'expenditure for 2025-26', 'average annual', 'during the five years'
                    ]
                    if (noiseKeywords.some(keyword => fullText.includes(keyword))) return;

                    let sector = 'General'
                    let sectorKey = 'general'

                    // Categorize based on keywords
                    if (fullText.includes('pension') || fullText.includes('welfare') || fullText.includes('social security') || fullText.includes('poverty')) {
                        sector = 'Social Welfare'
                        sectorKey = 'social_welfare'
                    } else if (fullText.includes('health') || fullText.includes('medical') || fullText.includes('hospital') || fullText.includes('cancer') || fullText.includes('doctor') || fullText.includes('nurse')) {
                        sector = 'Health and Medical'
                        sectorKey = 'health_medical'
                    } else if (fullText.includes('education') || fullText.includes('school') || fullText.includes('university') || fullText.includes('college') || fullText.includes('student') || fullText.includes('scholarship')) {
                        sector = 'Education'
                        sectorKey = 'education'
                    } else if (fullText.includes('agriculture') || fullText.includes('farm') || fullText.includes('crop') || fullText.includes('paddy') || fullText.includes('krishi')) {
                        sector = 'Agriculture'
                        sectorKey = 'agriculture'
                    } else if (fullText.includes('road') || fullText.includes('highway') || fullText.includes('transport') || fullText.includes('ksrtc') || fullText.includes('metro') || fullText.includes('bridge') || fullText.includes('bypass') || fullText.includes('airport') || fullText.includes('port')) {
                        sector = 'Infrastructure'
                        sectorKey = 'infrastructure'
                    } else if (fullText.includes('it ') || fullText.includes('digital') || fullText.includes('technology') || fullText.includes('startup') || fullText.includes('software') || fullText.includes('computer')) {
                        sector = 'IT and Technology'
                        sectorKey = 'it_technology'
                    } else if (fullText.includes('energy') || fullText.includes('power') || fullText.includes('electricity') || fullText.includes('kseb')) {
                        sector = 'Energy'
                        sectorKey = 'energy'
                    } else if (fullText.includes('industry') || fullText.includes('industrial') || fullText.includes('kinfra') || fullText.includes('investment') || fullText.includes('msme') || fullText.includes('factory')) {
                        sector = 'Industry'
                        sectorKey = 'industry'
                    } else if (fullText.includes('fishery') || fullText.includes('fisher') || fullText.includes('marine') || fullText.includes('fish') || fullText.includes('coastal')) {
                        sector = 'Fisheries'
                        sectorKey = 'fisheries'
                    } else if (fullText.includes('forest') || fullText.includes('wildlife') || fullText.includes('environment') || fullText.includes('climate') || fullText.includes('tree')) {
                        sector = 'Environment'
                        sectorKey = 'environment'
                    } else if (fullText.includes('tourism') || fullText.includes('tourist') || fullText.includes('travel')) {
                        sector = 'Tourism'
                        sectorKey = 'tourism'
                    } else if (fullText.includes('local') || fullText.includes('panchayat') || fullText.includes('municipality') || fullText.includes('corporation')) {
                        sector = 'Local Self Government'
                        sectorKey = 'local_self_government'
                    } else if (fullText.includes('kiifb')) {
                        sector = 'KIIFB Projects'
                        sectorKey = 'kiifb_projects'
                    } else if (fullText.includes('sc development') || fullText.includes('st development') || fullText.includes('tribal') || fullText.includes('scheduled caste') || fullText.includes('scheduled tribe')) {
                        sector = 'SC/ST Development'
                        sectorKey = 'sc_st_development'
                    } else if (fullText.includes('women') || fullText.includes('child') || fullText.includes('hostel') || fullText.includes('angawadi')) {
                        sector = 'Women and Child'
                        sectorKey = 'women_child'
                    }

                    projects.push({
                        id: project.id,
                        description: project.description || project.project_name,
                        allocation: project.allocation,
                        key: `project_2026_${project.id}`,
                        title: project.project_name || project.description.substring(0, 80),
                        sector,
                        sectorKey,
                        part: 'budget_2026',
                        parsedAllocation: parseAllocation(project.allocation),
                        fiscalYear
                    })
                })
            })
        })

        return projects.sort((a, b) => b.parsedAllocation - a.parsedAllocation)
    }

    // Handle 2025-26 data format (nested structure)
    const budgetData = projectsData.Budget_2025_26_Spending_Only

    // Process Part I and II (Strategic)
    const partI = budgetData.Part_I_and_II_Strategic_and_New_Initiatives
    if (partI) {
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
                        parsedAllocation: parseAllocation(project.allocation),
                        fiscalYear
                    })
                }
            })
        })
    }

    // Process Part III (Sectoral)
    const partIII = budgetData.Part_III_Sectoral_Allocations
    if (partIII) {
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
                        parsedAllocation: parseAllocation(project.allocation),
                        fiscalYear
                    })
                }
            })
        })
    }

    return projects.sort((a, b) => b.parsedAllocation - a.parsedAllocation)
}

/**
 * Get unique sectors with project counts
 * @param {string} fiscalYear - The fiscal year
 * @returns {Array} Sectors with counts and total allocations
 */
export function getSectors(fiscalYear = DEFAULT_YEAR) {
    const projects = getAllProjects(fiscalYear)
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
 * @returns {Object} Filtered projects with pagination
 */
export function filterProjects({ fiscalYear = DEFAULT_YEAR, sector, search, page = 1, perPage = 12 } = {}) {
    let projects = getAllProjects(fiscalYear)

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
 * Get policies data key based on year
 */
function getPoliciesYearKey(year) {
    const sanitized = year.replace(/-/g, '_')
    // Placeholder mapping
    return `Budget_2025_26_Policy_and_Strategy`
}

/**
 * Get all policies grouped by category
 * @param {string} fiscalYear - The fiscal year
 * @returns {Array} Policy categories with items
 */
export function getPolicies(fiscalYear = DEFAULT_YEAR) {
    let policyData;
    if (fiscalYear === '2026-27') {
        policyData = policies2026Data.Kerala_Budget_2026_27_Policies;
    } else {
        policyData = policiesData.Budget_2025_26_Policy_and_Strategy;
    }

    const categories = []

    Object.entries(policyData).forEach(([categoryKey, items]) => {
        const policies = Object.entries(items).map(([key, policy]) => ({
            ...policy,
            key,
            title: policy.policy_name || key.replace(/_/g, ' ')
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
 * Get total count of all policies
 * @param {string} fiscalYear - The fiscal year
 * @returns {number} Total policy count
 */
export function getPolicyCount(fiscalYear = DEFAULT_YEAR) {
    const categories = getPolicies(fiscalYear)
    return categories.reduce((sum, cat) => sum + cat.policies.length, 0)
}

/**
 * Get summary statistics for dashboard
 * @param {string} fiscalYear - The fiscal year
 * @returns {Object} Dashboard stats
 */
export function getDashboardStats(fiscalYear = DEFAULT_YEAR) {
    const fiscal = getFiscalOverview(fiscalYear)
    const expenditure = getExpenditureBreakdown(fiscalYear)
    const projects = getAllProjects(fiscalYear)
    const sectors = getSectors(fiscalYear)

    return {
        year: fiscalYear,
        totalBudget: fiscal.totalExpenditure,
        capitalExpenditure: expenditure.capital.total,
        revenueExpenditure: expenditure.revenue.total,
        capexPercent: expenditure.capexPercent,
        revexPercent: expenditure.revexPercent,
        projectCount: projects.length,
        sectorCount: sectors.length,
        fiscalDeficit: fiscal.fiscalDeficit,
        fiscalDeficitPercent: fiscal.fiscalDeficitPercent,
        revenueDeficit: fiscal.revenueDeficit,
        revenueDeficitPercent: fiscal.revenueDeficitPercent,
        gsdp: fiscal.gsdp,
        debtPercent: fiscal.debtPercent,
        topSectors: sectors.slice(0, 5)
    }
}

/**
 * Get budget comparison data between two years
 * @param {string} yearA - Baseline year
 * @param {string} yearB - Comparison year
 * @returns {Object} Comparison deltas
 */
export function getBudgetComparison(yearA = BASELINE_YEAR, yearB = DEFAULT_YEAR) {
    const statsA = getDashboardStats(yearA)
    const statsB = getDashboardStats(yearB)

    // Calculate deltas
    const calculateDelta = (a, b) => {
        const valA = parseFloat(a)
        const valB = parseFloat(b)
        if (!valA || isNaN(valA)) return 0
        return ((valB - valA) / valA * 100).toFixed(1)
    }

    // Macro deltas
    const gsdpDelta = calculateDelta(statsA.gsdp, statsB.gsdp)
    const deficitDelta = (statsB.fiscalDeficitPercent - statsA.fiscalDeficitPercent).toFixed(2)
    const debtDelta = (statsB.debtPercent - statsA.debtPercent).toFixed(2)

    // Sector delta comparison with key normalization and AGGREGATION
    const normalizeSector = (key) => {
        const lower = key.toLowerCase().replace(/_/g, ' ')
        if (lower.includes('agri') || lower.includes('farm') || lower.includes('husbandry') || lower.includes('fisher')) return 'Agriculture & Allied'
        if (lower.includes('health') || lower.includes('medical')) return 'Health & Medical'
        if (lower.includes('edu') || lower.includes('scholarship')) return 'Education'
        if (lower.includes('welfare') || lower.includes('pension') || lower.includes('social') || lower.includes('disaster')) return 'Social Welfare'
        if (lower.includes('infra') || lower.includes('road') || lower.includes('transport') || lower.includes('coast') || lower.includes('highway') || lower.includes('construction')) return 'Infrastructure'
        if (lower.includes('it ') || lower.includes('digital') || lower.includes('technology') || lower.includes('startup') || lower.includes('science')) return 'IT & Technology'
        if (lower.includes('energy') || lower.includes('power') || lower.includes('hydrogen')) return 'Energy'
        if (lower.includes('indus') || lower.includes('kinfra') || lower.includes('investment')) return 'Industry'
        if (lower.includes('local') || lower.includes('panchayat') || lower.includes('lsgi') || lower.includes('lsgd') || lower.includes('municipality')) return 'Local Governance'
        if (lower.includes('tourism')) return 'Tourism'
        if (lower.includes('rural')) return 'Rural Development'
        if (lower.includes('kiifb') || lower.includes('strategic')) return 'Strategic Projects'
        return 'General / Others'
    }

    const aggregateSectors = (year) => {
        // PRIORITY 1: Authoritative sectoral data from Citizen's Guide
        const authoritative = sectorAllocations.sector_allocation_revenue_expenditure[year]?.allocations_cr
        if (authoritative) {
            const aggregated = {}
            Object.entries(authoritative).forEach(([key, value]) => {
                const normKey = normalizeSector(key)
                if (!aggregated[normKey]) {
                    aggregated[normKey] = { name: normKey, totalAllocation: 0 }
                }
                aggregated[normKey].totalAllocation += value
            })
            return aggregated
        }

        // PRIORITY 2: Fallback to project-based aggregation
        const rawSectors = getSectors(year)
        const aggregated = {}

        rawSectors.forEach(s => {
            const normKey = normalizeSector(s.key)
            if (!aggregated[normKey]) {
                aggregated[normKey] = { name: normKey, totalAllocation: 0 }
            }
            aggregated[normKey].totalAllocation += s.totalAllocation
        })
        return aggregated
    }

    const aggA = aggregateSectors(yearA)
    const aggB = aggregateSectors(yearB)

    // Form list using all unique normalized keys
    const allKeys = Array.from(new Set([...Object.keys(aggA), ...Object.keys(aggB)]))

    const sectorDeltas = allKeys.map(key => {
        const dataA = aggA[key] || { totalAllocation: 0 }
        const dataB = aggB[key] || { totalAllocation: 0 }

        return {
            key: key.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
            name: key,
            totalAllocation: dataB.totalAllocation,
            baselineAllocation: dataA.totalAllocation,
            delta: calculateDelta(dataA.totalAllocation, dataB.totalAllocation)
        }
    })

    return {
        yearA,
        yearB,
        totalBudgetDelta: calculateDelta(statsA.totalBudget, statsB.totalBudget),
        capexDelta: calculateDelta(statsA.capitalExpenditure, statsB.capitalExpenditure),
        revexDelta: calculateDelta(statsA.revenueExpenditure, statsB.revenueExpenditure),
        gsdpDelta,
        deficitDelta,
        debtDelta,
        sectorDeltas: sectorDeltas.sort((a, b) => b.totalAllocation - a.totalAllocation),
        statsA,
        statsB
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
        'Media': 'newspaper',
        // Aggregated keys
        'agriculture_&_allied': 'agriculture',
        'health_&_medical': 'medical_services',
        'education': 'school',
        'social_welfare': 'security',
        'infrastructure': 'route',
        'it_&_technology': 'psychology',
        'energy': 'bolt',
        'industry': 'factory',
        'local_governance': 'apartment',
        'tourism': 'tour',
        'strategic_projects': 'category',
        'general_/_others': 'more_horiz'
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
        'Tourism_Projects': '#ec4899',
        // Aggregated keys
        'agriculture_&_allied': '#22c55e',
        'health_&_medical': 'var(--healthcare)',
        'education': 'var(--education)',
        'social_welfare': 'var(--welfare)',
        'infrastructure': 'var(--infrastructure)',
        'it_&_technology': '#8b5cf6',
        'energy': '#f59e0b',
        'industry': '#3b82f6',
        'local_governance': '#0d9b76',
        'tourism': '#ec4899',
        'strategic_projects': '#64748b',
        'general_/_others': '#94a3b8'
    }

    return colorMap[sectorKey] || 'var(--color-primary)'
}
