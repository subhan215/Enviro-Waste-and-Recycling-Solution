"use client"; // Ensure the component is treated as a client component
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Main Page Component
const Page = () => {
    const [profilePic, setProfilePic] = useState("/images/default-profile.jpg"); // Default profile picture
    const router = useRouter(); // Use Next.js router for navigation

    const handleSignInClick = () => router.push("/signin"); // Push route to sign in
    const handleSignUpClick = () => router.push("/signup"); // Push route to sign up

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
           


            <div className="flex flex-col items-center justify-center py-8">
                <div className="border-t-4 border-dotted border-[#0e1b11] w-full mb-2"></div>
                <h2 className="text-4xl font-semibold mb-2 text-[#17cf42]">
                    Welcome to Enviro Solutions
                </h2>
                <div className="border-t-4 border-dotted border-[#0e1b11] w-full mt-2"></div>
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

    // Page rendering logic based on the current page
    return <div>{renderHomePage()}</div>;
};

export default Page; // Export the main Page component
