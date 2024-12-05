import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const GallerySection: React.FC = () => {
  const images = [
    '/images/g2.jpg',
    '/images/g3.jpg',
    '/images/g4.jpg',
    '/images/g5.jpg',
  ]

  return (
    <section className="py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <h3 className="text-4xl font-semibold text-center mb-16">Our Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <motion.div 
              key={index} 
              className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Image
                src={image}
                alt={`Gallery image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GallerySection

