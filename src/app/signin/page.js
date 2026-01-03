"use client";
import React, { useEffect, useState } from "react";
import { setCookie } from "../../cookies/setCookie";
import { removeCookie } from "../../cookies/removeCookie";
import { getCookie } from "../../cookies/getCookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUserData as setReduxUserData } from "../../store/slices/userDataSlice";
import Alert from "../components/ui/Alert";

const SignIn = () => {
  const [alert, setAlert] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  const dispatch = useDispatch();
  const [accessToken, setAccessToken] = useState(getCookie("access_token"));
  const refreshToken = getCookie("refresh_token");
  const navigate = useRouter();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/users/signin", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();
      if (response.ok && responseData.success) {
        showAlert("success", responseData.message);
        setCookie("access_token", responseData.data.access_token, 2);
        setCookie("refresh_token", responseData.data.refresh_token, 2);
        if (responseData.data.role === "user") {
          navigate.push("/profiles/userProfile");
          dispatch(setReduxUserData({ ...responseData.data }));
        } else {
          navigate.push("/profiles/companyProfile");
          dispatch(setReduxUserData({ ...responseData.data }));
        }
      } else {
        showAlert("error", responseData.message || "Unknown error occurred.");
      }
    } catch (error) {
      showAlert("error", `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const logInWithAccessToken = async (access_token) => {
    try {
      const response = await fetch("/api/users/signin", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        method: "POST",
      });

      const responseData = await response.json();
      if (responseData.success) {
        showAlert("info", responseData.message);
        if (responseData.role === "user") {
          navigate.push("/profiles/userProfile");
        } else {
          navigate.push("/profiles/companyProfile");
        }
      } else {
        showAlert("info", responseData.message);
        removeCookie("access_token");
      }
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  const refreshAccessToken = async (refresh_token) => {
    try {
      const response = await fetch("/api/users/refresh_token", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refresh_token}`,
        },
        method: "GET",
      });

      const responseData = await response.json();
      if (responseData.success) {
        showAlert("info", responseData.message);
        setCookie("access_token", responseData.data.access_token, 2);
        setAccessToken(responseData.data.access_token);
      } else {
        showAlert("info", responseData.message);
        removeCookie("refresh_token");
      }
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const attemptAutoLogin = async () => {
      if (accessToken) {
        await logInWithAccessToken(accessToken);
      } else if (refreshToken) {
        await refreshAccessToken(refreshToken);
      }
    };

    if (isMounted) {
      attemptAutoLogin();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
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
            Making Cities<br />
            <span className="text-emerald-100">Cleaner & Greener</span>
          </h1>

          <p className="text-emerald-100 text-lg mb-10 max-w-md">
            Join thousands of users and companies working together for a sustainable future through smart waste management.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Track waste pickups in real-time" },
              { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", text: "Earn rewards for recycling" },
              { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", text: "Find recycling centers nearby" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path fill="white" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,73.1,42.1C64.8,55.1,53.8,66.5,40.5,73.3C27.2,80.1,11.6,82.3,-3.1,81.1C-17.8,79.9,-31.6,75.2,-44.4,68.2C-57.2,61.2,-69,51.9,-76.6,39.8C-84.2,27.7,-87.5,12.8,-87.1,-2C-86.7,-16.8,-82.6,-33.6,-73.9,-47.1C-65.2,-60.6,-51.9,-70.8,-37.5,-77.8C-23.1,-84.8,-7.6,-88.7,4.2,-95.5C16,-102.3,30.6,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">Enviro</span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Sign in to continue to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to Enviro?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              href="/signup"
              className="w-full h-12 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl transition-all duration-200 hover:bg-emerald-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Create an Account</span>
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By signing in, you agree to our{" "}
            <span className="text-emerald-600 hover:underline cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-emerald-600 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
