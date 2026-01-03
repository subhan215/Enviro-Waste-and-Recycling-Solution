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
  }, []); // Run only once on mount

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

      <div className="flex justify-center items-center flex-1 px-4">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-card p-8">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-custom-green-light rounded-full mb-4">
                <svg className="w-8 h-8 text-custom-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Welcome to Enviro</h1>
              <p className="text-text-secondary mt-2">Sign in to your account</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-custom-green focus:ring-2 focus:ring-custom-green/20"
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                />
              </div>

              <button
                className="w-full h-12 bg-custom-green text-custom-black font-semibold rounded-lg transition-all duration-200 hover:bg-custom-green-dark focus:outline-none focus:ring-2 focus:ring-custom-green focus:ring-offset-2 shadow-button hover:shadow-md"
                onClick={handleSignIn}
              >
                Sign In
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-text-secondary mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-custom-green font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
