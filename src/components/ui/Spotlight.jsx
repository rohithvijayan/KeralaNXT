import React from "react";
import { motion } from "framer-motion";

/**
 * Spotlight component - Creates animated light beams effect
 * Adapted from shadcn/ui for use with framer-motion
 */
export const Spotlight = ({
    gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(158, 84%, 50%, .12) 0, hsla(158, 84%, 40%, .04) 50%, hsla(158, 84%, 30%, 0) 80%)",
    gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(158, 84%, 50%, .08) 0, hsla(158, 84%, 40%, .02) 80%, transparent 100%)",
    gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(158, 84%, 50%, .06) 0, hsla(158, 84%, 30%, .02) 80%, transparent 100%)",
    translateY = -200,
    width = 400,
    height = 800,
    smallWidth = 180,
    duration = 8,
    xOffset = 60,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="spotlight-container"
        >
            {/* Left Spotlight */}
            <motion.div
                animate={{ x: [0, xOffset, 0] }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                className="spotlight-beam spotlight-left"
            >
                <div
                    style={{
                        transform: `translateY(${translateY}px) rotate(-45deg)`,
                        background: gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                    className="spotlight-ray primary"
                />
                <div
                    style={{
                        transform: "rotate(-45deg) translate(5%, -50%)",
                        background: gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                    className="spotlight-ray secondary"
                />
                <div
                    style={{
                        transform: "rotate(-45deg) translate(-180%, -70%)",
                        background: gradientThird,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                    className="spotlight-ray tertiary"
                />
            </motion.div>

            {/* Right Spotlight */}
            <motion.div
                animate={{ x: [0, -xOffset, 0] }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                className="spotlight-beam spotlight-right"
            >
                <div
                    style={{
                        transform: `translateY(${translateY}px) rotate(45deg)`,
                        background: gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                    className="spotlight-ray primary right"
                />
                <div
                    style={{
                        transform: "rotate(45deg) translate(-5%, -50%)",
                        background: gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                    className="spotlight-ray secondary right"
                />
                <div
                    style={{
                        transform: "rotate(45deg) translate(180%, -70%)",
                        background: gradientThird,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                    className="spotlight-ray tertiary right"
                />
            </motion.div>
        </motion.div>
    );
};

export default Spotlight;
