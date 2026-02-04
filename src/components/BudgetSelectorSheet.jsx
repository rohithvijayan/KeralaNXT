import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import './BudgetSelectorSheet.css'

function BudgetSelectorSheet({ isOpen, onClose }) {
    const navigate = useNavigate()

    const handleSelect = (path) => {
        navigate(path)
        onClose()
    }

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768

    const sheetVariants = {
        initial: isDesktop ? { opacity: 0, scale: 0.95, x: '-50%', y: '-40%' } : { y: '100%' },
        animate: isDesktop ? { opacity: 1, scale: 1, x: '-50%', y: '-50%' } : { y: 0 },
        exit: isDesktop ? { opacity: 0, scale: 0.95, x: '-50%', y: '-40%' } : { y: '100%' }
    }

    const content = (
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
                        variants={sheetVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={isDesktop ? { duration: 0.2 } : { type: 'spring', damping: 30, stiffness: 300 }}
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

    if (typeof document === 'undefined') return null

    return createPortal(content, document.body)
}

export default BudgetSelectorSheet
