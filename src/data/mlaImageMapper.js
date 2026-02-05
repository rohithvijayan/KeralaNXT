import mlaImageIds from './mlaImageIds.json';

/**
 * Normalizes a string for comparison by lowercasing and removing non-alphabetic characters
 */
const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z]/g, '');
};

const constituencyVariations = {
    'ambalapuzha': 'ambalappuzha',
    'tirurangadi': 'thirurangadi',
    'thiruvanpuram': 'thiruvananthapuram',
    'perinthalmna': 'perinthalmanna',
    'irinjalakkuda': 'irijalakuda',
    'puthukkad': 'pudukkad',
    'sulbathery': 'sulthanbathery',
    'mannarkad': 'mannarkkad',
    'shornur': 'shoranur',
    'kunnamnglam': 'kunnamangalam',
    'kozhis': 'kozhikodesouth', // Assuming KOZHIKODE S. maps to South
    'kozhin': 'kozhikodenorth', // Assuming KOZHIKODE N.
    'chadayamglm': 'chadayamangalam',
    'chathannoor': 'chathanoor',
    'thiruvambady': 'thiruvambadi',
    'mattannur': 'mattannur',
    'kodungallur': 'kodungallur',
    'perinthalmanna': 'perinthalmanna',
    'kondotty': 'kondotty'
};

/**
 * Dictionary of name variations between JSON data and Cloudinary IDs
 */
const nameVariations = {
    'kunhambu': 'kunjambu'
};

/**
 * Manual overrides for specific MLAs (Maps normalized constituency or name to full Cloudinary ID)
 */
const manualOverrides = {
    // Add pinpoint overrides here, e.g., 'constituency_name': 'cloudinary_id'
};

/**
 * Gets the Cloudinary public ID for an MLA based on constituency and/or name
 * @param {string} constituency - The constituency name from JSON data
 * @param {string} name - The MLA name from JSON data
 * @param {string} existingImage - Optional existing image ID from JSON data
 * @returns {string|null} The Cloudinary public ID or null if not found
 */
export function getMlaImageId(constituency, name, existingImage) {
    // 0. Priority 0: If an image ID is already provided in the JSON and it's not a placeholder, use it
    if (existingImage && typeof existingImage === 'string' && !existingImage.includes('placeholder')) {
        return existingImage;
    }

    if (!constituency) return null;

    const normConst = normalize(constituency);
    const normName = normalize(name);

    // 1. Check for manual overrides first (highest priority)
    if (manualOverrides[normConst]) return manualOverrides[normConst];
    if (manualOverrides[normName]) return manualOverrides[normName];

    // 2. Check for variations and fuzzy matching
    const searchTerm = constituencyVariations[normConst] || normConst;
    const searchName = nameVariations[normName] || normName;

    // Try to find a match in the image ID list
    const match = mlaImageIds.find(id => {
        const idLower = normalize(id);

        // Match by constituency first (most reliable)
        if (idLower.includes(searchTerm)) return true;

        // Fallback to name match if name is long enough to be unique
        if (searchName.length > 5 && idLower.includes(searchName)) return true;

        return false;
    });

    return match || null;
}
