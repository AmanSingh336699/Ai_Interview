"use client";

import { motion } from "framer-motion";
import React from "react";

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

const WordSkeleton: React.FC<SkeletonProps> = ({ height, width, className }) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg bg-gray-300/20 backdrop-blur-sm ${className}`}
      style={{ height, width }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 1.5,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-0 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default WordSkeleton;