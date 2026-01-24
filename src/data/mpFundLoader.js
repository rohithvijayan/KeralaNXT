/**
 * MP Fund Data Loader Utility
 * Handles parsing and calculations for MPLADS fund data
 * Updated to handle the actual data format from government sources
 */

import lokSabhaMPsRaw from './lok_sabha_mps.json'
import rajyaSabhaMPsRaw from './rajya_sabha_mps.json'

/**
 * Parse amount string to number (e.g., "25.00 Cr" -> 25.00)
 */
export const parseAmount = (amountStr) => {
    if (!amountStr) return 0
    if (typeof amountStr === 'number') return amountStr
    const cleaned = amountStr.replace(/[₹,]/g, '').trim()
    const match = cleaned.match(/^([\d.]+)/)
    return match ? parseFloat(match[1]) || 0 : 0
}

/**
 * Parse percentage string to number (e.g., "92.4%" -> 92.4)
 */
export const parsePercentage = (percentStr) => {
    if (!percentStr) return 0
    if (typeof percentStr === 'number') return percentStr
    const match = percentStr.replace('%', '').trim()
    return parseFloat(match) || 0
}

/**
 * Get performance level based on utilization percentage
 * @returns 'high' | 'medium' | 'low'
 */
export const getPerformanceLevel = (percent) => {
    const value = typeof percent === 'string' ? parsePercentage(percent) : percent
    if (value >= 70) return 'high'
    if (value >= 40) return 'medium'
    return 'low'
}

/**
 * Get color class based on performance level
 */
export const getPerformanceColor = (percent) => {
    const level = getPerformanceLevel(percent)
    switch (level) {
        case 'high': return '#13ecb2'
        case 'medium': return '#f59e0b'
        case 'low': return '#ef4444'
        default: return '#94a3b8'
    }
}

/**
 * Get CSS class name for performance level
 */
export const getPerformanceClass = (percent) => {
    return getPerformanceLevel(percent)
}

/**
 * Extract MP name from the "Hon'ble Member Of Parliament" field
 * Handles formats like "Dr. John Brittas (2021-27)" -> "Dr. John Brittas"
 */
const extractMPName = (rawName) => {
    if (!rawName || rawName === '\u00a0' || rawName.trim() === '') return null
    // Remove tenure years in parentheses
    const name = rawName.replace(/\s*\([^)]*\)\s*$/, '').trim()
    return name || null
}

/**
 * Extract tenure from the "Hon'ble Member Of Parliament" field
 * Handles formats like "Dr. John Brittas (2021-27)" -> "2021-27"
 */
const extractTenure = (rawName) => {
    if (!rawName) return ''
    const match = rawName.match(/\(([^)]+)\)/)
    return match ? match[1] : ''
}

/**
 * Normalize MP data from raw JSON format to consistent internal format
 */
const normalizeMPData = (rawMPs, house) => {
    return rawMPs
        .map(mp => {
            // Handle both old and new data formats
            const rawName = mp["Hon'ble Member Of Parliament"] || mp.name || ''
            const name = extractMPName(rawName)

            // Skip entries with empty names (like aggregate rows)
            if (!name) return null

            const constituency = mp["Constituency"] || mp.constituency || ''
            // Skip aggregate rows (empty constituency)
            if (constituency === '\u00a0' || constituency.trim() === '') return null

            const allocatedFund = mp["Total Allocated Fund (Cr)"] || mp.allocatedFund || '0 Cr'
            const utilisedFund = mp["Fund Utilised (Cr)"] || mp.utilisedFund || '0 Cr'
            const percentUtilised = mp["% Utilised"] || mp.percentUtilised || '0%'

            const allocatedAmount = parseAmount(allocatedFund)
            const utilisedAmount = parseAmount(utilisedFund)
            const percentValue = parsePercentage(percentUtilised)

            return {
                Rank: mp.Rank || 0,
                name,
                constituency: constituency.replace('\u00a0', '').trim(),
                party: mp.party || '',
                house: mp.house || house,
                tenure: mp.tenure || extractTenure(rawName),
                allocatedFund,
                utilisedFund,
                percentUtilised,
                allocatedAmount,
                utilisedAmount,
                percentValue,
                performanceLevel: getPerformanceLevel(percentValue),
                image: mp.image || ''
            }
        })
        .filter(mp => mp !== null) // Remove null entries (aggregate rows)
}

// Normalize the raw data
const lokSabhaMPs = normalizeMPData(lokSabhaMPsRaw, 'Lok Sabha')
const rajyaSabhaMPs = normalizeMPData(rajyaSabhaMPsRaw, 'Rajya Sabha')

/**
 * Calculate totals from MP data array
 */
export const calculateTotals = (mps) => {
    let totalAllocated = 0
    let totalUtilised = 0

    mps.forEach(mp => {
        totalAllocated += mp.allocatedAmount || parseAmount(mp.allocatedFund)
        totalUtilised += mp.utilisedAmount || parseAmount(mp.utilisedFund)
    })

    const overallPercent = totalAllocated > 0
        ? ((totalUtilised / totalAllocated) * 100).toFixed(1)
        : 0

    return {
        totalAllocated,
        totalUtilised,
        overallPercent: parseFloat(overallPercent),
        totalMPs: mps.length
    }
}

/**
 * Get all MPs combined (Lok Sabha + Rajya Sabha)
 */
export const getAllMPs = () => {
    return [...lokSabhaMPs, ...rajyaSabhaMPs]
}

/**
 * Get MPs filtered by house
 * @param {'all' | 'lok' | 'rajya'} house
 */
export const getMPsByHouse = (house = 'all') => {
    const allMPs = getAllMPs()
    switch (house) {
        case 'lok':
            return allMPs.filter(mp => mp.house === 'Lok Sabha')
        case 'rajya':
            return allMPs.filter(mp => mp.house === 'Rajya Sabha')
        default:
            return allMPs
    }
}

/**
 * Sort MPs by various criteria
 * @param {Array} mps - Array of MP objects
 * @param {'rank' | 'name' | 'utilized' | 'percent'} sortBy
 */
export const sortMPs = (mps, sortBy = 'rank') => {
    const sorted = [...mps]
    switch (sortBy) {
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name))
            break
        case 'utilized':
            sorted.sort((a, b) => b.utilisedAmount - a.utilisedAmount)
            break
        case 'percent':
            sorted.sort((a, b) => b.percentValue - a.percentValue)
            break
        case 'rank':
        default:
            sorted.sort((a, b) => a.Rank - b.Rank)
            break
    }
    return sorted
}

/**
 * Search/filter MPs by name or constituency
 */
export const searchMPs = (mps, query) => {
    if (!query || !query.trim()) return mps
    const lowercaseQuery = query.toLowerCase().trim()
    return mps.filter(mp =>
        mp.name.toLowerCase().includes(lowercaseQuery) ||
        mp.constituency.toLowerCase().includes(lowercaseQuery) ||
        (mp.party && mp.party.toLowerCase().includes(lowercaseQuery))
    )
}

/**
 * Format amount for display (e.g., 25.00 -> "₹25.00 Cr")
 */
export const formatAmount = (amount) => {
    if (typeof amount === 'string') return amount
    return `₹${amount.toFixed(2)} Cr`
}

/**
 * Format percentage for display (e.g., 92.4 -> "92.4%")
 */
export const formatPercentage = (percent) => {
    if (typeof percent === 'string') return percent
    return `${percent.toFixed(1)}%`
}

export default {
    getAllMPs,
    getMPsByHouse,
    sortMPs,
    searchMPs,
    calculateTotals,
    parseAmount,
    parsePercentage,
    getPerformanceLevel,
    getPerformanceColor,
    getPerformanceClass,
    formatAmount,
    formatPercentage
}
