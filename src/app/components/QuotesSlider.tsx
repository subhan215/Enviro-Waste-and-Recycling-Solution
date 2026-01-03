'use client'

import React from 'react'
import { motion } from 'framer-motion'

const quotes = [
  {
    text: "Enviro Solutions has transformed our community's approach to waste management. Their innovative systems made recycling effortless for everyone.",
    author: "Jhanzed Khan",
    role: "Community Leader",
    avatar: "JK"
  },
  {
    text: "Their innovative recycling programs have significantly reduced our carbon footprint. We've seen a 40% reduction in waste going to landfills.",
    author: "Gulshan Kumar",
    role: "Environmental Activist",
    avatar: "GK"
  },
  {
    text: "The home collection service has made recycling effortless for our family. The team is professional and always on time.",
    author: "Zain Mushtaq",
    role: "Satisfied Customer",
    avatar: "ZM"
  }
]

export default function QuotesSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full blur-2xl opacity-60" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50" />

      {/* Quote Icon Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
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
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            What People <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">Say</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Hear from our satisfied customers and community members
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quotes.map((quote, index) => (
            <motion.div
              key={index}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-500 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Content */}
              <p className="text-gray-600 text-lg leading-relaxed mb-8 pr-12">
                &ldquo;{quote.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200">
                  {quote.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{quote.author}</h4>
                  <p className="text-sm text-emerald-600">{quote.role}</p>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Decorative Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
