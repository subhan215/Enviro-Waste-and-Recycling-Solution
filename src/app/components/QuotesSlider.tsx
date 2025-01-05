'use client'

import React from 'react'
import { motion } from 'framer-motion'

const quotes = [
  {
    text: "Enviro Solutions has transformed our community's approach to waste management.",
    author: "Jhanzed Khan , Local Resident"
  },
  {
    text: "Their innovative recycling programs have significantly reduced our carbon footprint.",
    author: "Gulshan Kumar, Environmental Activist"
  },
  {
    text: "The home collection service has made recycling effortless for our family.",
    author: "Zain Mushtaq, Local Resident"
  }
]

export default function QuotesSection() {
  return (
    <section className="py-24 bg-green-100">
  <div className="container mx-auto px-4">
    <motion.h2
      className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 text-custom-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      What People Say
    </motion.h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {quotes.map((quote, index) => (
        <motion.div
          key={index}
          className="bg-white bg-opacity-70 p-6 rounded-lg shadow-md backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
        >
          <p className="text-sm md:text-base lg:text-xl mb-4 text-gray-800">
            {quote.text}
          </p>
          <p className="font-semibold text-green-700">
            - {quote.author}
          </p>
        </motion.div>
      ))}
    </div>
  </div>
</section>

  )
}

