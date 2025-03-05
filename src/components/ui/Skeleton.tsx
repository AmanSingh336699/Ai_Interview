import React from 'react'
import { motion } from 'framer-motion'

function Skeleton({height= "20px", width= "100%"}) {
  return (
    <motion.div className='bg-gradient-to-r from-gray-700 via-gray-600 rounded-md' style={{ height, width }} initial={{opacity: 0.5}} 
    animate={{opacity: [0.6, 1, 0.6]}} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} />
  )
}

export default React.memo(Skeleton)