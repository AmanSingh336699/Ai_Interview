"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
    height?: string;
    width?: string;
    className?: string;
}

const WordSkeleton: React.FC<SkeletonProps> = ({ height="40px", width="100%", className=""}) => (
    <motion.div className={`bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse ${className}`} 
    initial={{opacity: 0.5}} animate={{opacity: [0.5, 1, 0.5]}} transition={{duration: 1.5, repeat: Infinity}}
     style={{ height, width }}></motion.div>
)

export default WordSkeleton
