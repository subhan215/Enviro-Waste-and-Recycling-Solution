'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Recycle, Trash2 } from 'lucide-react'

const testimonials = [
  {
    quote: "The team at Enviro Solutions is professional, efficient, and truly cares about our planet.",
    author: "Mike Johnson",
    title: "Business Owner"
  },
  {
    quote: "Outstanding service that has transformed how our community handles recycling.",
    author: "Sarah Williams",
    title: "Community Leader"
  },
  {
    quote: "Their innovative approach to waste management sets new industry standards.",
    author: "David Chen",
    title: "Environmental Consultant"
  }
]

export default function QuotesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="py-32 bg-[#0e1b11] relative overflow-hidden">
      {/* Wavy Background */}
      <motion.div
        className="absolute inset-0 bg-[#00FF00]/10"
        style={{
          filter: 'url(#wave)',
          WebkitFilter: 'url(#wave)',
        }}
      />
      <svg width="0" height="0">
        <filter id="wave">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.01" 
            numOctaves="3" 
            result="noise" 
          >
            <animate 
              attributeName="baseFrequency" 
              dur="30s" 
              values="0.01;0.015;0.01" 
              repeatCount="indefinite" 
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="150" />
        </filter>
      </svg>

      {/* Floating Icons */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {i % 2 === 0 ? <Recycle size={24} /> : <Trash2 size={24} />}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 text-[#00FF00] relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          What Our Users Response
        </motion.h2>
        
        <div className="relative max-w-3xl mx-auto">
          <button 
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 text-[#00FF00] hover:scale-110 transition-transform"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={40} />
          </button>
          
          <div className="relative h-[200px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-2xl italic text-white mb-8 relative z-10">
                  {testimonials[currentIndex].quote}
                </p>
                <div className="text-[#00FF00]">
                  <p className="font-semibold text-xl">
                    - {testimonials[currentIndex].author}
                  </p>
                  <p className="text-white/80">
                    {testimonials[currentIndex].title}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 text-[#00FF00] hover:scale-110 transition-transform"
            aria-label="Next testimonial"
          >
            <ChevronRight size={40} />
          </button>
          
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-[#00FF00] scale-125' 
                    : 'bg-[#00FF00]/40 hover:bg-[#00FF00]/60'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

