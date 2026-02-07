/**
 * MLA Fund Analytics Data Loader
 * Provides analytics-specific functions for MLA spending breakdown
 * Data source: MLA_DATA/{DISTRICT}/*_projects.json files
 */

import mlaSummary from './mlaSummary.json'
import { getMlaImageId } from './mlaImageMapper'

// Process all modules lazily
const rawModules = import.meta.glob('./MLA_DATA/**/*_projects.json', {
    as: 'raw'
})

// Parse JSON strings - handle NaN values which are invalid JSON
function parseMLAJson(rawStr) {
    try {
        const fixedStr = rawStr.replace(/:\s*NaN/g, ': null')
        return JSON.parse(fixedStr)
    } catch (e) {
        console.warn('Failed to parse MLA JSON:', e)
        return null
    }
}

/**
 * Get all MLAs for analytics with summary data
 * @returns {Array} Array of MLA objects sorted by expenditure
 */
export function getAllMLAsForAnalytics() {
    return mlaSummary.mlas.map(mla => ({
        ...mla,
        displayName: mla.name.replace(/^(Shri|Smt|Dr\.?)\s+/i, ''),
        image: getMlaImageId(mla.constituency, mla.name, mla.image)
    }))
}

/**
 * Get MLAs filtered by district for analytics
 * @param {string} district - District name to filter by
 * @returns {Array} Filtered array of MLA objects
 */
export function getMLAsByDistrictForAnalytics(district = 'all') {
    const allMLAs = getAllMLAsForAnalytics()
    if (!district || district === 'all') return allMLAs
    return allMLAs.filter(mla => mla.district.toLowerCase() === district.toLowerCase())
}

/**
 * Get detailed spending breakdown for a specific MLA asynchronously
 * @param {string} mlaId - MLA ID (file path)
 * @returns {Promise<Object|null>} MLA spending breakdown data
 */
export async function getMLASpendingBreakdown(mlaId) {
    const loadFn = rawModules[mlaId]
    if (!loadFn) return null

    try {
        const raw = await loadFn()
        const mlaData = parseMLAJson(raw)
        if (!mlaData) return null

        const totalExpenditure = mlaData.summary?.total_expenditure_crores || 0

        return {
            id: mlaId,
            name: mlaData.mla_name || 'Unknown MLA',
            displayName: (mlaData.mla_name || 'Unknown MLA').replace(/^(Shri|Smt|Dr\.?)\s+/i, ''),
            constituency: mlaData.constituency || 'Unknown',
            district: mlaData.district || 'Unknown',
            totalExpenditure: totalExpenditure,
            projectCount: mlaData.projects?.length || 0,
            image: getMlaImageId(mlaData.constituency, mlaData.mla_name, mlaData.image),
            breakdown: (mlaData.summary?.breakdown || []).map((item, index) => ({
                id: index,
                label: item.label,
                shortLabel: shortenLabel(item.label),
                value: item.value_crores || 0,
                percentage: totalExpenditure > 0
                    ? ((item.value_crores / totalExpenditure) * 100).toFixed(1)
                    : '0.0'
            })).sort((a, b) => b.value - a.value)
        }
    } catch (e) {
        console.error('Error loading MLA spending breakdown:', e)
        return null
    }
}

/**
 * Get all projects for an MLA asynchronously
 * @param {string} mlaId - MLA ID (file path)
 * @returns {Promise<Array>} Array of project objects
 */
export async function getMLAProjects(mlaId) {
    const loadFn = rawModules[mlaId]
    if (!loadFn) return []

    try {
        const raw = await loadFn()
        const mlaData = parseMLAJson(raw)
        return mlaData?.projects || []
    } catch (e) {
        console.error('Error loading MLA projects:', e)
        return []
    }
}

/**
 * Shorten sector labels for display
 */
function shortenLabel(label) {
    const labelMap = {
        'Road': 'Roads',
        'Infrastructure': 'Infrastructure',
        'Healthcare': 'Healthcare',
        'Education': 'Education',
        'Electricity': 'Electricity',
        'Irrigation': 'Irrigation',
        'Sports': 'Sports',
        'Others': 'Others'
    }
    return labelMap[label] || (label.length > 20 ? label.substring(0, 20) + '...' : label)
}

/**
 * Get color for chart categories
 * @param {number} index - Category index
 * @returns {string} Hex color code
 */
export function getCategoryColor(index) {
    const colors = [
        '#3B82F6', // Blue - Roads
        '#13ECB2', // Teal - Primary
        '#8B5CF6', // Purple - Infrastructure
        '#F59E0B', // Amber - Education
        '#EF4444', // Red - Healthcare
        '#14B8A6', // Cyan - Electricity
        '#EC4899', // Pink - Irrigation
        '#10B981', // Emerald - Sports
        '#6B7280'  // Gray - Others
    ]
    return colors[index % colors.length]
}

/**
 * Get icon for sector category
 * @param {string} label - Category label
 * @returns {string} Material icon name
 */
export function getCategoryIcon(label) {
    const iconMap = {
        'Road': 'directions_car',
        'Roads': 'directions_car',
        'Infrastructure': 'apartment',
        'Healthcare': 'medical_services',
        'Education': 'school',
        'Electricity': 'bolt',
        'Irrigation': 'water_drop',
        'Sports': 'sports_soccer',
        'Others': 'category'
    }
    return iconMap[label] || 'category'
}

/**
 * Format amount in Crores
 * @param {number} amount - Amount in crores
 * @returns {string} Formatted string
 */
export function formatAmountCr(amount) {
    if (amount >= 100) {
        return `₹${amount.toFixed(0)} Cr`
    } else if (amount >= 10) {
        return `₹${amount.toFixed(1)} Cr`
    } else if (amount >= 1) {
        return `₹${amount.toFixed(2)} Cr`
    } else {
        // Convert to lakhs for smaller amounts
        const lakhs = amount * 100
        return `₹${lakhs.toFixed(1)} L`
    }
}

/**
 * Get initials from MLA name
 * @param {string} name - Full name
 * @returns {string} Initials (2 characters)
 */
export function getInitials(name) {
    if (!name) return 'ML'
    const parts = name.replace(/^(Shri|Smt|Dr\.?)\s+/i, '').split(' ')
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
}

/**
 * Get all districts with MLA counts
 * @returns {Array} Array of district objects
 */
export function getAllDistrictsForAnalytics() {
    const mlas = getAllMLAsForAnalytics()
    const districtData = {}

    mlas.forEach(mla => {
        if (!districtData[mla.district]) {
            districtData[mla.district] = {
                code: mla.districtCode,
                name: mla.district,
                mlaCount: 0,
                totalExpenditure: 0
            }
        }
        districtData[mla.district].mlaCount++
        districtData[mla.district].totalExpenditure += mla.totalExpenditure
    })

    return Object.values(districtData).sort((a, b) => b.totalExpenditure - a.totalExpenditure)
}

export default {
    getAllMLAsForAnalytics,
    getMLAsByDistrictForAnalytics,
    getMLASpendingBreakdown,
    getMLAProjects,
    getCategoryColor,
    getCategoryIcon,
    formatAmountCr,
    getInitials,
    getAllDistrictsForAnalytics
}
