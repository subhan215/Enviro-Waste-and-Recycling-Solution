import React, { useState, useEffect, useCallback } from "react";
import Notifications from "./Notifications";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { removeCookie } from "@/cookies/removeCookie";
import { setUserData } from "@/store/slices/userDataSlice";

// SVG Icons
const Icons = {
  Leaf: () => (
    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  SignOut: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Services: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Contact: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

const ModernNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userData = useSelector((state) => state.userData.value) || null;
  const dispatch = useDispatch();

  const turnNotificationsToOff = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setIsOpen(false);
      setIsLargeScreen(true);
    } else {
      setIsLargeScreen(false);
    }
  };

  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll);
      handleResize();
      handleScroll();

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleSignOut = async () => {
    removeCookie("access_token");
    removeCookie("refresh_token");
    dispatch(setUserData({}));
    router.push("/signin");
  };

  const handleProfileRedirect = () => {
    if (userData?.role === "user") {
      router.push("/profiles/userProfile");
    } else if (userData?.role === "company") {
      router.push("/profiles/companyProfile");
    }
  };

  const navLinks = [
    { label: "Home", href: "/", icon: <Icons.Home /> },
    { label: "About Us", href: "/about", icon: <Icons.Info /> },
    { label: "Services", href: "/discover", icon: <Icons.Services /> },
    { label: "Contact", href: "#contact", icon: <Icons.Contact /> },
  ];

  const isActive = (href) => pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
          : "bg-white shadow-sm border-b border-gray-100"
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold text-gray-800">Enviro</h2>
              <p className="text-xs text-gray-500 -mt-1">Waste Solutions</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => router.push(link.href)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {userData?.user_id && pathname !== "/admin" ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors relative"
                    title="Notifications"
                  >
                    <Icons.Bell />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2">
                      <Notifications turnNotificationsToOff={turnNotificationsToOff} />
                    </div>
                  )}
                </div>

                {/* Chat */}
                <button
                  onClick={() => router.push("/chat")}
                  className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title="Chat"
                >
                  <Icons.Chat />
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                {/* Profile */}
                <button
                  onClick={handleProfileRedirect}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title="Profile"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <Icons.User />
                  </div>
                  <span className="text-sm font-medium hidden lg:block">Profile</span>
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-red-300"
                  title="Sign Out"
                >
                  <Icons.SignOut />
                  <span className="hidden lg:block">Sign Out</span>
                </button>
              </>
            ) : pathname !== "/admin" ? (
              <button
                onClick={() => router.push("/signin")}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
              >
                <Icons.User />
                <span>Sign In</span>
              </button>
            ) : null}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            {userData?.user_id && pathname !== "/admin" && (
              <>
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors relative"
                  title="Notifications"
                >
                  <Icons.Bell />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={() => router.push("/chat")}
                  className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Chat"
                >
                  <Icons.Chat />
                </button>
              </>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Icons.Menu />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Enviro</h2>
              <p className="text-xs text-gray-500">Waste Solutions</p>
            </div>
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close Navigation"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex flex-col p-4">
          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  router.push(link.href);
                  toggleMenu();
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className={isActive(link.href) ? "text-white" : "text-gray-400"}>
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-4"></div>

          {/* User Actions */}
          {userData?.user_id && pathname !== "/admin" ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleProfileRedirect();
                  toggleMenu();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Icons.User />
                </div>
                <span className="font-medium">My Profile</span>
              </button>
              <button
                onClick={() => {
                  handleSignOut();
                  toggleMenu();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200 transition-all"
              >
                <Icons.SignOut />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          ) : pathname !== "/admin" ? (
            <button
              onClick={() => {
                router.push("/signin");
                toggleMenu();
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-200 transition-all"
            >
              <Icons.User />
              <span>Sign In</span>
            </button>
          ) : null}
        </div>

        {/* Mobile Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Enviro Waste & Recycling Solutions
          </p>
        </div>
      </div>

      {/* Mobile Notifications */}
      {showNotifications && !isLargeScreen && (
        <div className="absolute top-20 right-4 z-50">
          <Notifications turnNotificationsToOff={turnNotificationsToOff} />
        </div>
      )}
    </header>
  );
};

export default ModernNavbar;
