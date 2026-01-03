"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "../components/ui/Alert";

// Icons Component
const Icons = {
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Email: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Location: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Recycle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Manhole: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

// Company Registration Form Component
const CompanyRegistrationForm = ({ showAlert }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    services: [],
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [selectedServices, setSelectedServices] = useState({
    waste_collection: false,
    manhole_management: false,
    recycling: false,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSelectedServices((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
    setData((prevState) => {
      const updatedServices = checked
        ? [...prevState.services, name]
        : prevState.services.filter((service) => service !== name);
      return {
        ...prevState,
        services: updatedServices,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreementChecked) {
      showAlert("warning", "You must agree to the terms and conditions to register.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      showAlert("warning", "Passwords don&apos;t match!");
      return;
    }

    setIsLoading(true);
    try {
      let response = await fetch("api/company/signup", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ ...data, agreementChecked }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        showAlert("success", "Account has been created!");
        router.push("/signin");
      } else {
        showAlert("error", responseData.message);
      }
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    {
      id: "waste_collection",
      name: "Waste Collection",
      description: "Door-to-door waste pickup services",
      icon: <Icons.Trash />,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      activeColor: "bg-emerald-100 border-emerald-500",
      iconColor: "text-emerald-600",
    },
    {
      id: "manhole_management",
      name: "Manhole Management",
      description: "Cover maintenance & repair",
      icon: <Icons.Manhole />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      activeColor: "bg-orange-100 border-orange-500",
      iconColor: "text-orange-600",
    },
    {
      id: "recycling",
      name: "Recycling Services",
      description: "Material recycling & processing",
      icon: <Icons.Recycle />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      activeColor: "bg-blue-100 border-blue-500",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.Building />
          </div>
          <input
            type="text"
            placeholder="Enter company name"
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.Email />
          </div>
          <input
            type="email"
            placeholder="company@example.com"
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Icons.Lock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              required
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm"
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              required
              onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Show Password Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-gray-600">Show passwords</span>
      </label>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Services</label>
        <div className="space-y-3">
          {services.map((service) => (
            <label
              key={service.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedServices[service.id]
                  ? service.activeColor
                  : `${service.bgColor} ${service.borderColor} hover:border-gray-300`
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.iconColor} bg-white shadow-sm`}>
                {service.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{service.name}</p>
                <p className="text-sm text-gray-500">{service.description}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedServices[service.id]
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {selectedServices[service.id] && <Icons.Check />}
              </div>
              <input
                type="checkbox"
                name={service.id}
                checked={selectedServices[service.id]}
                onChange={handleCheckboxChange}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.Phone />
          </div>
          <input
            type="tel"
            placeholder="03XX-XXXXXXX"
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={(e) => setData({ ...data, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-200">
        <input
          type="checkbox"
          checked={agreementChecked}
          onChange={() => setAgreementChecked(!agreementChecked)}
          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-gray-600">
          I agree to the <span className="text-emerald-600 font-medium">Terms and Conditions</span> and{" "}
          <span className="text-emerald-600 font-medium">Service Agreement</span> of Enviro Waste Solutions.
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:from-emerald-700 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>Register Company</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
};

// Individual Registration Form Component
const IndividualRegistrationForm = ({ showAlert, allAreas }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    mobile: "",
    area_id: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      showAlert("warning", "Passwords don&apos;t match!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("api/users/signup", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ ...data }),
      });
      const responseData = await response.json();
      if (responseData.success) {
        showAlert("success", "Account has been created!");
        router.push("/signin");
      } else {
        showAlert("error", responseData.message);
      }
    } catch (error) {
      showAlert("error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.User />
          </div>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.Email />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Icons.Lock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              required
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm"
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Show Password Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-gray-600">Show passwords</span>
      </label>

      {/* Age and Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            name="age"
            placeholder="Your age"
            min="13"
            max="120"
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="relative">
            <select
              name="gender"
              value={data.gender}
              onChange={handleInputChange}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <Icons.ChevronDown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.Phone />
          </div>
          <input
            type="tel"
            name="mobile"
            placeholder="03XX-XXXXXXX"
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            required
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Area</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icons.Location />
          </div>
          <select
            value={data.area_id}
            onChange={(e) => setData({ ...data, area_id: e.target.value })}
            className="w-full h-12 pl-12 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer"
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
              <option value="" disabled>Loading areas...</option>
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <Icons.ChevronDown />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:from-emerald-700 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
};

// Main SignUp Component
const SignUp = () => {
  const [alert, setAlert] = useState([]);
  const [selectedOption, setSelectedOption] = useState("individual");
  const [allAreas, setAllAreas] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((a) => a.id !== id));
    }, 4000);
  };

  const getAllAreas = async () => {
    try {
      const response = await fetch("api/area/get_all_areas");
      const responseData = await response.json();
      if (responseData.success) {
        setAllAreas(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  useEffect(() => {
    getAllAreas();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Alerts */}
      {alert.map((a) => (
        <Alert
          key={a.id}
          type={a.type}
          message={a.message}
          onClose={() => setAlert((alerts) => alerts.filter((al) => al.id !== a.id))}
        />
      ))}

      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Enviro</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Join the Green<br />
            <span className="text-emerald-100">Revolution Today</span>
          </h1>

          <p className="text-emerald-100 text-lg mb-10 max-w-md">
            Create your account and start making a difference. Whether you are an individual or a company, we have the right solution for you.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "200+", label: "Partner Companies" },
              { value: "1M+", label: "Pickups Completed" },
              { value: "500T", label: "Waste Recycled" },
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-emerald-100 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Circle */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 border-[40px] border-white/10 rounded-full"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-start justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">Enviro</span>
          </div>

          {/* Account Type Toggle */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Create Your Account</h2>
            <p className="text-gray-500 text-center text-sm mb-6">Choose your account type to get started</p>

            <div className="flex gap-3 p-1.5 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedOption("individual")}
                className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  selectedOption === "individual"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icons.User />
                <span>Individual</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOption("company")}
                className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  selectedOption === "company"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icons.Building />
                <span>Company</span>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedOption === "individual"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-blue-100 text-blue-600"
              }`}>
                {selectedOption === "individual" ? <Icons.User /> : <Icons.Building />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedOption === "individual" ? "Personal Information" : "Company Information"}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedOption === "individual"
                    ? "Fill in your details to create your account"
                    : "Register your waste management company"}
                </p>
              </div>
            </div>

            {selectedOption === "individual" ? (
              <IndividualRegistrationForm showAlert={showAlert} allAreas={allAreas} />
            ) : (
              <CompanyRegistrationForm showAlert={showAlert} />
            )}
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-emerald-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account, you agree to our{" "}
            <span className="text-emerald-600 hover:underline cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-emerald-600 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
