// Cache for loaded MP fund data
let mpFundDataCache = null

/**
 * Load MP fund data dynamically
 */
const loadMPFundData = async () => {
    if (mpFundDataCache) return mpFundDataCache
    try {
        const module = await import('./MPFUND.json')
        mpFundDataCache = module.default || module
        return mpFundDataCache
    } catch (error) {
        console.error('Error loading MP Analytics data:', error)
        return {}
    }
}

/**
 * Get list of all MPs with their house
 */
export const getAllMPsForAnalytics = async () => {
    const data = await loadMPFundData()
    return Object.entries(data).map(([name, mpData]) => ({
        name,
        displayName: name.replace(/\s*\([^)]*\)$/, ''), // Remove tenure from display
        house: mpData.house,
        totalExpenditure: mpData.total_expenditure,
        image: mpData.image || ''
    })).sort((a, b) => b.totalExpenditure - a.totalExpenditure)
}

/**
 * Get MPs filtered by house
 */
export const getMPsByHouseForAnalytics = async (house = 'all') => {
    const allMPs = await getAllMPsForAnalytics()
    if (house === 'all') return allMPs
    return allMPs.filter(mp =>
        house === 'lok' ? mp.house === 'Lok Sabha' : mp.house === 'Rajya Sabha'
    )
}

/**
 * Get spending breakdown for a specific MP
 */
export const getMPSpendingBreakdown = async (mpName) => {
    const data = await loadMPFundData()
    const mpData = data[mpName]
    if (!mpData) return null

    return {
        name: mpName,
        displayName: mpName.replace(/\s*\([^)]*\)$/, ''),
        house: mpData.house,
        totalExpenditure: mpData.total_expenditure,
        image: mpData.image || '',
        breakdown: mpData.breakdown.map((item, index) => ({
            id: index,
            label: item.label,
            shortLabel: shortenLabel(item.label),
            value: item.value,
            percentage: ((item.value / mpData.total_expenditure) * 100).toFixed(1)
        })).sort((a, b) => b.value - a.value)
    }
}

/**
 * Shorten long category labels for display
 */
const shortenLabel = (label) => {
    const labelMap = {
        'Construction of roads, link roads, pathways or any other road with or without drainage system': 'Roads & Connectivity',
        'Purchase of vans and buses for educational institutions': 'Educational Vehicles',
        'Purchase of IT systems, including hardware and software for educational purposes': 'IT Systems (Edu)',
        'Construction of rooms and halls in school and colleges': 'School Buildings',
        'Lighting of public spaces': 'Public Lighting',
        'Construction of buildings for crèches and anganwadies': 'Anganwadi Buildings',
        'Purchase of vehicle for mobile dispensaries (Four, three and two wheelers)': 'Mobile Dispensaries',
        'Construction of culverts and bridges': 'Culverts & Bridges',
        'Purchase of hospital equipment': 'Hospital Equipment',
        'Construction of community centers and community halls': 'Community Halls',
        'Purchase of ambulances (Four, three and two wheelers)': 'Ambulances',
        'Construction of public libraries and reading rooms': 'Libraries',
        'Development of playfields and sports grounds': 'Sports Grounds',
        'Construction of rooms and facilities for hospitals, FWC , PHC Centers and ANM centers': 'Healthcare Facilities',
        'Purchase of furniture and fixtures for educational purposes': 'School Furniture',
        'Street lights': 'Street Lights',
        'Improvement of electricity distribution infrastructure': 'Electricity Infra',
        'Construction of footpaths and pedestrian ways': 'Footpaths',
        'Setting up of laboratories': 'Laboratories',
        'Purchase of prosthetics, wheel chairs, tricycles (manual or motorized), elect scooties, hearing aids': 'Disability Aids',
        'Construction of flood control embankments/ protection walls along riverbanks, hilltops, roadsides': 'Flood Control',
        'Construction of buildings for community cultural activities': 'Cultural Buildings',
        'Providing supply pipelines for drinking water': 'Water Supply',
        'Construction of boundary walls of existing public and community buildings': 'Boundary Walls',
        'Setting up public non-conventional energy plants': 'Renewable Energy',
        'Construction of buildings for sports facilities': 'Sports Buildings',
        'Forest conservation infrastructure': 'Forest Conservation',
        'Development of playground': 'Playground Dev',
        'Setting up of kitchen and pantries': 'Kitchen & Pantry',
        'Installation of multi-gym equipment': 'Gym Equipment',
        'Purchase of smart boards, visual display units and projectors': 'Smart Boards',
        'Purchase of books for public libraries/ digitization of library books': 'Library Books',
        'Purchase of books and periodicals for libraries/digitization of library books': 'Library Books'
    }
    return labelMap[label] || (label.length > 30 ? label.substring(0, 30) + '...' : label)
}

/**
 * Get chart colors for categories
 */
export const getCategoryColor = (index) => {
    const colors = [
        '#3B82F6', // Blue - Roads
        '#13ECB2', // Teal - Primary
        '#F59E0B', // Amber - Education
        '#8B5CF6', // Purple - Community
        '#EF4444', // Red - Healthcare
        '#14B8A6', // Cyan - Environment
        '#EC4899', // Pink - Sports
        '#6366F1', // Indigo
        '#10B981', // Emerald
        '#F97316', // Orange
        '#6B7280'  // Gray - Others
    ]
    return colors[index % colors.length]
}

/**
 * Get category icon name
 */
export const getCategoryIcon = (label) => {
    if (label.toLowerCase().includes('road') || label.toLowerCase().includes('bridge') || label.toLowerCase().includes('culvert')) {
        return 'directions_car'
    }
    if (label.toLowerCase().includes('health') || label.toLowerCase().includes('hospital') || label.toLowerCase().includes('ambulance') || label.toLowerCase().includes('dispensar')) {
        return 'medical_services'
    }
    if (label.toLowerCase().includes('school') || label.toLowerCase().includes('education') || label.toLowerCase().includes('college') || label.toLowerCase().includes('it system')) {
        return 'school'
    }
    if (label.toLowerCase().includes('light')) {
        return 'lightbulb'
    }
    if (label.toLowerCase().includes('water') || label.toLowerCase().includes('sanitation')) {
        return 'water_drop'
    }
    if (label.toLowerCase().includes('sport') || label.toLowerCase().includes('playground') || label.toLowerCase().includes('gym')) {
        return 'sports_soccer'
    }
    if (label.toLowerCase().includes('community') || label.toLowerCase().includes('cultural') || label.toLowerCase().includes('library')) {
        return 'groups'
    }
    if (label.toLowerCase().includes('anganwadi') || label.toLowerCase().includes('crèche')) {
        return 'child_care'
    }
    if (label.toLowerCase().includes('vehicle') || label.toLowerCase().includes('van') || label.toLowerCase().includes('bus')) {
        return 'directions_bus'
    }
    return 'category'
}

/**
 * Format amount to Crores
 */
export const formatAmountCr = (amount) => {
    const crores = amount / 10000000
    return `₹${crores.toFixed(2)} Cr`
}

/**
 * Format amount to Lakhs
 */
export const formatAmountLakhs = (amount) => {
    const lakhs = amount / 100000
    return `₹${lakhs.toFixed(2)} L`
}

export default {
    getAllMPsForAnalytics,
    getMPsByHouseForAnalytics,
    getMPSpendingBreakdown,
    getCategoryColor,
    getCategoryIcon,
    formatAmountCr,
    formatAmountLakhs
}
