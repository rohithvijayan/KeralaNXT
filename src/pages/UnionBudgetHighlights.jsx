import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import { getUnionMajorAnnouncements } from '../data/unionBudgetLoader'
import './UnionBudgetHighlights.css'

const UnionBudgetHighlights = () => {
    const navigate = useNavigate()
    const allAnnouncements = getUnionMajorAnnouncements()

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSector, setSelectedSector] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedAcc, setSelectedAcc] = useState(null)
    const itemsPerPage = 20

    const sectors = useMemo(() => {
        const set = new Set(allAnnouncements.map(a => a.sector.split(' / ')[0]))
        return ['All', ...Array.from(set).sort()]
    }, [allAnnouncements])

    const filteredAnnouncements = useMemo(() => {
        return allAnnouncements.filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSector = selectedSector === 'All' || a.sector.includes(selectedSector)
            return matchesSearch && matchesSector
        })
    }, [allAnnouncements, searchTerm, selectedSector])

    const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage)
    const paginatedAnnouncements = filteredAnnouncements.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleSectorChange = (sector) => {
        setSelectedSector(sector)
        setCurrentPage(1)
    }

    return (
        <div className="highlights-page">
            <Header
                showBack
                title="Budget Highlights"
                onBack={() => navigate('/union-budget-glance')}
            />

            <div className="highlights-controls">
                <div className="search-container">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Search announcements, schemes..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <span
                            className="material-symbols-outlined"
                            style={{ cursor: 'pointer', fontSize: '18px' }}
                            onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                        >
                            close
                        </span>
                    )}
                </div>

                <div className="filter-scroll">
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            className={`filter-chip ${selectedSector === sector ? 'active' : ''}`}
                            onClick={() => handleSectorChange(sector)}
                        >
                            {sector}
                        </button>
                    ))}
                </div>
            </div>

            <main className="highlights-content-wrapper">
                <div className="highlights-list">
                    <AnimatePresence mode="popLayout">
                        {paginatedAnnouncements.map((acc, idx) => (
                            <motion.div
                                key={acc.id}
                                id={`acc-card-${acc.id}`}
                                className="acc-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: idx < 10 ? idx * 0.03 : 0 }}
                                onClick={() => setSelectedAcc(acc)}
                            >
                                <div className="acc-top">
                                    <span className="acc-sector-tag">{acc.sector}</span>
                                </div>

                                <h3 className="acc-title">{acc.title}</h3>

                                <div className="acc-card-footer-mini">
                                    <div className="meta-item">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <span>{acc.state}</span>
                                    </div>
                                    <div className="acc-footer-arrow">
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredAnnouncements.length === 0 && (
                        <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ccc' }}>search_off</span>
                            <p style={{ color: 'var(--highlight-text-muted)', marginTop: '12px' }}>No matches found for your search.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination-wrapper">
                        <button
                            className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                            Prev
                        </button>

                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`page-num ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {selectedAcc && (
                    <div className="acc-modal-overlay" onClick={() => setSelectedAcc(null)}>
                        <motion.div
                            className="acc-modal-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="acc-modal-close" onClick={() => setSelectedAcc(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <div className="acc-modal-content">
                                <span className="acc-sector-tag">{selectedAcc.sector}</span>
                                <h2 className="acc-modal-title">{selectedAcc.title}</h2>
                                <p className="acc-modal-desc">{selectedAcc.description}</p>

                                <div className="acc-modal-footer">
                                    <div className="meta-item">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <span>Target: {selectedAcc.state}</span>
                                    </div>
                                    <div className="acc-modal-budget">
                                        <span className="budget-label">Financial Allocation</span>
                                        <span className="budget-val">{selectedAcc.Budget}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UnionBudgetHighlights
