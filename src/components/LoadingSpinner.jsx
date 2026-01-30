import { motion } from 'framer-motion'

const LoadingSpinner = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            background: 'var(--color-background, #0c1613)',
            gap: '1.5rem',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: Infinity
                }}
                style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #10b77f 0%, #0d9488 100%)',
                    boxShadow: '0 0 20px rgba(16, 183, 127, 0.3)'
                }}
            />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }}
            >
                KeralaStory
            </motion.div>
        </div>
    )
}

export default LoadingSpinner
