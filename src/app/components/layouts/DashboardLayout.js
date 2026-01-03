"use client";
import { useState } from "react";

export function DashboardLayout({ children, sidebar, title, logo }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-30 left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex items-center justify-center rounded-r-xl shadow-lg md:hidden transition-all duration-300 hover:w-14 ${
          isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`absolute top-0 left-0 h-full bg-white shadow-xl border-r border-gray-100 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 z-40 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "md:w-20" : "w-72"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className={`flex items-center gap-3 ${isCollapsed ? "md:justify-center md:w-full" : ""}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              {logo || (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
            {!isCollapsed && (
              <div className="md:block">
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Collapse Button - Desktop Only */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            {/* Close Button - Mobile Only */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className={`space-y-1 ${isCollapsed ? "md:items-center" : ""}`}>
            {sidebar}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-gray-100 ${isCollapsed ? "md:p-2" : ""}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? "md:justify-center" : ""}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex-1 md:block">
                <p className="text-sm font-medium text-gray-800">Administrator</p>
                <p className="text-xs text-gray-500">System Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

export function SidebarItem({ icon, label, active, onClick, badge, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer w-full text-left relative ${
        active
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${collapsed ? "md:justify-center md:px-2" : ""}`}
    >
      {icon && (
        <span className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>
          {icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="text-sm font-medium flex-1">{label}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              active ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
      {/* Active Indicator */}
      {active && !collapsed && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
      )}
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="hidden md:group-hover:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </button>
  );
}

export function SidebarSection({ title, children, collapsed }) {
  return (
    <div className="mb-4">
      {!collapsed && title && (
        <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {collapsed && <div className="h-px bg-gray-200 mx-2 mb-2" />}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 px-4 md:px-6 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
          {subtitle && (
            <p className="text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
