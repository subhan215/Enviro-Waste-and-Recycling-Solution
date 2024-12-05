"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface NoDataDisplayProps {
  emptyText: string; // The dynamic emptyText passed from the parent component
}

const NoDataDisplay: React.FC<NoDataDisplayProps> = ({ emptyText }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[250px] w-full p-6 rounded-xl">
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        initial="hidden"
        animate="visible"
      >
        {/* Magnifying glass handle */}
        <motion.line
          x1="140"
          y1="140"
          x2="180"
          y2="180"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1,
              transition: { duration: 1, ease: "easeInOut" }
            }
          }}
        />

        {/* Magnifying glass circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1,
              transition: { duration: 2, ease: "easeInOut" }
            }
          }}
        />

        {/* Left eye */}
        <motion.path
          d="M 60 100 Q 80 80 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        />

        {/* Right eye */}
        <motion.path
          d="M 100 100 Q 120 80 140 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        />

        {/* Sad mouth */}
        <motion.path
          d="M 60 140 Q 100 120 140 140"
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        />
      </motion.svg>

      {/* Empty Text Display */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 0.5 }}
      >
        <p className="text-2xl font-bold text-custom-green mb-2">
          {emptyText}  {/* Dynamically rendered emptyText */}
        </p>
      </motion.div>
    </div>
  )
}

export default NoDataDisplay
