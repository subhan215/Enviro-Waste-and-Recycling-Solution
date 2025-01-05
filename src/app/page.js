'use client'

import React from 'react'
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
    description: 'Efficient waste collection services for your community.',
    imagePath: '/images/waste.jpg',
    slug: 'waste-collection',
  },
  {
    title: 'Recycling Centers',
    description: 'Advanced recycling centers for a greener future.',
    imagePath: '/images/centers.jpg',
    slug: 'recycling-centers',
  },
  {
    title: 'Home Collection',
    description: 'Convenient home waste collection services.',
    imagePath: '/images/homeRecycle.jpg',
    slug: 'home-collection',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <section id="services" className="py-16">
  <div className="container mx-auto px-4">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
      Our Services
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
      {services.map((service) => (
        <ServiceCard key={service.slug} service={service} />
      ))}
    </div>
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
