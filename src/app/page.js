"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()
  const [typedText, setTypedText] = useState("")
  const fullText = "Welcome to Enviro Solutions"

  useEffect(() => {
    let index = 0
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(index))
        index++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  const handleCurrentComplaintsClick = () => {
    router.push("/complaints")
  }

  const handleServiceClick = (service: string) => {
    router.push(`/services/${service}`)
  }

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
    <div
      className="relative min-h-screen text-[#0e1b11]"
      style={{
        fontFamily: '"Public Sans", "Noto Sans", sans-serif',
        backgroundColor: "#f8fcf9",
        backgroundImage: 'url("/images/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="bg-[#17cf42] text-[#0e1b11] p-6 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
        </div>
        <button
          className="bg-[#0e1b11] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
          onClick={handleCurrentComplaintsClick}
        >
          Registered Complaints
        </button>
      </header>

      <div className="flex flex-col items-center justify-center py-8">
        <div className="border-t-4 border-dotted border-[#0e1b11] w-full mb-2" />
        <h2 className="text-4xl font-semibold mb-2 text-[#17cf42] relative">
          {typedText}
          <span className="absolute right-0 w-0.5 h-8 bg-[#17cf42] animate-blink" />
        </h2>
        <div className="border-t-4 border-dotted border-[#0e1b11] w-full mt-2" />
      </div>

      <div className="flex justify-center items-center h-full mb-8">
        <div className="bg-[#0e1b11] p-3 rounded-lg">
          <h3 className="text-3xl font-semibold text-center text-white">Our Services</h3>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {services.map((service, index) => (
          <div
            key={service.title}
            className={`flex flex-col md:flex-row items-center justify-between mb-16 ${
              index % 2 !== 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h4 className="text-2xl font-semibold mb-4 text-[#17cf42]">{service.title}</h4>
              <p className="text-lg text-[#0e1b11]">{service.description}</p>
              <button
                onClick={() => handleServiceClick(service.slug)}
                className="mt-4 bg-[#0e1b11] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
              >
                Learn More
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="h-64 w-64 bg-[#17cf42] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={240}
                  height={240}
                  className="object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}