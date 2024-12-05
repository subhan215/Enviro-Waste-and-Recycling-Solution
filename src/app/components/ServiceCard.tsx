import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ServiceProps {
  service: {
    title: string
    description: string
    image: string
    slug: string
  }
}

const ServiceCard: React.FC<ServiceProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        src={service.image}
        alt={service.title}
        width={400}
        height={250}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h4 className="text-xl font-semibold mb-2">{service.title}</h4>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <Link
          href={`/services/${service.slug}`}
          className="bg-[#17cf42] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#15b93c] transition duration-300"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}

export default ServiceCard

