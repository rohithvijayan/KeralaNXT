import { useEffect, useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import './KeralaMap.css';

// District ID mapping from GeoJSON DISTRICT property to our data IDs
const DISTRICT_ID_MAP = {
    "Thiruvananthapuram": "thiruvananthapuram",
    "Kollam": "kollam",
    "Pathanamthitta": "pathanamthitta",
    "Alappuzha": "alappuzha",
    "Kottayam": "kottayam",
    "Idukki": "idukki",
    "Ernakulam": "ernakulam",
    "Thrissur": "thrissur",
    "Palakkad": "palakkad",
    "Malappuram": "malappuram",
    "Kozhikode": "kozhikode",
    "Wayanad": "wayanad",
    "Kannur": "kannur",
    "Kasaragod": "kasaragod"
};

const KeralaMap = ({ districts, onDistrictSelect, selectedDistrict }) => {
    const [geoData, setGeoData] = useState(null);
    const [hoveredDistrict, setHoveredDistrict] = useState(null);
    const tooltipRef = useRef(null);

    // Fetch GeoJSON data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = "https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/district.geojson";
                const response = await fetch(url);
                const data = await response.json();
                setGeoData(data);
            } catch (error) {
                console.error("Error fetching map data:", error);
            }
        };
        fetchData();
    }, []);

    // Calculate Projection & Path Generator
    const { pathGenerator } = useMemo(() => {
        if (!geoData) return { pathGenerator: null };

        const width = 500;
        const height = 800;

        const projection = d3.geoMercator();
        projection.fitSize([width, height], geoData);

        const pathGen = d3.geoPath().projection(projection);
        return { pathGenerator: pathGen };
    }, [geoData]);

    // Get district data from our districts array
    const getDistrictData = (geoName) => {
        const id = DISTRICT_ID_MAP[geoName];
        return districts?.find(d => d.id === id);
    };

    // Event Handlers
    const handleMouseEnter = (event, feature) => {
        const geoName = feature.properties.DISTRICT;
        const districtData = getDistrictData(geoName);
        setHoveredDistrict({
            geoName,
            data: districtData,
            x: event.clientX,
            y: event.clientY
        });
    };

    const handleMouseMove = (event) => {
        if (hoveredDistrict) {
            setHoveredDistrict(prev => ({
                ...prev,
                x: event.clientX,
                y: event.clientY
            }));
        }
    };

    const handleMouseLeave = () => {
        setHoveredDistrict(null);
    };

    const handleClick = (feature) => {
        const geoName = feature.properties.DISTRICT;
        const districtData = getDistrictData(geoName);
        if (districtData && onDistrictSelect) {
            onDistrictSelect(districtData);
        }
    };

    // Check if a district is selected
    const isSelected = (feature) => {
        if (!selectedDistrict) return false;
        const geoName = feature.properties.DISTRICT;
        const id = DISTRICT_ID_MAP[geoName];
        return selectedDistrict.id === id;
    };

    return (
        <div className="kerala-map-container">
            <div className="map-wrapper">
                {!geoData ? (
                    <div className="loading-text">
                        <span className="material-symbols-outlined">map</span>
                        <span>Loading Kerala Map...</span>
                    </div>
                ) : (
                    <svg
                        viewBox="0 0 500 800"
                        className="kerala-svg"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <g>
                            {geoData.features.map((feature, i) => {
                                const selected = isSelected(feature);
                                const hovered = hoveredDistrict?.geoName === feature.properties.DISTRICT;

                                return (
                                    <path
                                        key={i}
                                        d={pathGenerator(feature)}
                                        className={`district-path ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
                                        onMouseEnter={(e) => handleMouseEnter(e, feature)}
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => handleClick(feature)}
                                        style={selected ? { filter: 'url(#glow)' } : {}}
                                    />
                                );
                            })}
                        </g>
                    </svg>
                )}
            </div>

            {/* Tooltip */}
            {hoveredDistrict && (
                <div
                    ref={tooltipRef}
                    className="map-tooltip visible"
                    style={{
                        left: hoveredDistrict.x + 15,
                        top: hoveredDistrict.y + 15
                    }}
                >
                    <h3 className="tooltip-title">{hoveredDistrict.geoName}</h3>
                    {hoveredDistrict.data && (
                        <div className="tooltip-stats">
                            <span>{hoveredDistrict.data.totalProjects} Projects</span>
                            <span className="tooltip-dot">•</span>
                            <span>{hoveredDistrict.data.totalInvestment}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Tap instruction */}
            <div className="map-instruction">
                <span className="material-symbols-outlined">touch_app</span>
                <span>Tap a district to explore</span>
            </div>
        </div>
    );
};

export default KeralaMap;