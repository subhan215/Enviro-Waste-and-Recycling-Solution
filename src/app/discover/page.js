'use client'

import { motion } from 'framer-motion'

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24">
      <motion.div 
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold text-green-800 mb-8">Discover Our Impact</h1>
        <p className="text-xl text-green-700 mb-12">
          Learn how we are making a difference in environmental sustainability
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            className="bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600">
            To create a seamless, efficient, and eco-friendly waste management ecosystem by 
            empowering users, companies, and administrators to collaborate effectively. We aim 
            to promote sustainability through transparent processes, innovative solutions, and 
            rewarding recycling efforts, contributing to a cleaner and greener future.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Our Impact</h2>
            <p className="text-gray-600">
              <span className="font-semibold text-green-800">Empowering Users:</span> Enabling users to take control of waste management through easy reporting, recycling requests, and fair reward systems. <br />
              <span className="font-semibold text-green-800">Enhanced Accountability:</span> Ensuring companies adhere to schedules, resolve missed pickups promptly, and maintain transparency through user-company interactions and AI-verifiable reports. <br />
              <span className="font-semibold text-green-800">Sustainability Rewards:</span> Encouraging recycling by incentivizing users with rewards and coins for their contributions to sustainability. <br />
              <span className="font-semibold text-green-800">Improved Waste Pickup Efficiency:</span> Streamlining regular and missed pickups with advanced scheduling, truck assignments, and area-specific approvals. <br />
              <span className="font-semibold text-green-800">Administrative Oversight:</span> Ensuring fairness and efficiency by resolving disputes, approving area requests, and managing company agreements to uphold service quality. <br />
              <span className="font-semibold text-green-800">Community Support:</span> Connecting users with nearby recycling centers and fostering eco-conscious behaviors through actionable insights and accessible resources.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
