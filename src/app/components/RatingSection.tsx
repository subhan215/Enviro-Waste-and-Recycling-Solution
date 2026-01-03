'use client'

import { motion } from 'framer-motion'

interface Review {
  rating: number
  text: string
  date: string
  author: string
}

const reviews: Review[] = [
  {
    rating: 5,
    text: "At first I doubted the reliability of the site but after receiving my order, I was completely satisfied with the service. The team was professional and efficient.",
    date: "11/24/2024",
    author: "Victor K"
  },
  {
    rating: 5,
    text: "Beautiful service and clean process throughout. The waste collection was done on time and the recycling reports are very helpful.",
    date: "11/21/2024",
    author: "Sarah M"
  }
]

export default function RatingSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-amber-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
            Reviews
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Satisfaction</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Your satisfaction is our greatest achievement
          </p>
        </motion.div>

        {/* Overall Rating Card */}
        <motion.div
          className="max-w-md mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 mb-12 text-center shadow-xl shadow-emerald-200"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                className="w-8 h-8 text-amber-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </motion.svg>
            ))}
          </div>
          <p className="text-5xl font-bold text-white mb-2">4.9</p>
          <p className="text-emerald-100 text-lg">Based on 500+ reviews</p>
        </motion.div>

        {/* Review Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500"
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {/* Rating Stars */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      className="w-5 h-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
                <span className="text-amber-500 font-bold">5.0</span>
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-200">
                    {review.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="font-semibold text-gray-800">{review.author}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {review.date}
                </div>
              </div>

              {/* Verified Badge */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
