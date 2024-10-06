"use client"; // Ensure the component is treated as a client component

import React, { useState } from "react";
import { setCookie } from "../../cookies/setCookie";
import Link from "next/link"; // Correct import statement for Link

const SignUp = () => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError(""); // Reset error
    if (userData.password !== userData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/users/signup", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ email: userData.email, password: userData.password }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        alert(responseData.message);
        // Optionally log in the user or redirect
        setCookie("access_token", responseData.data.access_token, 2);
        setCookie("refresh_token", responseData.data.refresh_token, 2);
      } else {
        alert(responseData.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#f8fcf9] group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex justify-center items-center flex-1">
        <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px]">
          <h3 className="text-[#0e1b11] tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
            Create an Account
          </h3>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1b11] focus:outline-0 focus:ring-0 border-none bg-[#e7f3ea] focus:border-none h-14 placeholder:text-[#4e975f] p-4 text-base font-normal leading-normal"
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
            </label>
          </div>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                type="password"
                placeholder="Enter your password"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1b11] focus:outline-0 focus:ring-0 border-none bg-[#e7f3ea] focus:border-none h-14 placeholder:text-[#4e975f] p-4 text-base font-normal leading-normal"
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              />
            </label>
          </div>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                type="password"
                placeholder="Confirm your password"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1b11] focus:outline-0 focus:ring-0 border-none bg-[#e7f3ea] focus:border-none h-14 placeholder:text-[#4e975f] p-4 text-base font-normal leading-normal"
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
              />
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex px-4 py-3">
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#17cf42] text-[#0e1b11] text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={handleSignUp}
            >
              <span className="truncate">Sign Up</span>
            </button>
          </div>
          <p className="text-[#4e975f] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Already have an account? <Link href="/signin">Sign in</Link>
          </p>
          <p className="text-[#4e975f] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">Or continue with</p>
          <div className="flex px-4 py-3">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#e7f3ea] text-[#0e1b11] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]">
              <div className="text-[#0e1b11]" data-icon="GoogleLogo" data-size="20px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"></path>
                </svg>
              </div>
              <span className="truncate">Sign up with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; // Ensure this line is present
