import { useState } from 'react'
import { motion } from 'framer-motion'
import './KeralaMap.css'

// Kerala district paths - simplified SVG paths for each district
// These are approximate paths representing each district's location
const districtPaths = {
    kasaragod: {
        path: "M 45,25 L 55,20 L 65,25 L 70,35 L 60,45 L 50,40 Z",
        label: { x: 55, y: 32 }
    },
    kannur: {
        path: "M 50,40 L 60,45 L 75,50 L 80,65 L 65,75 L 55,65 L 45,55 Z",
        label: { x: 62, y: 58 }
    },
    wayanad: {
        path: "M 75,50 L 90,45 L 100,55 L 95,70 L 80,65 Z",
        label: { x: 88, y: 58 }
    },
    kozhikode: {
        path: "M 45,55 L 55,65 L 65,75 L 60,90 L 45,85 L 40,70 Z",
        label: { x: 52, y: 75 }
    },
    malappuram: {
        path: "M 65,75 L 80,65 L 95,70 L 100,85 L 85,100 L 65,95 L 60,90 Z",
        label: { x: 80, y: 85 }
    },
    palakkad: {
        path: "M 85,100 L 100,85 L 115,90 L 120,110 L 100,120 L 90,115 Z",
        label: { x: 102, y: 102 }
    },
    thrissur: {
        path: "M 60,90 L 65,95 L 85,100 L 90,115 L 75,130 L 55,120 L 50,100 Z",
        label: { x: 70, y: 110 }
    },
    ernakulam: {
        path: "M 50,100 L 55,120 L 75,130 L 85,145 L 70,160 L 50,155 L 40,135 L 45,115 Z",
        label: { x: 60, y: 140 }
    },
    idukki: {
        path: "M 90,115 L 100,120 L 120,110 L 130,130 L 120,155 L 100,165 L 85,145 L 75,130 Z",
        label: { x: 100, y: 140 }
    },
    kottayam: {
        path: "M 70,160 L 85,145 L 100,165 L 95,185 L 75,190 L 60,175 Z",
        label: { x: 80, y: 175 }
    },
    alappuzha: {
        path: "M 40,135 L 50,155 L 60,175 L 55,195 L 40,200 L 30,180 L 35,155 Z",
        label: { x: 45, y: 175 }
    },
    pathanamthitta: {
        path: "M 75,190 L 95,185 L 110,200 L 100,220 L 80,215 L 70,200 Z",
        label: { x: 88, y: 205 }
    },
    kollam: {
        path: "M 40,200 L 55,195 L 70,200 L 80,215 L 75,235 L 55,245 L 40,230 L 35,210 Z",
        label: { x: 55, y: 220 }
    },
    thiruvananthapuram: {
        path: "M 35,210 L 40,230 L 55,245 L 50,270 L 35,280 L 25,260 L 30,235 Z",
        label: { x: 40, y: 255 }
    }
}

function KeralaMap({ districts, onDistrictSelect, selectedDistrict }) {
    const [hoveredDistrict, setHoveredDistrict] = useState(null)

    return (
        <div className="kerala-map-container">
            <svg
                viewBox="0 0 150 310"
                className="kerala-map-svg"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Outer glow filter */}
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                    </filter>
                </defs>

                {/* District paths */}
                {districts.map((district) => {
                    const pathData = districtPaths[district.id]
                    if (!pathData) return null

                    const isSelected = selectedDistrict?.id === district.id
                    const isHovered = hoveredDistrict === district.id

                    return (
                        <g key={district.id}>
                            <motion.path
                                d={pathData.path}
                                className={`district-path ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                                onClick={() => onDistrictSelect(district)}
                                onMouseEnter={() => setHoveredDistrict(district.id)}
                                onMouseLeave={() => setHoveredDistrict(null)}
                                initial={false}
                                animate={{
                                    fill: isSelected ? 'rgba(75, 124, 111, 0.25)' :
                                        isHovered ? 'rgba(75, 124, 111, 0.1)' :
                                            'rgba(255, 255, 255, 0.5)',
                                    stroke: isSelected || isHovered ? '#3a6157' : '#4b7c6f'
                                }}
                                transition={{ duration: 0.2 }}
                            />

                            {/* Pulsing dot for selected/major districts */}
                            {(isSelected) && (
                                <g transform={`translate(${pathData.label.x}, ${pathData.label.y})`}>
                                    <motion.circle
                                        r="6"
                                        fill="rgba(75, 124, 111, 0.3)"
                                        className="pulse-ring"
                                        animate={{
                                            scale: [1, 1.8],
                                            opacity: [0.6, 0]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeOut"
                                        }}
                                    />
                                    <circle r="4" fill="#4b7c6f" stroke="white" strokeWidth="2" />
                                </g>
                            )}
                        </g>
                    )
                })}

                {/* District labels on hover */}
                {hoveredDistrict && districtPaths[hoveredDistrict] && (
                    <motion.g
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <rect
                            x={districtPaths[hoveredDistrict].label.x - 25}
                            y={districtPaths[hoveredDistrict].label.y - 20}
                            width="50"
                            height="16"
                            rx="4"
                            fill="#2D3436"
                            opacity="0.9"
                        />
                        <text
                            x={districtPaths[hoveredDistrict].label.x}
                            y={districtPaths[hoveredDistrict].label.y - 9}
                            textAnchor="middle"
                            fill="white"
                            fontSize="7"
                            fontWeight="600"
                        >
                            {districts.find(d => d.id === hoveredDistrict)?.name || ''}
                        </text>
                    </motion.g>
                )}
            </svg>

            {/* Tap instruction */}
            <div className="map-instruction">
                <span className="material-symbols-outlined animate-bounce-subtle">touch_app</span>
                <span>Tap a district to explore</span>
            </div>
        </div>
    )
}

export default KeralaMap
