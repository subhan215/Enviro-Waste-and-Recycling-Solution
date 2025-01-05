"use client"; // Ensure the component is treated as a client component
import React, { useEffect, useState } from "react";
import { setCookie } from "../../cookies/setCookie";
import { removeCookie } from "../../cookies/removeCookie";
import { getCookie } from "../../cookies/getCookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {setUserData as setReduxUserData} from "../../store/slices/userDataSlice"
import Alert from "../components/ui/Alert";
const SignIn = () => {
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };
  const dispatch = useDispatch()
  const [accessToken, setAccessToken] = useState(getCookie("access_token"));
  const refreshToken = getCookie("refresh_token");
  const navigate = useRouter()
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async () => {
    try {
      const response = await fetch("/api/users/signin", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(userData),
      });
  
      const responseData = await response.json();
      if (response.ok && responseData.success) {
        showAlert('info', responseData.message);
        setCookie("access_token", responseData.data.access_token, 2);
        setCookie("refresh_token", responseData.data.refresh_token, 2);
        if(responseData.data.role === "user") {
          navigate.push('/profiles/userProfile');
          dispatch(setReduxUserData({...responseData.data}));
        } else {
          navigate.push('/profiles/companyProfile');
          dispatch(setReduxUserData({...responseData.data}));
        }
      } else {
        showAlert('info', responseData.message || 'Unknown error occurred.');
      }
    } catch (error) {
      showAlert('error', `Error: ${error.message}`);
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
      console.log(responseData)
      if (responseData.success) {
        showAlert('info' , responseData.message)
        if(responseData.role === "user") {
          navigate.push("/profiles/userProfile") ; 
        }
        else {
          navigate.push("/profiles/companyProfile")
        }
      } else {
        showAlert('info' , responseData.message)
        removeCookie("access_token");
      }
    } catch (error) {
      showAlert('error' , error.message)
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
        showAlert('info' , responseData.message)
        setCookie("access_token", responseData.data.access_token, 2);
        setAccessToken(responseData.data.access_token);
      } else {
        showAlert('info' , responseData.message)
        removeCookie("refresh_token");
      }
    } catch (error) {
      showAlert('error' , error.message)
    }
  };

  useEffect(() => {
    if (accessToken) {
      logInWithAccessToken(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken && refreshToken) {
      refreshAccessToken(refreshToken);
    }
  }, [refreshToken]);

  return (
<div className="relative flex min-h-screen flex-col bg-[#f8fcf9] group/design-root overflow-x-hidden" style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}>
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
      <h3 className="text-custom-black tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
        Welcome to Enviro
      </h3>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <input
            placeholder="Enter your email"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-custom-black focus:outline-0 focus:ring-0 border-none bg-[#e7f3ea] focus:border-none h-14 placeholder:text-[#00ed64] p-4 text-sm md:text-base font-normal leading-normal"
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <input
            placeholder="Enter your password"
            type="password"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-custom-black focus:outline-0 focus:ring-0 border-none bg-[#e7f3ea] focus:border-none h-14 placeholder:text-[#00ed64] p-4 text-sm md:text-base font-normal leading-normal"
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          />
        </label>
      </div>
     
      <div className="flex px-4 py-3">
        <button
        className="flex w-full sm:w-full cursor-pointer items-center justify-center rounded-xl h-12 px-8 py-4 bg-gradient-to-r from-[#00ed64] to-[#00b84c] text-white font-bold leading-normal hover:scale-105 hover:from-[#00b84c] hover:to-[#00ed64] transition-all duration-300 ease-in-out text-xs sm:text-sm md:text-base shadow-lg hover:shadow-2xl"
          onClick={handleSignIn}
        >
          <span className="truncate">Sign in</span>
        </button>
      </div>
      <p className="text-custom-black text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
        Don&apos;t have an account? <Link href="/signup">Create one</Link>
      </p>
    </div>
  </div>
</div>
  );
};

export default SignIn;
