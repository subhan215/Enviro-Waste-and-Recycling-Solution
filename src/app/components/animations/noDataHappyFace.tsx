"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface NoDataHappyFaceProps {
  emptyText: string; // The dynamic emptyText passed from the parent component
}

const NoDataHappyFace: React.FC<NoDataHappyFaceProps> = ({ emptyText }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[250px] w-full p-6 rounded-xl">
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        initial="hidden"
        animate="visible"
      >
        {/* Head Circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          //stroke="currentColor"
          stroke="green" // Black color for head
          strokeWidth="20"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1,
              transition: { duration: 1, ease: "easeInOut" }
            }
          }}
        />

        {/* Left eye */}
        <motion.circle
          cx="70"
          cy="80"
          r="10"
          //fill="currentColor"
          fill="black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        />

        {/* Right eye */}
        <motion.circle
          cx="130"
          cy="80"
          r="10"
          //fill="currentColor"
          fill="black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        />

        {/* Happy mouth */}
        <motion.path
          d="M 60 130 Q 100 160 140 130"
          fill="none"
          //stroke="currentColor"
          stroke = "black"
          strokeWidth="20"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        />
      </motion.svg>

      {/* Empty Text Display */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <p className="text-2xl font-bold text-green-700 mb-2">
          {emptyText}  {/* Dynamically rendered emptyText */}
        </p>
      </motion.div>
    </div>
  )
}

export default NoDataHappyFace
