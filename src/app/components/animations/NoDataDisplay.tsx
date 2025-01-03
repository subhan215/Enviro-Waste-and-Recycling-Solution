"use client";

import React from "react";
import { motion } from "framer-motion";

interface NoDataDisplayProps {
  emptyText: string; // The dynamic emptyText passed from the parent component
}

const NoDataDisplay: React.FC<NoDataDisplayProps> = ({ emptyText }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[250px] w-full p-6 rounded-xl">
      <motion.svg
        className="w-32 sm:w-35 md:w-48 lg:w-56 xl:w-64" // Resize the SVG at different breakpoints
        height="auto"
        viewBox="0 0 200 200"
        initial="hidden"
        animate="visible"
      >
        {/* Magnifying glass handle */}
        <motion.line
          x1="140" // Start at circle's border
          y1="140"
          x2="190" // Extend outwards
          y2="190"
          stroke="green"
          strokeWidth="15" // Slightly thinner stroke for better proportion
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 1, ease: "easeInOut" },
            },
          }}
        />

        {/* Magnifying glass circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="60" // Decreased radius for smaller circle
          fill="none"
          stroke="green"
          strokeWidth="15"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 2, ease: "easeInOut" },
            },
          }}
        />
      </motion.svg>

      {/* Empty Text Display */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 0.5 }}
      >
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-custom-black mb-2">
          {emptyText} {/* Dynamically rendered emptyText */}
        </p>
      </motion.div>
    </div>
  );
};

export default NoDataDisplay;
