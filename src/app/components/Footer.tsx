'use client'

import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    services: {
      title: "Our services",
      links: [
        "Waste Collection",
        "Recycling Centers",
        "Home Collection",
        "Commercial Services",
        "Waste Management",
        "Environmental Consulting"
      ]
    },
    work: {
      title: "Our work",
      links: [
        "Featured projects",
        "Case studies",
        "Testimonials",
        "Success stories",
        "Impact reports"
      ]
    },
    about: {
      title: "About us",
      links: [
        "Why choose us",
        "Meet the team",
        "Careers",
        "News & Updates",
        "Sustainability Goals"
      ]
    },
    clients: {
      title: "For clients",
      links: [
        "Support resources",
        "Knowledge base",
        "Contact us",
        "Terms & Conditions",
        "Privacy Policy"
      ]
    }
  }

  return (
    <footer className="bg-[#0e1b11] text-white pt-20 pb-10">
  <div className="container mx-auto px-6">
    {/* Logo and Description Section */}
    <div className="max-w-3xl mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Leaf className="text-[#00FF00] h-8 w-8" />
        <h2 className="text-2xl md:text-3xl font-bold">Enviro Solutions</h2>
      </div>
      <p className="sm:text-sm md:text-base text-gray-300 leading-relaxed">
        Enviro Solutions is your trusted partner in environmental sustainability. We focus on waste management,
        recycling solutions, and environmental services. With over a decade of experience, we have helped
        thousands of clients achieve their sustainability goals.
      </p>
    </div>

    {/* Links Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
      {Object.entries(footerLinks).map(([key, section]) => (
        <motion.div 
          key={key}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-[#00FF00] text-base sm:text-lg md:text-xl font-semibold mb-6">
            {section.title}
          </h3>
          <ul className="space-y-4">
            {section.links.map((link) => (
              <motion.li 
                key={link}
                whileHover={{ x: 4 }}
                transition={{ type: "tween" }}
              >
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00FF00] transition-colors duration-200"
                >
                  {link}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>

    {/* Copyright */}
    <div className="mt-20 pt-8 border-t border-gray-800">
      <p className="text-sm md:text-base text-center text-gray-400">
        © {new Date().getFullYear()} Enviro Solutions. All rights reserved.
      </p>
    </div>
  </div>
</footer>

  )
}

