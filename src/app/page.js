"use client"; // Ensure the component is treated as a client component
import React, { useState } from "react";
import UserRegistration from './signup/userRegistration'; // Import the user registration component
import CompanyRegistration from './signup/companyRegistration'; // Import the company registration component
import CompanyProfile from './companyProfile/cProfile'; // Import Company Profile Component
import UserProfile from './userProfile/uProfile'; // Import User Profile Component
import SignIn from './signin/page'; // Import SignIn component
import SignUp from "./signup/signup"; // Import SignUp component

// Main Page Component
const Page = () => {
    const [currentPage, setCurrentPage] = useState("home"); // State for managing current page
    const [profilePic, setProfilePic] = useState("/images/default-profile.jpg"); // Default profile picture

    const handleProfileClick = () => setCurrentPage("profile-options");
    const handleCompanyClick = () => setCurrentPage("company-registration");
    const handleUserClick = () => setCurrentPage("user-registration");
    const handleViewCompanyProfile = () => setCurrentPage("company-profile"); // Add this function
    const handleViewUserProfile = () => setCurrentPage("user-profile"); // Add this function

    const renderHomePage = () => (
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
                <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
                <button className="bg-[#0e1b11] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#444c48] transition duration-300">
                    Registered Complaints
                </button>
            </header>

            <div className="flex justify-between items-center mt-8 px-6">
                <div className="flex space-x-4">
                    <button
                        className="bg-[#0e1b11] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
                        onClick={() => setCurrentPage("sign-in")}
                    >
                        Sign In
                    </button>
                    <button
                        className="bg-[#0e1b11] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
                        onClick={handleUserClick}
                    >
                        Sign Up
                    </button>
                </div>
                <div className="h-24 w-32 bg-[#17cf42] rounded-full flex items-center justify-center border-4 border-[#0e1b11]">
                    <img
                        src={profilePic}
                        alt="Profile Logo"
                        className="h-full w-full rounded-full object-cover"
                    />
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
                <div className="border-t-4 border-dotted border-[#0e1b11] w-full mb-2"></div>
                <h2 className="text-4xl font-semibold mb-2 text-[#17cf42]">
                    Welcome to Enviro Solutions
                </h2>
                <div className="border-t-4 border-dotted border-[#0e1b11] w-full mt-2"></div>
            </div>

            <div className="flex justify-center">
                <button
                    className="bg-[#17cf42] text-black py-2 px-4 rounded-xl font-bold mb-6 hover:bg-[#444c48] transition duration-300"
                    onClick={handleProfileClick}
                >
                    Register or View Profile
                </button>
            </div>

            {/* Services Section */}
            <div className="flex justify-center items-center h-full">
                <div className="bg-[#0e1b11] p-3 rounded-lg mb-6">
                    <h3 className="text-3xl font-semibold text-center text-white">
                        Our Services
                    </h3>
                </div>
            </div>
            <div className="flex justify-around items-center w-full">
                {/* Waste Collection by Companies (Left-ish) */}
                <div className="flex flex-col items-center">
                    <div className="h-40 w-40 bg-[#17cf42] rounded-full flex items-center justify-center shadow-lg">
                        <img
                            src="public/images/waste.jpg"
                            alt="Waste Collection"
                            className="h-30 w-30 object-cover rounded-full"
                        />
                    </div>
                    <span className="mt-2 text-[#0e1b11] font-semibold">
                        Waste Collection
                    </span>
                </div>

                {/* Recycling Service (Center) */}
                <div className="flex flex-col items-center">
                    <div className="h-40 w-40 bg-[#17cf42] rounded-full flex items-center justify-center shadow-lg">
                        <img
                            src="public/images/centers.jpg"
                            alt="Recycling Service"
                            className="h-30 w-30 object-cover rounded-full"
                        />
                    </div>
                    <span className="mt-2 text-[#0e1b11] font-semibold">
                        Recycling Centers
                    </span>
                </div>

                {/* Home Collection Recycling Service (Right-ish) */}
                <div className="flex flex-col items-center">
                    <div className="h-40 w-40 bg-[#17cf42] rounded-full flex items-center justify-center shadow-lg">
                        <img
                            src="public/images/homeRecycle.jpg"
                            alt="Home Collection"
                            className="h-30 w-30 object-cover rounded-full"
                        />
                    </div>
                    <span className="mt-2 text-[#0e1b11] font-semibold">
                        Home Collection
                    </span>
                </div>
            </div>
        </div>
    );

    const renderSignInPage = () => <SignIn />; // Render SignIn component
    const renderSignUpPage = () => <SignUp />; // Render SignUp component
    
    const renderProfileOptions = () => (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fcf9]">
            <h1 className="text-4xl font-bold text-[#0e1b11] mb-10">
                Register or View Profile
            </h1>

            <div className="flex space-x-6">
                <button
                    onClick={handleCompanyClick}
                    className="bg-[#0e1b11] text-white py-4 px-8 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
                >
                    Register Company Profile
                </button>

                <button
                    onClick={handleViewCompanyProfile} // Ensure this function is defined
                    className="bg-[#0e1b11] text-white py-4 px-8 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
                >
                    View Company Profile
                </button>

                <button
                    onClick={handleUserClick}
                    className="bg-[#0e1b11] text-white py-4 px-8 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
                >
                    Register User Profile
                </button>

                <button
                    onClick={handleViewUserProfile} // Ensure this function is defined
                    className="bg-[#0e1b11] text-white py-4 px-8 rounded-xl font-bold hover:bg-[#444c48] transition duration-300"
                >
                    View User Profile
                </button>
            </div>
        </div>
    );

    // Page rendering logic based on the current page
    return (
        <div>
            {currentPage === "home" && renderHomePage()}
            {currentPage === "sign-in" && renderSignInPage()}
            {currentPage === "user-registration" && renderSignUpPage()}
            {currentPage === "profile-options" && renderProfileOptions()}
            {currentPage === "company-registration" && <CompanyRegistration />} {/* Add this line to render Company Registration */}
            {currentPage === "user-profile" && <UserProfile />} {/* Add this line to render User Profile */}
            {currentPage === "company-profile" && <CompanyProfile />} {/* Add this line to render Company Profile */}
        </div>
    );
};

export default Page; // Export the main Page component
