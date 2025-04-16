"use client";

import { motion, useAnimationControls } from "framer-motion";
import { memo, useEffect } from "react";

const TypingIndicator = memo(() => {
  const controls = useAnimationControls();

  const dotVariants = {
    animate: (i: number) => ({
      y: [0, -15, 0],
      scale: [1, 1.4, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut",
      },
    }),
    hover: {
      scale: 1.6,
      backgroundColor: "#22d3ee",
      transition: { duration: 0.3 },
    },
  };

  const containerVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  return (
    <div className="scale-75 sm:scale-90 lg:scale-85 xl:scale-80">
      <motion.div
        className="flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-full shadow-lg w-fit mx-auto"
        variants={containerVariants}
        initial="initial"
        whileHover="hover"
      >
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full"
            custom={dot}
            variants={dotVariants}
            initial="initial"
            animate={controls}
            whileHover="hover"
            style={{
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.5)",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
});

export default TypingIndicator;