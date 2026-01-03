'use client'

import React from 'react'
import { motion } from 'framer-motion'
import HeroSection from './components/HeroSection'
import ServiceCard from './components/ServiceCard'
import GallerySection from './components/gallerySection'
import QuotesSlider from "./components/QuotesSlider"
import ImpactSection from './components/ImpactSection'
import Footer from "./components/Footer"
import RatingSection from './components/RatingSection'

// Define the services with proper image paths
const services = [
  {
    title: 'Waste Collection',
    description: 'Professional and efficient waste collection services tailored for residential and commercial needs.',
    imagePath: '/images/waste.jpg',
    slug: 'waste-collection',
  },
  {
    title: 'Recycling Centers',
    description: 'State-of-the-art recycling facilities designed to maximize material recovery and minimize waste.',
    imagePath: '/images/centers.jpg',
    slug: 'recycling-centers',
  },
  {
    title: 'Home Collection',
    description: 'Convenient doorstep collection services that make recycling effortless for every household.',
    imagePath: '/images/homeRecycle.jpg',
    slug: 'home-collection',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2" />

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
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">Services</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Comprehensive waste management and recycling solutions designed for a sustainable future
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
            {services.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore All Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <ImpactSection />
      <GallerySection />
      <QuotesSlider />
      <RatingSection />
      <Footer />
    </main>
  )
}
