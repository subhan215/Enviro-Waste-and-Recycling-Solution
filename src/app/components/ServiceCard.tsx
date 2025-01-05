'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

// Define the ServiceCardProps interface to type the service data
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
    className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-2xl w-72 md:w-80"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.03 }}
  >
    <div className="relative h-48 w-full overflow-hidden">
      {/* Dynamically load the image using the service.imagePath */}
      <Image
        src={service.imagePath}
        alt={service.title}
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-300 hover:scale-110"
      />
    </div>
    <div className="p-6">
      <h4 className="text-base md:text-xl font-semibold mb-2">
        {service.title}
      </h4>
      <p className="text-sm text-gray-600">{service.description}</p>
      <motion.button
        className="mt-4 bg-green-500 text-white text-sm px-4 py-2 rounded-full font-semibold"
        whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
        whileTap={{ scale: 0.95 }}
      >
        Learn More
      </motion.button>
    </div>
  </motion.div>
  
    
  )
}

export default ServiceCard
