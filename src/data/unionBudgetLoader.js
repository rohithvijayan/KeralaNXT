import unionBudgetGlance from './UnionBudget26/unionBudgetGlance.json'
import majorAnnouncements from './UnionBudget26/majorAnnouncements.json'
import sectorWiseAllocation from './UnionBudget26/unionBudgetSectorWiseAllocation.json'
import budgetComparison from './UnionBudget26/budgetAnalysisComparison.json'

/**
 * Format large numbers into Crore or Lakh Crore
 * @param {number} amount - Amount in INR Crore
 * @param {boolean} short - Whether to use short notation
 */
export const formatUnionAmount = (amount, short = false) => {
    if (!amount && amount !== 0) return 'N/A'

    if (amount >= 100000) {
        const val = (amount / 100000).toFixed(2)
        return `₹${val}${short ? 'L' : ' Lakh'} Cr`
    }
    return `₹${amount.toLocaleString('en-IN')}${short ? '' : ' Cr'}`
}

export const getUnionBudgetGlance = () => {
    return unionBudgetGlance
}

export const getUnionMajorAnnouncements = () => {
    return majorAnnouncements
}

export const getUnionSectorWiseAllocation = () => {
    return sectorWiseAllocation
}

export const getUnionBudgetComparison = () => {
    return budgetComparison.budget_comparison_analysis
}

export const getDeficitIndicators = () => {
    return unionBudgetGlance.deficit_indicators.data
}

export const getRupeeProfile = () => {
    const profile = unionBudgetGlance.rupee_profile_2026_27

    // Transform object to array format for UI
    const comesFrom = Object.entries(profile.comes_from_percent)
        .filter(([key]) => key !== 'source')
        .map(([source, percentage]) => ({ source, percentage }))

    const goesTo = Object.entries(profile.goes_to_percent)
        .filter(([key]) => key !== 'source')
        .map(([item, percentage]) => ({ item, percentage }))

    return { comesFrom, goesTo }
}

export const getSectoralAllocations = () => {
    return unionBudgetGlance.major_expenditure_items["2026_27_estimates"].map(item => ({
        sector: item.item,
        amount: item.amount
    }))
}

export const getBudgetMetadata = () => {
    return unionBudgetGlance.budget_metadata
}
