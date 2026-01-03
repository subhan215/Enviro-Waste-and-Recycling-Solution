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
        waste_collection: false,
        manhole_management: false,
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
        <div className="relative flex flex-col bg-surface-secondary overflow-x-hidden min-h-screen">
            {alert.map((alert) => (
                <Alert
                    key={alert.id}
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert((alerts) => alerts.filter((a) => a.id !== alert.id))}
                />
            ))}

            <div className="flex-1 flex justify-center items-start py-8">
                <div className="w-full max-w-md px-4">
                    <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-text-primary text-center mb-6">Company Registration</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Company Name */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Enter company name"
                                    className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                    required
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                    required
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                    required
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                    required
                                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                />
                            </div>

                            {/* Services Section */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-3">Select Services</label>
                                <div className="space-y-3">
                                    {/* Waste Collection */}
                                    <label className="flex items-center gap-3 p-3 bg-custom-green-light/50 rounded-lg cursor-pointer hover:bg-custom-green-light transition-colors">
                                        <input
                                            type="checkbox"
                                            name="waste_collection"
                                            checked={selectedServices.waste_collection}
                                            onChange={handleCheckboxChange}
                                            className="w-5 h-5 rounded border-border text-custom-green focus:ring-custom-green"
                                        />
                                        <span className="text-sm text-text-primary">Waste Collection</span>
                                    </label>

                                    {/* Manhole Management */}
                                    <label className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="manhole_management"
                                            checked={selectedServices.manhole_management}
                                            onChange={handleCheckboxChange}
                                            className="w-5 h-5 rounded border-border text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-text-primary">Manhole Cover Maintenance & Repair</span>
                                    </label>

                                    {/* Recycling */}
                                    <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="recycling"
                                            checked={selectedServices.recycling}
                                            onChange={handleCheckboxChange}
                                            className="w-5 h-5 rounded border-border text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-text-primary">Recycling</span>
                                    </label>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                    required
                                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                                />
                            </div>

                            {/* Agreement */}
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="agreement"
                                    checked={agreementChecked}
                                    onChange={() => setAgreementChecked(!agreementChecked)}
                                    className="w-5 h-5 mt-0.5 rounded border-border text-custom-green focus:ring-custom-green"
                                    required
                                />
                                <span className="text-sm text-text-secondary">
                                    I agree to the terms and conditions of Enviro Waste Solutions.
                                </span>
                            </label>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full h-12 bg-custom-green text-custom-black font-semibold rounded-lg transition-all duration-200 hover:bg-custom-green-dark focus:outline-none focus:ring-2 focus:ring-custom-green focus:ring-offset-2 shadow-button hover:shadow-md"
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
        <div className="relative flex min-h-screen flex-col bg-surface-secondary overflow-x-hidden">
            {alert.map((alert) => (
                <Alert
                    key={alert.id}
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert((alerts) => alerts.filter((a) => a.id !== alert.id))}
                />
            ))}

            <div className="flex justify-center items-start flex-1 py-8">
                <div className="w-full max-w-md px-4">
                    {/* Toggle Buttons */}
                    <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 mb-6">
                        <h1 className="text-xl font-bold text-text-primary text-center mb-6">Create Account</h1>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedOption("individual")}
                                className={`flex-1 h-12 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    selectedOption === "individual"
                                        ? "bg-custom-green text-custom-black"
                                        : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                                }`}
                            >
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedOption("company")}
                                className={`flex-1 h-12 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    selectedOption === "company"
                                        ? "bg-custom-green text-custom-black"
                                        : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                                }`}
                            >
                                Company
                            </button>
                        </div>
                    </div>

                    {/* Individual Registration Form */}
                    {selectedOption === "individual" && (
                        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
                            <h2 className="text-lg font-semibold text-text-primary mb-6">Personal Information</h2>
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                        required
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                        required
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                            required
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm"
                                            className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                            required
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-1.5">Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            placeholder="Age"
                                            className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                            required
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-1.5">Gender</label>
                                        <div className="relative">
                                            <select
                                                name="gender"
                                                className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20 appearance-none cursor-pointer"
                                                required
                                                onChange={handleInputChange}
                                                value={data.gender}
                                            >
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1.5">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        placeholder="Enter mobile number"
                                        className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                                        required
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1.5">Area</label>
                                    <div className="relative">
                                        <select
                                            id="area"
                                            value={data.area_id}
                                            onChange={(e) => setData({ ...data, area_id: e.target.value })}
                                            className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20 appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Area</option>
                                            {allAreas?.length > 0 ? (
                                                allAreas.map((area) => (
                                                    <option key={area.area_id} value={area.area_id}>
                                                        {area.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">No areas available</option>
                                            )}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-12 bg-custom-green text-custom-black font-semibold rounded-lg transition-all duration-200 hover:bg-custom-green-dark focus:outline-none focus:ring-2 focus:ring-custom-green focus:ring-offset-2 shadow-button hover:shadow-md"
                                >
                                    Sign Up
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Company Registration Form */}
                    {selectedOption === "company" && <CompanyRegistrationForm />}
                </div>
            </div>
        </div>


    );
};

export default SignUp;