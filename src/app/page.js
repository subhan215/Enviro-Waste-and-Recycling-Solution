"use client"; // Ensure the component is treated as a client component
import { Router } from "next/router";
import React from "react";

// Home Page Component
const HomePage = () => {

  // Handle navigation to Complaints Page
  const handleCurrentComplaintsClick = () => {
    Router.push("/complaints"); // Use router.push for navigation
  };

  // Handle navigation to specific service details
  const handleServiceClick = (service) => {
    Router.push(`/services/${service}`); // Navigate to service details based on the clicked service
  };

  return (
    <div
      className="relative min-h-screen text-[#0e1b11]"
      style={{
        fontFamily: '"Public Sans", "Noto Sans", sans-serif',
        backgroundColor: "#f8fcf9", 
        backgroundImage: 'url("/images/background.jpg")', // Make sure images are in /public folder
        backgroundSize: "cover", 
        backgroundPosition: "center", 
        backgroundRepeat: "no-repeat", 
      }}
    >

      {/* Logo, Header, and Button */}
      <header className="bg-[#17cf42] text-[#0e1b11] p-6 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          {/* <img src="/path-to-logo.png" alt="Logo" className="h-10 w-10 mr-4" /> */}
          <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
        </div>

        {/* Current Complaints Button */}
        <button
          className="bg-[#0e1b11] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
          onClick={handleCurrentComplaintsClick}
        >
          Register Complaints
        </button>
      </header>

      <div className="flex flex-col items-center justify-center py-8">
        <h2 className="text-4xl font-semibold mb-6 text-[#17cf42]">
          Welcome to Enviro Solutions
        </h2>
        
        {/* Services Section */}
        <div className="mt-10 w-full px-16">
          <div className="bg-[#0e1b11] p-3 rounded-lg mb-6 inline-block"> {/* Changed to inline-block */}
            <h3 className="text-3xl font-semibold text-center mb-0 text-white"> {/* Changed text color to white */}
              Our Services
            </h3>
          </div>
          <div className="flex justify-between items-center">
            {/* Waste Collection by Companies */}
            <button
              onClick={() => handleServiceClick("company-waste")}
              className="flex flex-col items-center"
            >
              <div className="h-40 w-40 bg-[#17cf42] rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="/images/waste.jpg" // Ensure the image path is correct, place the image in /public/images
                  alt="Waste Collection"
                  className="h-30 w-30 object-cover rounded-full"
                />
              </div>
              <span className="mt-2 text-[#0e1b11] font-semibold">Waste Collection</span>
            </button>

            {/* Recycling Service */}
            <button
              onClick={() => handleServiceClick("recycling")}
              className="flex flex-col items-center"
            >
              <div className="h-40 w-40 bg-[#17cf42] rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="/images/centers.jpg" // Ensure the image path is correct, place the image in /public/images
                  alt="Recycling Service"
                  className="h-30 w-30 object-cover rounded-full"
                />
              </div>
              <span className="mt-2 text-[#0e1b11] font-semibold">Recycling Centers</span>
            </button>

            {/* Home Collection Recycling Service */}
            <button
              onClick={() => handleServiceClick("home-recycling")}
              className="flex flex-col items-center"
            >
              <div className="h-40 w-40 bg-[#17cf42] rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="/images/homeRecycle.jpg" // Ensure the image path is correct, place the image in /public/images
                  alt="Home Collection"
                  className="h-30 w-30 object-cover rounded-full"
                />
              </div>
              <span className="mt-2 text-[#0e1b11] font-semibold">Home Collection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
