"use client"; // Ensure the component is treated as a client component
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const UserRegistration = () => {
    const router = useRouter(); // Initialize the router
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        gender: "",
        mobile: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (data.password === data.confirmPassword) {
            try {
                const response = await fetch("api/users/signup", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({ ...data }),
                });
                const responseData = await response.json();
                if (responseData.success) {
                    alert("Account has been created");
                    router.push("/"); // Redirect to home page after successful registration
                } else {
                    alert(responseData.message); // Show error message if registration fails
                }
            } catch (error) {
                alert(error.message); // Show error message if fetch fails
            }
        } else {
            alert("Passwords don't match!"); // Show error if passwords do not match
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-[#f8fcf9] overflow-x-hidden" style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}>
            <div className="flex justify-center items-center flex-1">
                <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5">
                    <h2 className="text-[#0e1b11] text-2xl font-bold text-center mb-4">Register as Individual</h2>
                    <form onSubmit={handleSignUp} className="flex flex-col px-4">
                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                required
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                onChange={handleInputChange}
                            />
                        </label>
                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                required
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                onChange={handleInputChange}
                            />
                        </label>
                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                onChange={handleInputChange}
                            />
                        </label>
                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                required
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                onChange={handleInputChange}
                            />
                        </label>
                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="tel"
                                name="mobile"
                                placeholder="Mobile Number"
                                required
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                onChange={handleInputChange}
                            />
                        </label>
                        <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <input
                                type="number"
                                name="age"
                                placeholder="Age"
                                required
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                onChange={handleInputChange}
                            />
                        </label>
                        <select
                            name="gender"
                            required
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                            onChange={handleInputChange}
                        >
                            <option value="" disabled selected>Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <button
                            type="submit"
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#17cf42] text-[#0e1b11] text-sm font-bold leading-normal mt-4"
                        >
                            Register User
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserRegistration;
