"use client"; // Ensure the component is treated as a client component
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Company Registration Form Component
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
                if (response.success) {
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
        <div className="relative flex flex-col bg-[#f8fcf9] group/design-root overflow-x-hidden" style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}>
            <div className="layout-container flex h-full grow flex-col">
                {/* Main content - centered */}
                <div className="flex justify-center flex-1">
                    <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px]">
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
                                    onChange={(e) => setData({ ...data, services: [...data.services, "Waste Collection"] })}
                                />
                                <span className="text-[#0e1b11] text-base font-normal">Waste Collection</span>
                            </label>

                            <label className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    name="services"
                                    value="recycling"
                                    className="form-checkbox h-5 w-5 text-[#0e1b11] bg-[#e7f3ea] border-[#4e975f] rounded"
                                    onChange={(e) => setData({ ...data, services: [...data.services, "Recycling"] })}
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
            </div>
        </div>
    );
};

// SignUp Component with Individual and Company Registration
const SignUp = () => {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState("individual");
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        gender: "",
        mobile: "",
        area_id: ""
    });
    const [complaintDescription, setComplaintDescription] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleSignUp = async (e) => {
        console.log(data)
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
                console.log(responseData)
                if (responseData.success) {
                    alert("Account has been created");
                    router.push("/");
                }
                else {
                    alert(responseData.message)
                }

            } catch (error) {
                alert(error.message);
            }
        } else {
            alert("Passwords don't match!");
        }
    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };
    const [allAreas , setAllAreas] = useState([]) ; 
    const getAllAreas = async () => {
        try {
            const response = await fetch("api/area/get_all_areas")
            const responseData = await response.json();
            console.log(responseData)
            if (responseData.success) {
                alert(responseData.message);
                setAllAreas(responseData.data)
            }
            else {
                alert(responseData.message)
            }

        } catch (error) {
            alert(error.message);
        }
    }
    useEffect(()=> {
        getAllAreas() ;
        console.log(allAreas)
    } , [])
    return (
        <div className="relative flex min-h-screen flex-col bg-[#f8fcf9] overflow-x-hidden" style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}>

            <div className="flex justify-center items-center flex-1">
                <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5">
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <span className="text-[#0e1b11] text-base font-normal mb-1 text-center">Register as:</span>
                        <div className="flex justify-center space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    value="individual"
                                    checked={selectedOption === "individual"}
                                    onChange={handleOptionChange}
                                    className="hidden"
                                />
                                <div className={`flex items-center justify-center w-40 h-14 rounded-xl border-2 
                      ${selectedOption === "individual" ? "bg-[#17cf42] border-[#17cf42] text-white" : "bg-[#e7f3ea] border-[#0e1b11] text-[#0e1b11]"} 
                      hover:bg-[#17cf42] hover:text-white transition-colors duration-300`}>
                                    Individual
                                </div>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    value="company"
                                    checked={selectedOption === "company"}
                                    onChange={handleOptionChange}
                                    className="hidden"
                                />
                                <div className={`flex items-center justify-center w-40 h-14 rounded-xl border-2 
                      ${selectedOption === "company" ? "bg-[#17cf42] border-[#17cf42] text-white" : "bg-[#e7f3ea] border-[#0e1b11] text-[#0e1b11]"} 
                      hover:bg-[#17cf42] hover:text-white transition-colors duration-300`}>
                                    Company
                                </div>
                            </label>
                        </div>
                    </label>

                    {selectedOption === "individual" && (
                        <form onSubmit={handleSignUp} className="flex flex-col px-4">
                            {/* Individual Registration Fields */}
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Age"
                                    className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                            <select
                                name="gender"
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] text-base font-normal"
                                required
                                onChange={handleInputChange}
                                value={data.gender}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                </select>
                                <input
                                    type="text"
                                    name="gender"
                                    placeholder="Gender"
                                    className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="tel"
                                    name="mobile"
                                    placeholder="Mobile Number"
                                    className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#4e975f] text-base font-normal"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>

                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                            {/* Dropdown for selecting area */}
                            <select
                                id="area"
                                value={data.area_id}
                                onChange={(e) => setData({ ...data, area_id: e.target.value })}
                                className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] text-base font-normal"
                                required
                            >
                                <option value="" disabled selected>Select Area</option>
                                
                                {allAreas?.length > 0 ? (
                                    allAreas.map((area) => (
                                        <option key={area.area_id} value={area.area_id}>
                                            <span>{area.name}</span>
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No areas available</option>
                                )}
                            </select>
                        </label>
                            <button
                                type="submit"
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#17cf42] text-[#0e1b11] text-sm font-bold leading-normal"
                            >
                                Sign Up
                            </button>
                        </form>
                    )}

                    {selectedOption === "company" && <CompanyRegistrationForm />}
                </div>
            </div>
        </div>
    );
};

export default SignUp;