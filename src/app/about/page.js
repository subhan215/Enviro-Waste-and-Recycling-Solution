'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
// import Header from '../components/Header'

/**
 * @typedef {Object} TeamMember
 * @property {string} name - The name of the team member.
 * @property {string} role - The role of the team member.
 * @property {string} image - The image URL for the team member.
 * @property {string} description - A brief description of the team member.
 */

/** @type {TeamMember[]} */
const teamMembers = [
  {
    name: "SUBHAN RANGILA",
    role: "PERN STACK DEVELOPER",
    image: "/images/subhan.jpg",
    description: "Subhan has over 15 years of experience in environmental conservation and sustainable business practices. He founded Enviro Solutions with a vision to create innovative, eco-friendly waste management solutions."
  },
  {
    name: "JUNAID ASIF",
    role: "PERN STACK DEVELOPER",
    image: "/images/junaid.jpg",
    description: "Junaid brings a wealth of technological expertise to our team. With a background in software engineering and IoT, he leads our efforts in developing smart, efficient waste management systems."
  },
  {
    name: "MUHAMMAD SADIQ",
    role: "PERN STACK DEVELOPER",
    image: "/images/sadiq.jpg",
    description: "Sadiq is passionate about community engagement and education. He spearheads our initiatives to raise awareness about recycling and sustainable living practices in local communities."
  }
]

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-green-50">

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center text-green-800 mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About Our Team
          </motion.h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-green-700 mb-2">{member.name}</h2>
                  <h3 className="text-lg text-green-600 mb-4">{member.role}</h3>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
