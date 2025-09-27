"use client"
import {
  LayoutDashboard,
  Users,
  FileText,
  Database,
  File,
} from "lucide-react"
import { useState } from "react"

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  currentPage,
  setCurrentPage,
  isCollapsed = true,
  setIsCollapsed,
}) {
  // Keeping existing states (not strictly necessary for current behavior)
  const [isAdminManagementOpen, setIsAdminManagementOpen] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: currentPage === "Dashboard" },
    { 
      icon: Database, 
      label: "User Data", 
      active: currentPage === "User Data",
      onClick: () => setCurrentPage("User Data")
    },
    { 
      icon: FileText, 
      label: "Admin Management", 
      active: ["Manage Reels", "Pages", "Admin Management"].includes(currentPage),
      onClick: () => setCurrentPage("Admin Management")
    },
  ]

  return (
    <div
      className={`
        bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ease-in-out fixed top-0 left-0
        ${isSidebarOpen 
          ? "z-50 w-64 shadow-2xl translate-x-0" 
          : "-translate-x-full lg:translate-x-0 lg:w-16 z-40"
        }
        ${!isSidebarOpen && !isCollapsed && "lg:w-64 lg:shadow-2xl"}
      `}
      onMouseEnter={() => !isSidebarOpen && window.innerWidth >= 1024 && setIsCollapsed(false)}
      onMouseLeave={() => !isSidebarOpen && window.innerWidth >= 1024 && setIsCollapsed(true)}
    >
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between lg:justify-start lg:space-x-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#B65FCF] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-lg">A</span>
            </div>
            <div className={`transition-opacity duration-300 ${isCollapsed && !isSidebarOpen ? "opacity-0 hidden lg:opacity-0 lg:hidden" : "opacity-100 block"}`}>
              <h2 className="font-semibold text-gray-900">
                Admin Panel
              </h2>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={index}>
                {item.label === "Admin Management" && (
                  <>
                    <button
                      onClick={() => {
                        setIsAdminManagementOpen(!isAdminManagementOpen)
                        if (!isSidebarOpen && isCollapsed) {
                          setIsCollapsed(false)
                        }
                      }}
                      className={`flex items-center rounded-lg transition-colors duration-200 w-full ${
                        item.active ? "bg-[#B65FCF] text-white" : "text-gray-700 hover:bg-gray-100"
                      } ${isCollapsed && !isSidebarOpen ? "lg:px-0 lg:py-2 lg:justify-center px-3 py-2 space-x-3" : "px-3 py-2 space-x-3"}`}
                    >
                      <Icon size={20} className={`flex-shrink-0 ${isCollapsed && !isSidebarOpen ? "lg:mx-auto" : ""}`} />
                      <span className={`font-medium transition-opacity duration-300 whitespace-nowrap ${
                        isCollapsed && !isSidebarOpen ? "opacity-0 hidden lg:opacity-0 lg:hidden" : "opacity-100 block"
                      }`}>
                        {item.label}
                      </span>
                    </button>

                    {((!isCollapsed || isSidebarOpen) && isAdminManagementOpen) && (
                      <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-96 opacity-100">
                        <ul className="ml-8 mt-2 space-y-1">
                          <li>
                            <button
                              onClick={() => {
                                setCurrentPage("Manage Reels")
                                setIsSidebarOpen(false)
                              }}
                              className={`flex items-center justify-between w-full space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                                currentPage === "Manage Reels" ? "bg-[#B65FCF] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Database size={20} className="flex-shrink-0" />
                                <span className="font-medium">Reels</span>
                              </div>
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setCurrentPage("Pages")
                                setIsSidebarOpen(false)
                              }}
                              className={`flex items-center justify-between w-full space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                                currentPage === "Pages" ? "bg-[#B65FCF] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <File size={20} className="flex-shrink-0" />
                                <span className="font-medium">Pages</span>
                              </div>
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {item.label !== "User Management" && item.label !== "Admin Management" && (
                  <button
                    onClick={() => {
                      if (item.label === "Dashboard") {
                        setCurrentPage("Dashboard")
                      } else {
                        setCurrentPage(item.label)
                      }
                      setIsSidebarOpen(false)
                    }}
                    className={`flex items-center rounded-lg transition-colors duration-200 w-full ${
                      item.active ? "bg-[#B65FCF] text-white" : "text-gray-700 hover:bg-gray-100"
                    } ${isCollapsed && !isSidebarOpen ? "lg:px-0 lg:py-2 lg:justify-center px-3 py-2 space-x-3" : "px-3 py-2 space-x-3"}`}
                  >
                    <Icon size={20} className={`flex-shrink-0 ${isCollapsed && !isSidebarOpen ? "lg:mx-auto" : ""}`} />
                    <span className={`font-medium transition-opacity duration-300 whitespace-nowrap ${
                      isCollapsed && !isSidebarOpen ? "opacity-0 hidden lg:opacity-0 lg:hidden" : "opacity-100 block"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}