"use client"; // Ensure the component is treated as a client component
import React, { useEffect, useState } from "react";
//import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "../components/ui/Alert";

// Company Registration Form Component
const CompanyRegistrationForm = () => {
    const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };
    const router = useRouter();
    const [data, setData] = useState({
        name: "",
        email: "",
        services: [],
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [agreementChecked, setAgreementChecked] = useState(false);
    const [selectedServices, setSelectedServices] = useState({
        wasteCollection: false,
        recycling: false
    });

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedServices((prevState) => ({
            ...prevState,
            [name]: checked
        }));
        setData((prevState) => {
            const updatedServices = checked
                ? [...prevState.services, name]  // Add service to array
                : prevState.services.filter(service => service !== name);  // Remove service from array

            return {
                ...prevState,
                services: updatedServices  // Update the services array in the state
            };
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreementChecked) {
            showAlert('warning' , 'You must agree to the terms and conditions to register.')
            return;
        }

        if (data.password === data.confirmPassword) {
            try {
                let response = await fetch("api/company/signup", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({ ...data, agreementChecked }),
                });

                const responseData = await response.json();
                if (responseData.success) {
                    showAlert('success' , 'Account has been created!')
                   
                    router.push("/signin");
                } else {
                    showAlert('info' , responseData.message)
                }
            } catch (error) {
                showAlert('error' , error.message)
               
            }
        } else {
            showAlert('warning' , "Passwords don't match!")
        }
    };

    return (
        <div
            className="relative flex flex-col bg-[#f8fcf9] group/design-root overflow-x-hidden"
            style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}
        >
            {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}    

            <div className="layout-container flex h-full grow flex-col">
                {/* Main content - centered */}
                <div className="flex justify-center flex-1">
                    <div className="layout-content-container flex flex-col w-full max-w-[512px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[512px] py-5">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col px-4"
                        >
                            {/* Company Name */}
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Company Name"
                                    className="form-input w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] font-normal text-xs sm:text-sm md:text-base"
                                    required
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                />
                            </label>

                            {/* Email */}
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className="form-input w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] font-normal text-xs sm:text-sm md:text-base"
                                    required
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                />
                            </label>

                            {/* Password */}
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="form-input w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] font-normal text-xs sm:text-sm md:text-base"
                                    required
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                />
                            </label>

                            {/* Confirm Password */}
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    className="form-input w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] font-normal text-xs sm:text-sm md:text-base"
                                    required
                                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                />
                            </label>

                            {/* Waste Collection */}
                            <label className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    name="wasteCollection"
                                    checked={selectedServices.wasteCollection}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox hidden"
                                />
                                <div className="relative flex items-center cursor-pointer">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 max-w-5 max-h-5 flex justify-center items-center border-2 border-[#4e975f] bg-[#e7f3ea] rounded-lg transition-all duration-300 ease-in-out hover:border-[#00ed64] focus:outline-none focus:ring-2 focus:ring-[#00ed64]">
                                        {selectedServices.wasteCollection && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#00ed64] absolute"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-2 text-[#0e1b11] font-normal text-xs sm:text-sm md:text-base">
                                        Waste Collection
                                    </span>
                                </div>
                            </label>

                            {/* Recycling */}
                            <label className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    name="recycling"
                                    checked={selectedServices.recycling}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox hidden"
                                />
                                <div className="relative flex items-center cursor-pointer">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 max-w-5 max-h-5 flex justify-center items-center border-2 border-[#4e975f] bg-[#e7f3ea] rounded-lg transition-all duration-300 ease-in-out hover:border-[#00ed64] focus:outline-none focus:ring-2 focus:ring-[#00ed64]">
                                        {selectedServices.recycling && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#00ed64] absolute"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-2 text-[#0e1b11] font-normal text-xs sm:text-sm md:text-base">
                                        Recycling
                                    </span>
                                </div>
                            </label>

                            {/* Phone Number */}
                            <label className="flex flex-col min-w-40 flex-1 mb-4">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    className="form-input w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] font-normal text-xs sm:text-sm md:text-base"
                                    required
                                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                                />
                            </label>

                            <label className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    name="agreement"
                                    checked={agreementChecked}
                                    onChange={()=> setAgreementChecked(!agreementChecked)}
                                    className="form-checkbox hidden"
                                    required
                                />
                                <div className="relative flex items-center cursor-pointer">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 max-w-5 max-h-5 flex justify-center items-center border-2 border-[#4e975f] bg-[#e7f3ea] rounded-lg transition-all duration-300 ease-in-out hover:border-[#00ed64] focus:outline-none focus:ring-2 focus:ring-[#00ed64]">
                                        {agreementChecked && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#00ed64] absolute"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-2 text-[#0e1b11] font-normal text-xs sm:text-sm md:text-base">
                                        I agree to the terms and conditions of Trash Solutions.
                                    </span>
                                </div>
                            </label>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="flex min-w-[100px] max-w-[450px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-8 py-4 flex-1 bg-gradient-to-r from-[#00ed64] to-[#00b84c] text-white font-bold leading-normal hover:scale-105 hover:from-[#00b84c] hover:to-[#00ed64] transition-all duration-300 ease-in-out text-xs sm:text-sm md:text-base shadow-lg hover:shadow-2xl"
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
    const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };
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
    // const [complaintDescription, setComplaintDescription] = useState("");

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
                    showAlert('success' , "Account has been created!")
                    router.push("/signin");
                }
                else {
                    showAlert('info' , responseData.message)
                }

            } catch (error) {
                showAlert('error' , error.message)
            }
        } else {
            showAlert('warning' , "Passwords don't match!")
        }
    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };
    const [allAreas, setAllAreas] = useState([]);
    const getAllAreas = async () => {
        try {
            const response = await fetch("api/area/get_all_areas")
            const responseData = await response.json();
            console.log(responseData)
            if (responseData.success) {
                showAlert('info' , responseData.message)
                setAllAreas(responseData.data)
            }
            else {
                showAlert('info' , responseData.message)
            }

        } catch (error) {
            showAlert('error' , error.message)
        }
    }
    useEffect(() => {
        getAllAreas();
        console.log(allAreas)
    }, [])
    return (
        <div className="relative flex min-h-screen flex-col bg-[#f8fcf9] overflow-x-hidden" style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}>
            {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}    

    <div className="flex justify-center items-center flex-1">
        <div className="layout-content-container flex flex-col w-[512px] max-w-[960px] py-5">
            <label className="flex flex-col min-w-40 flex-1 mb-4">
                <span className="text-[#0e1b11] text-base font-normal mb-1 text-center">Register as:</span>
                <div className="flex justify-center space-x-2 flex-wrap mt-4 md:mt-0">
                    <label className="flex items-center mb-4 hover:cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="individual"
                            checked={selectedOption === "individual"}
                            onChange={handleOptionChange}
                            className="hidden"
                        />
                        <div className={`flex items-center justify-center w-40 h-14 rounded-xl border-2 
                            ${selectedOption === "individual" ? "bg-gradient-to-r from-[#00ed64] to-[#00b84c] border-[#00ed64] text-white" : "bg-[#e7f3ea] border-[#0e1b11] text-[#0e1b11]"} 
                            hover:bg-gradient-to-r hover:from-[#00ed64] hover:to-[#00b84c] hover:text-white transition-all duration-300`}>
                            Individual
                        </div>
                    </label>
                    <label className="flex items-center mb-4 hover:cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="company"
                            checked={selectedOption === "company"}
                            onChange={handleOptionChange}
                            className="hidden"
                        />
                        <div className={`flex items-center justify-center w-40 h-14 rounded-xl border-2 
                            ${selectedOption === "company" ? "bg-gradient-to-r from-[#00ed64] to-[#00b84c] border-[#00ed64] text-white" : "bg-[#e7f3ea] border-[#0e1b11] text-[#0e1b11]"} 
                            hover:bg-gradient-to-r hover:from-[#00ed64] hover:to-[#00b84c] hover:text-white transition-all duration-300`}>
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
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] text-xs sm:text-sm md:text-base font-normal"
                            required
                            onChange={handleInputChange}
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] text-xs sm:text-sm md:text-base font-normal"
                            required
                            onChange={handleInputChange}
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] text-xs sm:text-sm md:text-base font-normal"
                            required
                            onChange={handleInputChange}
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] text-xs sm:text-sm md:text-base font-normal"
                            required
                            onChange={handleInputChange}
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="number"
                            name="age"
                            placeholder="Age"
                            className="form-input flex w-full rounded-xl text-[#0e1b11] h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] text-xs sm:text-sm md:text-base font-normal"
                            required
                            onChange={handleInputChange}
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <select
                            name="gender"
                            className="form-input flex w-full rounded-xl text-[#00ed64] h-14 p-4 border-none bg-[#e7f3ea] text-xs sm:text-sm md:text-base font-normal"
                            required
                            onChange={handleInputChange}
                            value={data.gender}
                        >
                            <option value="" className="text-custom-black">Select Gender</option>
                            <option value="male" className="text-custom-black">Male</option>
                            <option value="female" className="text-custom-black">Female</option>
                        </select>
                    </label>

                    <label className="flex flex-col min-w-40 flex-1 mb-4">
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile Number"
                            className="form-input flex w-full rounded-xl text-custom-black h-14 p-4 border-none bg-[#e7f3ea] placeholder:text-[#00ed64] text-xs sm:text-sm md:text-base font-normal"
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
                            className="form-input flex w-full rounded-xl text-[#00ed64] h-14 p-4 border-none bg-[#e7f3ea] text-xs sm:text-sm md:text-base"
                            required
                        >
                            <option value="" disabled selected>Select Area</option>
                            {allAreas?.length > 0 ? (
                                allAreas.map((area) => (
                                    <option key={area.area_id} value={area.area_id} className="text-custom-black">
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
                        className="flex w-full sm:w-full cursor-pointer items-center justify-center rounded-xl h-12 px-8 py-4 bg-gradient-to-r from-[#00ed64] to-[#00b84c] text-white font-bold leading-normal hover:scale-105 hover:from-[#00b84c] hover:to-[#00ed64] transition-all duration-300 ease-in-out text-xs sm:text-sm md:text-base shadow-lg hover:shadow-2xl"
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