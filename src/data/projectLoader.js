/**
 * Project Data Loader - Dynamic Import System
 * 
 * Loads project data from separate JSON files for each district.
 * Uses dynamic imports for on-demand loading and better performance.
 */

// Cache for loaded project data
const projectCache = new Map()

// List of all district IDs (must match filenames in projects/ folder)
export const DISTRICT_IDS = [
    'thiruvananthapuram',
    'kollam',
    'pathanamthitta',
    'alappuzha',
    'kottayam',
    'idukki',
    'ernakulam',
    'thrissur',
    'palakkad',
    'malappuram',
    'kozhikode',
    'wayanad',
    'kannur',
    'kasaragod'
]

/**
 * Load projects for a specific district
 * @param {string} districtId - District ID matching the JSON filename
 * @returns {Promise<Array>} Array of project objects
 */
export const loadDistrictProjects = async (districtId) => {
    // Check cache first
    if (projectCache.has(districtId)) {
        return projectCache.get(districtId)
    }

    try {
        // Dynamic import based on district ID
        const module = await import(`./projects/${districtId}.json`)
        const projects = module.default?.projects || module.projects || []

        // Add districtId to each project if not present and ensure unique ID
        const enrichedProjects = projects.map(p => ({
            ...p,
            // Ensure unique ID by prefixing with districtId if not already present
            id: p.id.startsWith(districtId) ? p.id : `${districtId}-${p.id}`,
            districtId: p.districtId || districtId,
            isStatewide: districtId === 'statewide'
        }))

        // Cache the result
        projectCache.set(districtId, enrichedProjects)
        return enrichedProjects
    } catch (error) {
        console.warn(`No projects file found for district: ${districtId}`)
        return []
    }
}

/**
 * Load statewide projects
 * @returns {Promise<Array>} Array of statewide project objects
 */
export const loadStatewideProjects = async () => {
    return loadDistrictProjects('statewide')
}

/**
 * Load projects for multiple districts
 * @param {Array<string>} districtIds - Array of district IDs to load
 * @returns {Promise<Array>} Combined array of projects from all districts
 */
export const loadMultipleDistrictProjects = async (districtIds) => {
    const projectArrays = await Promise.all(
        districtIds.map(id => loadDistrictProjects(id))
    )
    return projectArrays.flat()
}

/**
 * Load all projects from all districts + statewide
 * @returns {Promise<Array>} All projects combined
 */
export const loadAllProjects = async () => {
    const allIds = ['statewide', ...DISTRICT_IDS]
    return loadMultipleDistrictProjects(allIds)
}

/**
 * Preload projects for districts (for performance)
 * @param {Array<string>} districtIds - Districts to preload
 */
export const preloadProjects = (districtIds) => {
    districtIds.forEach(id => {
        loadDistrictProjects(id).catch(() => { })
    })
}

/**
 * Clear the project cache (useful for development/refresh)
 */
export const clearProjectCache = () => {
    projectCache.clear()
}

/**
 * Get cached projects without loading
 * @param {string} districtId - District ID
 * @returns {Array|null} Cached projects or null if not loaded
 */
export const getCachedProjects = (districtId) => {
    return projectCache.get(districtId) || null
}
