/**
 * MLA Fund Data Loader
 * Aggregates data from individual MLA JSON files in MLA_DATA directory
 */

import { getMlaImageId } from './mlaImageMapper'

// District mapping for proper display names
const districtNames = {
    'TRIVANDRUM': 'Thiruvananthapuram',
    'KOLLAM': 'Kollam',
    'PATHANAMTHITTA': 'Pathanamthitta',
    'ALAPPUZHA': 'Alappuzha',
    'KOTTYAM': 'Kottayam',
    'IDUKKI': 'Idukki',
    'ERNAKULAM': 'Ernakulam',
    'THRISSUR': 'Thrissur',
    'PALAKKAD': 'Palakkad',
    'MALAPPURAM': 'Malappuram',
    'KOZHIKODE': 'Kozhikode',
    'WAYANAD': 'Wayanad',
    'KANNUR': 'Kannur',
    'KASARGOD': 'Kasaragod'
}

// Import all MLA data files dynamically - use raw text import to handle NaN issues
const rawModules = import.meta.glob('./MLA_DATA/**/*_projects.json', {
    eager: true,
    as: 'raw'
})

// Process JSON strings - handle NaN values which are invalid JSON
function parseMLAJson(rawStr) {
    try {
        // Replace NaN with null to make valid JSON
        const fixedStr = rawStr.replace(/:\s*NaN/g, ': null')
        return JSON.parse(fixedStr)
    } catch (e) {
        console.warn('Failed to parse MLA JSON:', e)
        return null
    }
}

// Pre-process all modules
const mlaDataModules = {}
for (const path in rawModules) {
    const parsed = parseMLAJson(rawModules[path])
    if (parsed) {
        mlaDataModules[path] = parsed
    }
}

/**
 * Get all MLAs with their summary data
 * @returns {Array} Array of MLA objects with name, constituency, district, and expenditure
 */
export function getAllMLAs() {
    const mlas = []

    for (const path in mlaDataModules) {
        const data = mlaDataModules[path].default || mlaDataModules[path]

        // Extract district from path (e.g., ./MLA_DATA/TRIVANDRUM/shri_v_joy_projects.json)
        const pathParts = path.split('/')
        const districtCode = pathParts[2] // The district folder name
        const district = districtNames[districtCode] || districtCode

        mlas.push({
            id: path, // Use path as unique ID
            name: data.mla_name || 'Unknown MLA',
            constituency: data.constituency || 'Unknown',
            district: district,
            totalExpenditure: data.summary?.total_expenditure_crores || 0,
            breakdown: data.summary?.breakdown || [],
            projectCount: data.projects?.length || 0,
            image: getMlaImageId(data.constituency, data.mla_name, data.image)
        })
    }

    // Sort by expenditure descending by default
    return mlas.sort((a, b) => b.totalExpenditure - a.totalExpenditure)
}

/**
 * Get MLAs filtered by district
 * @param {string} district - District name to filter by
 * @returns {Array} Filtered array of MLA objects
 */
export function getMLAsByDistrict(district) {
    const allMLAs = getAllMLAs()
    if (!district || district === 'all') return allMLAs
    return allMLAs.filter(mla => mla.district.toLowerCase() === district.toLowerCase())
}

/**
 * Search MLAs by name or constituency
 * @param {Array} mlas - Array of MLA objects
 * @param {string} query - Search query
 * @returns {Array} Filtered array of MLA objects
 */
export function searchMLAs(mlas, query) {
    if (!query || query.trim() === '') return mlas
    const lowerQuery = query.toLowerCase().trim()
    return mlas.filter(mla =>
        mla.name.toLowerCase().includes(lowerQuery) ||
        mla.constituency.toLowerCase().includes(lowerQuery) ||
        mla.district.toLowerCase().includes(lowerQuery)
    )
}

/**
 * Sort MLAs by different criteria
 * @param {Array} mlas - Array of MLA objects
 * @param {string} sortBy - Sort criteria: 'expenditure', 'name', 'district', 'projects'
 * @returns {Array} Sorted array of MLA objects
 */
export function sortMLAs(mlas, sortBy = 'expenditure') {
    const sorted = [...mlas]

    switch (sortBy) {
        case 'expenditure':
            return sorted.sort((a, b) => b.totalExpenditure - a.totalExpenditure)
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case 'district':
            return sorted.sort((a, b) => a.district.localeCompare(b.district))
        case 'projects':
            return sorted.sort((a, b) => b.projectCount - a.projectCount)
        default:
            return sorted
    }
}

/**
 * Get aggregate statistics for all MLAs
 * @returns {Object} Aggregate stats
 */
export function getAggregateStats() {
    const mlas = getAllMLAs()
    const totalExpenditure = mlas.reduce((sum, mla) => sum + mla.totalExpenditure, 0)
    const totalProjects = mlas.reduce((sum, mla) => sum + mla.projectCount, 0)

    // Calculate sector-wise totals
    const sectorTotals = {}
    mlas.forEach(mla => {
        mla.breakdown.forEach(sector => {
            const label = sector.label
            if (!sectorTotals[label]) {
                sectorTotals[label] = 0
            }
            sectorTotals[label] += sector.value_crores || 0
        })
    })

    return {
        totalMLAs: mlas.length,
        totalExpenditure: totalExpenditure,
        totalProjects: totalProjects,
        totalDistricts: Object.keys(districtNames).length,
        sectorBreakdown: Object.entries(sectorTotals)
            .map(([label, value]) => ({ label, value_crores: value }))
            .sort((a, b) => b.value_crores - a.value_crores)
    }
}

/**
 * Get list of all districts
 * @returns {Array} Array of district objects with name and code
 */
export function getAllDistricts() {
    const mlas = getAllMLAs()
    const districtData = {}

    // Aggregate data per district
    mlas.forEach(mla => {
        const districtCode = Object.entries(districtNames).find(([code, name]) => name === mla.district)?.[0]
        if (!districtData[mla.district]) {
            districtData[mla.district] = {
                code: districtCode || mla.district,
                name: mla.district,
                totalExpenditure: 0,
                totalProjects: 0,
                mlaCount: 0
            }
        }
        districtData[mla.district].totalExpenditure += mla.totalExpenditure
        districtData[mla.district].totalProjects += mla.projectCount
        districtData[mla.district].mlaCount++
    })

    return Object.values(districtData).sort((a, b) => b.totalExpenditure - a.totalExpenditure)
}

/**
 * Get top performing MLAs
 * @param {number} count - Number of top MLAs to return
 * @returns {Array} Top MLAs sorted by expenditure
 */
export function getTopMLAs(count = 5) {
    return getAllMLAs().slice(0, count)
}

/**
 * Get top performing districts
 * @param {number} count - Number of top districts to return  
 * @returns {Array} Top districts sorted by expenditure
 */
export function getTopDistricts(count = 5) {
    return getAllDistricts().slice(0, count)
}

/**
 * Get MLA details by ID (path)
 * @param {string} id - MLA ID (file path)
 * @returns {Object|null} Full MLA data including projects
 */
export function getMLAById(id) {
    const data = mlaDataModules[id]
    if (!data) return null

    const mlaData = data.default || data
    const pathParts = id.split('/')
    const districtCode = pathParts[2]

    return {
        ...mlaData,
        district: districtNames[districtCode] || districtCode
    }
}

/**
 * Format amount in Crores for display
 * @param {number} amount - Amount in crores
 * @returns {string} Formatted string
 */
export function formatAmount(amount) {
    if (amount >= 100) {
        return `₹${(amount).toFixed(0)} Cr`
    } else if (amount >= 10) {
        return `₹${amount.toFixed(1)} Cr`
    } else {
        return `₹${amount.toFixed(2)} Cr`
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
