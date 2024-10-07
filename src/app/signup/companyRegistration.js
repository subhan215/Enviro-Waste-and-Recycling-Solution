"use client"; // Ensure the component is treated as a client component
import React, { useState } from "react";

const CompanyRegistrationForm = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        services: [],
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (data.password === data.confirmPassword) {
            try {
                console.log("Sending data:", data);
                let response = await fetch("api/company/signup", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({ ...data }),
                });

                const responseData = await response.json();
                if (responseData.success) {  
                    alert("Account has been created");
                } else {
                    alert(responseData.message);
                }
            } catch (error) {
                alert(error.message);
            }
        } else {
            alert("Passwords don't match!");
        }
    };

    return (
        <div className="flex justify-center items-center flex-1">
            <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5">
                <h2 className="text-[#0e1b11] text-2xl font-bold text-center mb-4">Register Company</h2>
                <form onSubmit={handleSubmit} className="flex flex-col px-4">
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="text"
                            name="companyName"
                            placeholder="Company Name"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                            required
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                            required
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="password"
                            placeholder="Enter your password"
                            name="password"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            required
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="password"
                            placeholder="Confirm your password"
                            name="confirmPassword"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                            onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                            required
                        />
                    </label>
                    <label className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            name="services"
                            value="wasteCollection"
                            className="form-checkbox h-5 w-5 text-[#0e1b11] bg-[#e7f3ea] border-[#4e975f] rounded"
                            onChange={() => setData(prevData => ({
                                ...prevData,
                                services: [...prevData.services, "Waste Collection"]
                            }))}
                        />
                        <span className="text-[#0e1b11] text-base font-normal">Waste Collection</span>
                    </label>
                    <label className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            name="services"
                            value="recycling"
                            className="form-checkbox h-5 w-5 text-[#0e1b11] bg-[#e7f3ea] border-[#4e975f] rounded"
                            onChange={() => setData(prevData => ({
                                ...prevData,
                                services: [...prevData.services, "Recycling"]
                            }))}
                        />
                        <span className="text-[#0e1b11] text-base font-normal">Recycling</span>
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                            required
                            onChange={(e) => setData({ ...data, phone: e.target.value })}
                        />
                    </label>
                    <button
                        type="submit"
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#17cf42] text-[#0e1b11] text-sm font-bold leading-normal"
                    >
                        Register Company
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompanyRegistrationForm;
