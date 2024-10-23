"use client";
import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi"; // Icons for the hamburger menu

const ModernNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to handle screen resizing
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setIsOpen(false); // Close the mobile menu when the screen is large
      setIsLargeScreen(true); // Update to indicate a large screen
    } else {
      setIsLargeScreen(false); // It's a mobile screen now
    }
  };

  // Set up event listener for screen resizing
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    // Call the handler once on component mount to set the initial state
    handleResize();

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center p-5">
        {/* Logo */}
        <div className="text-2xl font-bold text-green-600">
          <a href="#">Enviro</a>
        </div>

        {/* Full Navbar for larger screens */}
        <div className="hidden md:flex gap-8 items-center">
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Home
          </a>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            About Us
          </a>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Services
          </a>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Contact
          </a>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
            Get Started
          </button>
        </div>

        {/* Hamburger Menu for mobile screens */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu}>
            {isOpen ? (
              <FiX className="text-3xl text-green-600" />
            ) : (
              <FiMenu className="text-3xl text-green-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Sliding from the Left */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col p-5 gap-6">
          <a href="#" className="text-gray-700 text-lg hover:text-green-600 transition">
            Home
          </a>
          <a href="#" className="text-gray-700 text-lg hover:text-green-600 transition">
            About Us
          </a>
          <a href="#" className="text-gray-700 text-lg hover:text-green-600 transition">
            Services
          </a>
          <a href="#" className="text-gray-700 text-lg hover:text-green-600 transition">
            Contact
          </a>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition mt-4">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default ModernNavbar;
