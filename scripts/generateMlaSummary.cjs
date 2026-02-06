const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data/MLA_DATA');
const OUTPUT_FILE = path.join(__dirname, '../src/data/mlaSummary.json');

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
        console.warn('Failed to parse MLA JSON:', e);
        return null;
    }
}

function generateSummary() {
    const files = getFiles(DATA_DIR);
    const summary = [];
    const sectorTotals = {};

    files.forEach(filePath => {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = parseMLAJson(raw);
        if (!data) return;

        // Extract district from path
        const relativePath = path.relative(path.join(__dirname, '../src/data'), filePath);
        const pathParts = relativePath.split(path.sep);
        const districtCode = pathParts[1];
        const district = districtNames[districtCode] || districtCode;

        const mlaSummary = {
            id: `./${relativePath.replace(/\\/g, '/')}`,
            name: data.mla_name,
            constituency: data.constituency,
            district: district,
            totalExpenditure: data.summary?.total_expenditure_crores || 0,
            projectCount: data.projects?.length || 0,
            image: data.image
        };

        summary.push(mlaSummary);

        // Track sector totals for aggregate stats
        if (data.summary?.breakdown) {
            data.summary.breakdown.forEach(sector => {
                const label = sector.label;
                if (!sectorTotals[label]) {
                    sectorTotals[label] = 0;
                }
                sectorTotals[label] += sector.value_crores || 0;
            });
        }
    });

    const aggregate = {
        totalMLAs: summary.length,
        totalExpenditure: summary.reduce((sum, m) => sum + m.totalExpenditure, 0),
        totalProjects: summary.reduce((sum, m) => sum + m.projectCount, 0),
        totalDistricts: Object.keys(districtNames).length,
        sectorBreakdown: Object.entries(sectorTotals)
            .map(([label, value]) => ({ label, value_crores: value }))
            .sort((a, b) => b.value_crores - a.value_crores)
    };

    const output = {
        mlas: summary.sort((a, b) => b.totalExpenditure - a.totalExpenditure),
        aggregate: aggregate
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Summary generated successfully at ${OUTPUT_FILE}`);
}

generateSummary();
