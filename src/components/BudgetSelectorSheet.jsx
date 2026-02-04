import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './BudgetSelectorSheet.css'

function BudgetSelectorSheet({ isOpen, onClose }) {
    const navigate = useNavigate()

    const handleSelect = (path) => {
        navigate(path)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="budget-sheet-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="budget-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        <button className="budget-sheet-close" onClick={onClose}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="budget-sheet-handle" />
                        <h2 className="budget-sheet-title">Select Budget Analysis</h2>

                        <div className="budget-options">
                            <div className="budget-option-card state" onClick={() => handleSelect('/state-budget')}>
                                <div className="icon-box">
                                    <span className="material-symbols-outlined">account_balance</span>
                                </div>
                                <span>Kerala State Budget</span>
                            </div>

                            <div className="budget-option-card union" onClick={() => handleSelect('/union-budget-glance')}>
                                <div className="icon-box">
                                    <span className="material-symbols-outlined">insights</span>
                                </div>
                                <span>Union Budget 2026</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default BudgetSelectorSheet
