import React, { useState, useEffect, useCallback } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaComments, FaUser, FaSignOutAlt } from "react-icons/fa";
import Notifications from "./Notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter  , usePathname} from "next/navigation";
import { removeCookie } from "@/cookies/removeCookie";
import { setUserData } from "@/store/slices/userDataSlice";
import { Leaf } from "lucide-react" ; 
const ModernNavbar = () => {
  const pathname = usePathname() ; 
  const router = useRouter() ; 
  console.log(pathname)
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userData = useSelector((state) => state.userData.value) || null;
 
  const dispatch = useDispatch();

  const turnNotificationsToOff = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setIsOpen(false);
      setIsLargeScreen(true);
    } else {
      setIsLargeScreen(false);
    }
  };

  useEffect(() => {
    // Ensure this code only runs on the client side
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []); // Empty 

  const handleSignOut = async () => {
    removeCookie("access_token");
    removeCookie("refresh_token");
    dispatch(setUserData({}));
    router.push("/signin"); // Redirect to login
  };

  const handleProfileRedirect = () => {
    if (userData?.role === "user") {
      router.push("/profiles/userProfile");
    } else if (userData?.role === "company") {
      router.push("/profiles/companyProfile");
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 border-b border-black" style={{zIndex:10000}}>
      <nav className="container mx-auto flex justify-between items-center p-5">
        {/* Logo */}
        <div className="flex items-center gap-2">
            <Leaf className="text-[#00FF00] h-8 w-8" />
            <h2 className="text-3xl font-bold flex justify-center text-custom-black">Enviro</h2>
          </div>
        {/* Full Navbar for larger screens */}
        <div className="hidden md:flex gap-8 items-center">
          <a className="text-gray-700 hover:text-custom-green transition cursor-pointer" onClick={()=> router.push("/")}>
            Home
          </a>
          <a href="/about" className="text-gray-700 hover:text-custom-green transition cursor-pointer">
            About Us
          </a>
          <a href="#" className="text-gray-700 hover:text-custom-green transition cursor-pointer">
            Services
          </a>
          <a href="#" className="text-gray-700 hover:text-custom-green transition cursor-pointer">
            Contact
          </a>
          {userData.user_id && pathname !== '/admin' ? (
  <>
    <FontAwesomeIcon
      icon={faBell}
      size="lg"
      className="text-black hover:cursor-pointer"
      onClick={() => setShowNotifications((prev) => !prev)}
      title="View Notifications"
    />
    {showNotifications && (
      <Notifications turnNotificationsToOff={turnNotificationsToOff} />
    )}

    <FaComments
      size={24}
      className="text-black hover:cursor-pointer"
      title="Chat"
      onClick={() => router.push("/chat")}
    />

    {/* Profile and Sign Out Icons */}
    <div className="flex gap-4 items-center">
      <FaUser
        size={20}
        className="text-black hover:cursor-pointer"
        title="Profile"
        onClick={handleProfileRedirect}
      />
      <FaSignOutAlt
        size={20}
        className="text-custom-green hover:cursor-pointer"
        title="Sign Out"
        onClick={handleSignOut}
      />
    </div>
  </>
) : pathname !== '/admin' ? (
  <>
    <FaUser
      size={20}
      className="text-custom-green hover:cursor-pointer"
      title="Sign In"
      onClick={() => router.push("/signin")}
    />
  </>
) : null}

        </div>

        {/* Hamburger Menu for mobile screens */}
        <div className="md:hidden flex items-center">
          {userData.user_id && pathname!='/admin'&& (
            <FontAwesomeIcon
              icon={faBell}
              size="lg"
              className="text-black hover:cursor-pointer mr-4"
              onClick={() => setShowNotifications((prev) => !prev)}
              title="View Notifications"
            />
          )}
          {userData.user_id && pathname!='/admin' &&
          <FaComments
            size={24}
            className="text-black hover:cursor-pointer mr-4"
            title="Chat"
            onClick={() => router.push("/chat")}
          />
}
          <button onClick={toggleMenu} aria-label="Toggle Navigation">
            {!isOpen ? (
              <FiMenu className="text-3xl text-green-600" />
            ): null}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Sliding from the Left */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } duration-300 ease-in-out z-40`}
      >
       {/* Close button at the top right */}
  <button
    onClick={toggleMenu}
    aria-label="Close Navigation"
    className="absolute top-4 right-4 text-green-600 text-2xl"
  >
    <FiX />

  </button>

        <div className="flex flex-col p-5 gap-6">
          <a className="text-gray-700 text-lg hover:text-green-600 transition cursor-pointer" onClick={()=> router.push("/")}>
            Home
          </a>
          <a href="#" className="text-gray-700 text-lg hover:text-green-600 transition cursor-pointer">
            About Us
          </a>
          <a href="#" className="text-gray-700 text-lg hover:text-green-600 transition cursor-pointer">
            Services
          </a>
          <a href="#" className="text-gray-700 text-lg hover:text-green-600 transition cursor-pointer">
            Contact
          </a>
          {userData.user_id && pathname !== "/admin" ? (
  <>
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-4">
        <FaUser
          size={20}
          className="text-black hover:cursor-pointer"
          title="Profile"
          onClick={handleProfileRedirect}
        />
        <FaSignOutAlt
          size={20}
          className="text-custom-green hover:cursor-pointer"
          title="Sign Out"
          onClick={handleSignOut}
        />
      </div>
    </div>
  </>
) : pathname !== '/admin' ? (
  <button
    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
    onClick={() => router.push("/signin")}
  >
    Sign In
  </button>
) : null}

        </div>
      </div>

      {/* Notifications for mobile view */}
      {showNotifications && !isLargeScreen && (
        <div className="absolute top-16 right-4 w-64">
          <Notifications turnNotificationsToOff={turnNotificationsToOff} />
        </div>
      )}
    </header>
  );
};

export default ModernNavbar;
