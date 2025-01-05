'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface Review {
  rating: number
  text: string
  date: string
  author: string
}

const reviews: Review[] = [
  {
    rating: 5,
    text: "At first I doubted the reliability of the site but after receiving my order, I was completely satisfied with the service.",
    date: "11/24/2024",
    author: "Victor K"
  },
  {
    rating: 5,
    text: "Beautiful service and clean process throughout.",
    date: "11/21/2024",
    author: "Sarah M"
  }
]

export default function RatingSection() {
  return (
    <section className="py-16 bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg">
  <div className="container mx-auto px-4">
    <motion.h2
      className="text-2xl md:text-3xl font-bold text-center mb-12 text-green-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      Our Citizen satisfaction is our greatest achievement
    </motion.h2>
    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
      {reviews.map((review, idx) => (
        <motion.div
          key={idx}
          className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
          initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: idx * 0.2 }}
        >
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
            <span className="ml-2 text-amber-400 font-semibold">
              5 / 5
            </span>
          </div>
          <p className="text-sm sm:text-sm md:text-base text-gray-700 mb-4">
            {review.text}
          </p>
          <div className="text-xs md:text-sm text-gray-500">
            Review of {review.date} by {"Jamal hussain"}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

  )
}

