import React from 'react'
import { motion } from 'framer-motion'

const ImpactSection = () => {
  const impacts = [
    { title: 'Tons Recycled', value: '50,000+', icon: '♻️' },
    { title: 'Trees Saved', value: '100,000+', icon: '🌳' },
    { title: 'CO2 Reduced', value: '25,000 tons', icon: '🌿' },
    { title: 'Communities Served', value: '500+', icon: '🏘️' },
  ]

  return (
    <section className="py-24 bg-green-100">
    <div className="container mx-auto px-4">
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center mb-16 text-custom-black">
        Our Environmental Impact
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {impacts.map((impact, index) => (
          <motion.div
            key={impact.title}
            className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="text-xl md:text-2xl lg:text-4xl mb-4">{impact.icon}</div>
            <h4 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 text-green-800">
              {impact.value}
            </h4>
            <p className="text-sm md:text-base lg:text-lg text-gray-700">{impact.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  
  )
}

export default ImpactSection

