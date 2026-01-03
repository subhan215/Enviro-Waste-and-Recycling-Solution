'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ServiceCardProps {
  service: {
    title: string
    description: string
    imagePath: string
    slug: string
  }
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <motion.div
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 w-full max-w-sm"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      {/* Image Container */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={service.imagePath}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-700 shadow-sm">
            Service
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        {/* Title */}
        <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
          {service.title}
        </h4>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          {service.description}
        </p>

        {/* Button */}
        <motion.button
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Learn More
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ServiceCard
