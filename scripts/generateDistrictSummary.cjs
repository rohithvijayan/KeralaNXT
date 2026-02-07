const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data/MLA_DATA');
const CONSTITUENCY_MAP_FILE = path.join(__dirname, '../src/data/ConstituencyByDistrict.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/districtSummary.json');

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
};

function getFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, fileList);
        } else if (name.endsWith('_projects.json')) {
            fileList.push(name);
        }
    });
    return fileList;
}

function parseMLAJson(rawStr) {
    try {
        const fixedStr = rawStr.replace(/:\s*NaN/g, ': null');
        return JSON.parse(fixedStr);
    } catch (e) {
        return null;
    }
}

function generateDistrictSummary() {
    const files = getFiles(DATA_DIR);
    const districts = {};

    // Load constituency map to ensure we cover all
    const constMapRaw = JSON.parse(fs.readFileSync(CONSTITUENCY_MAP_FILE, 'utf8'));
    const allDistrictsList = [];
    Object.values(constMapRaw.Kerala_Districts_and_Constituencies).forEach(region => {
        region.forEach(d => {
            allDistrictsList.push(d.district);
            districts[d.district] = {
                name: d.district,
                totalExpenditure: 0,
                projectCount: 0,
                sectors: {},
                constituencies: {}
            };
            // Pre-fill constituencies from map
            d.constituencies.forEach(c => {
                districts[d.district].constituencies[c.toUpperCase()] = {
                    name: c,
                    expenditure: 0,
                    projects: 0
                };
            });
        });
    });

    files.forEach(filePath => {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = parseMLAJson(raw);
        if (!data) return;

        // Extract district from path
        const relativePath = path.relative(DATA_DIR, filePath);
        const districtCode = relativePath.split(path.sep)[0];
        const districtName = districtNames[districtCode] || districtCode;

        if (!districts[districtName]) {
            districts[districtName] = {
                name: districtName,
                totalExpenditure: 0,
                projectCount: 0,
                sectors: {},
                constituencies: {}
            };
        }

        const normalize = (name) => {
            if (!name) return '';
            let s = name.toUpperCase()
                .replace(/\./g, '')
                .replace(/[^A-Z]/g, '')
                .replace(/MANN/g, 'MN')
                .replace(/ERANA/g, 'ERNA')
                .replace(/KK/g, 'K')
                .replace(/PP/g, 'P')
                .replace(/OO/g, 'U')
                .replace(/I$/, 'Y')
                .replace(/NGLAM/g, 'ANGALAM')
                .replace(/GLM/g, 'ANGALAM')
                .replace(/SULBATHERY/g, 'SULTHANBATHERY')
                .replace(/THIRUVANPURAM/g, 'THIRUVANANTHAPURAM')
                .replace(/SHORNUR/g, 'SHORANUR');

            if (s === 'KOZHIKODES' || s === 'KOZHIKODESOUTH') return 'KOZHIKODESOUTH';
            if (s === 'KOZHIKODEN' || s === 'KOZHIKODENORTH') return 'KOZHIKODENORTH';

            return s;
        };

        const mlaExp = data.summary?.total_expenditure_crores || 0;
        const mlaProjects = data.projects?.length || 0;
        const rawConstituency = data.constituency || 'Unknown';
        const constituencyKey = normalize(rawConstituency);

        districts[districtName].totalExpenditure += mlaExp;
        districts[districtName].projectCount += mlaProjects;

        // Sectoral breakdown
        if (data.summary?.breakdown) {
            data.summary.breakdown.forEach(s => {
                districts[districtName].sectors[s.label] = (districts[districtName].sectors[s.label] || 0) + (s.value_crores || 0);
            });
        }

        // Constituency data
        // Find matching key in pre-filled constituencies
        let targetKey = null;
        const existingKeys = Object.keys(districts[districtName].constituencies);
        const match = existingKeys.find(k => normalize(k) === constituencyKey);

        if (match) {
            targetKey = match;
        } else {
            console.warn(`[Warning] No mapping found for constituency: "${rawConstituency}" [Key: ${constituencyKey}] in district: "${districtName}". Creating new entry.`);
            targetKey = rawConstituency.toUpperCase();
            if (!districts[districtName].constituencies[targetKey]) {
                districts[districtName].constituencies[targetKey] = {
                    name: rawConstituency,
                    expenditure: 0,
                    projects: 0
                };
            }
        }

        districts[districtName].constituencies[targetKey].expenditure += mlaExp;
        districts[districtName].constituencies[targetKey].projects += mlaProjects;
    });

    // Format for output
    const output = Object.values(districts).map(d => {
        const sectorsArray = Object.entries(d.sectors)
            .map(([label, value]) => ({ label, value_crores: value }))
            .sort((a, b) => b.value_crores - a.value_crores);

        const constituenciesArray = Object.values(d.constituencies)
            .sort((a, b) => b.expenditure - a.expenditure);

        // Calculate utilization % (dummy logic for now, using a baseline of 25Cr for max)
        const utilization = Math.min(100, (d.totalExpenditure / (constituenciesArray.length * 25)) * 100).toFixed(1);

        return {
            name: d.name,
            totalExpenditure: d.totalExpenditure,
            projectCount: d.projectCount,
            utilization: parseFloat(utilization),
            sectors: sectorsArray,
            constituencies: constituenciesArray.map(c => ({
                ...c,
                utilization: Math.min(100, (c.expenditure / 25) * 100).toFixed(1)
            }))
        };
    }).sort((a, b) => b.totalExpenditure - a.totalExpenditure);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`District summary generated at ${OUTPUT_FILE}`);
}

generateDistrictSummary();
