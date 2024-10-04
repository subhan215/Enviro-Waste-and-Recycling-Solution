"use client"; // Ensure the component is treated as a client component

import React, { useEffect, useState } from "react";
import { setCookie } from "../../cookies/setCookie";
import { removeCookie } from "../../cookies/removeCookie";
import { getCookie } from "../../cookies/getCookie";
import Link from "next/link";
//import { useRouter } from "next/navigation";

const SignIn = () => {
  const [accessToken, setAccessToken] = useState(getCookie("access_token"));
  let refreshToken = getCookie("refresh_token");
  //const router = useRouter(); // Use useRouter instead of useNavigate
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async () => {
    try {
      console.log("Sending data:", userData);
      let response = await fetch("/api/users/signin", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ ...userData }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        alert(responseData.message);
        console.log(responseData)
        setCookie("access_token", responseData.data.access_token , 2);
        setCookie("refresh_token", responseData.data.refresh_token , 2);
      } else {
        alert(responseData.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const logInWithAccessToken = async (access_token) => {
    try {
      let response = await fetch("/api/users/signin", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`, // Add a space after Bearer
        },
        method: "POST",
      });

      const responseData = await response.json();
      console.log(responseData)
      if (responseData.success) {
        alert(responseData.message);
      } else {
        alert(responseData.message);
        removeCookie("access_token");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const refreshAccessToken = async (refresh_token) => {
    try {
      let response = await fetch("/api/users/refresh_token", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refresh_token}`, // Add a space after Bearer
        },
        method: "GET",
      });

      const responseData = await response.json();
      if (responseData.success) {
        alert(responseData.message);
        setCookie("access_token", responseData.data.access_token , 2);
        setAccessToken(responseData.data.access_token , 2);
      } else {
        alert(responseData.message);
        removeCookie("refresh_token");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // If an access token exists, log in with it
  useEffect(() => {
    console.log(accessToken)
    if (accessToken) {
      logInWithAccessToken(accessToken);
    }
  }, [accessToken]); 

  // If no access token but there's a refresh token, refresh the access token
  useEffect(() => {
    if (!accessToken && refreshToken) {
      refreshAccessToken(refreshToken);
    }
  }, [refreshToken]); 
  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#f8fcf9] group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}
    >
      {/* Navbar (not centered) */}
     
        {/* Main content - centered */}
        <div className="flex justify-center items-center flex-1">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px]">
            <h3 className="text-[#0e1b11] tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
              Welcome to Enviro
            </h3>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                
                <input
                  placeholder="Enter your email"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1b11] focus:outline-0 focus:ring-0 border-none bg-[#e7f3ea] focus:border-none h-14 placeholder:text-[#4e975f] p-4 text-base font-normal leading-normal"
                  onChange={(e) => setUserData({...userData , email: e.target.value})}
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
               
                <input
                  placeholder="Enter your password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1b11] focus:outline-0 focus:ring-0 border-none bg-[#e7f3ea] focus:border-none h-14 placeholder:text-[#4e975f] p-4 text-base font-normal leading-normal"
                  onChange={(e) => setUserData({...userData , password: e.target.value})}/>
              </label>
            </div>
            <p className="text-[#4e975f] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline">Forgot password?</p>
            <div className="flex px-4 py-3">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#17cf42] text-[#0e1b11] text-sm font-bold leading-normal tracking-[0.015em]" 
                 onClick={handleSignIn}>
                <span className="truncate">Login</span>
              </button>
            </div>
            <p className="text-[#4e975f] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Don't have an account? <Link href="/signup">Create one</Link>
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

export default SignIn;
