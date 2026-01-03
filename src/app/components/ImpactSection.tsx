'use client'

import React from 'react'
import { motion } from 'framer-motion'

const Icons = {
  Recycle: () => (
    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Tree: () => (
    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Leaf: () => (
    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Community: () => (
    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
}

const ImpactSection = () => {
  const impacts = [
    { title: 'Tons Recycled', value: '50,000+', icon: <Icons.Recycle />, color: 'from-emerald-400 to-emerald-600' },
    { title: 'Trees Saved', value: '100,000+', icon: <Icons.Tree />, color: 'from-green-400 to-green-600' },
    { title: 'CO2 Reduced', value: '25,000 tons', icon: <Icons.Leaf />, color: 'from-teal-400 to-teal-600' },
    { title: 'Communities Served', value: '500+', icon: <Icons.Community />, color: 'from-cyan-400 to-cyan-600' },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
            Our Impact
          </span>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Making a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">Difference</span>
          </h3>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Together, we are creating a sustainable future for our planet and communities
          </p>
        </motion.div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {impacts.map((impact, index) => (
            <motion.div
              key={impact.title}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-xl transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {/* Icon */}
              <motion.div
                className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${impact.color} rounded-2xl flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-white">
                  {React.cloneElement(impact.icon, { className: "w-8 h-8 text-white" })}
                </div>
              </motion.div>

              {/* Value */}
              <motion.h4
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                {impact.value}
              </motion.h4>

              {/* Title */}
              <p className="text-gray-500 font-medium">{impact.title}</p>

              {/* Decorative Line */}
              <div className="mt-4 h-1 w-12 mx-auto bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImpactSection
