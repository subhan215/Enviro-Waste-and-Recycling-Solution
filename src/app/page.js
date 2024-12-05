'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

import ServiceCard from "./components/ServiceCard"
import GallerySection from "./components/gallerySection"
import QuotesSlider from "./components/QuotesSlider"
import Footer from "./components/Footer"

export default function HomePage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])
  const services = [
    {
      title: "Waste Collection",
      description:
        "Our efficient waste collection service ensures timely pickup and proper disposal of various types of waste, contributing to a cleaner environment.",
      image: "/images/waste.jpg",
      slug: "company-waste",
    },
    {
      title: "Recycling Centers",
      description:
        "Our state-of-the-art recycling centers process a wide range of materials, promoting sustainable practices and reducing landfill waste.",
      image: "/images/centers.jpg",
      slug: "recycling",
    },
    {
      title: "Home Collection",
      description:
        "We offer convenient home collection services for recyclables, making it easier for households to participate in eco-friendly practices.",
      image: "/images/homeRecycle.jpg",
      slug: "home-recycling",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8fcf9] text-[#0e1b11]">
    

      <main className="pt-20">
        <motion.section 
          className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#17cf42] via-[#17cf42]/70 to-[#a0a0a0] relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#17cf42]/30 via-[#0e1b11]/50 to-[#0e1b11]/90 z-0"></div>
          <AnimatePresence>
            {isVisible && (
              <motion.div
                className="relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <motion.h2 
                  className="text-6xl md:text-8xl font-bold text-white relative z-10 text-center p-6 rounded-l"
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  Welcome to Enviro
                </motion.h2>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#17cf42] via-[#a0a0a0] to-white rounded-xl"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  style={{
                    filter: 'url(#wavy)',
                    WebkitFilter: 'url(#wavy)',
                  }}
                />
                <svg width="0" height="0">
                  <filter id="wavy">
                    <feTurbulence type="turbulence" baseFrequency="0.01 0.05" numOctaves="5" seed="2" result="turbulence">
                      <animate attributeName="baseFrequency" dur="30s" values="0.01 0.05;0.02 0.06;0.01 0.05" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="30" />
                  </filter>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-2xl text-white font-light mt-4 relative z-10">
            Innovative Solutions for a Cleaner Tomorrow
          </p>
        </motion.section>

        <section className="py-24 bg-gradient-to-b from-white to-[#e6f7e9]">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-semibold text-center mb-16">Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        </section>

        <QuotesSlider />

        <GallerySection />
      </main>

      <Footer />
    </div>
  )
}