'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const router = useRouter();

  const handleDiscoverClick = () => {
    router.push('/discover');
  };

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-br from-green-700 to-green-700">
    <motion.div
      className="absolute inset-0 bg-[url('/images/nature-background.jpg')] bg-cover bg-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1.5 }}
    />
    <div className="flex flex-col items-center justify-center h-full px-4 text-center relative z-10">
      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-5xl sm:text-7xl lg:text-8xl"
        >
          Welcome to Our
        </motion.span>{" "}
        <motion.span
          className="text-[#00ED64] block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Green Initiative
        </motion.span>
      </motion.h1>
  
      <motion.p
        className="text-lg sm:text-lg md:text-xl lg:text-2xl text-white mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        Enviro Solutions for a Cleaner Tomorrow
      </motion.p>
  
      <motion.button
        className="px-8 py-3 text-base font-semibold text-green-500 bg-white rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-all duration-300"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDiscoverClick} // Correct click handler
      >
        Discover More
      </motion.button>
    </div>
  </section>
  
  );
}
