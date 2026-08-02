// src/components/Header.jsx
import React from "react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  Search,
  ChevronDown,
  LogOut
} from "lucide-react";
export default function Header({ mobileOpen, setMobileOpen,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const pageTitles = {
    "/admin": "Dashboard",
    "/admin/leads": "Leads",
    "/counsellor/converted": "Students",
    "/admin/brands": "Brands",
    "/admin/courses": "Courses",
    "/admin/counsellors": "Counsellors",
    "/admin/reports": "Reports",
    "/admin/settings": "Settings",
    "/counsellor": "Dashboard",
    "/counsellor/leads": "My Leads",
    "/counsellor/import": "Import Leads",
  };

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu size={20} />
        </button>
        <div className="page-title">
          {pageTitle}
        </div>
      </div>
      <div className="topbar-center">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={`Search ${pageTitle.toLowerCase()}...`}
          />
        </div>
      </div>
      <div className="topbar-right">

        <div
          className={`profile ${open ? "open" : ""}`}
          ref={dropdownRef}
        >

          <button
            className="profile-trigger"
            onClick={() => setOpen(!open)}
          >
            <div className="profile-avatar">
              {user?.name?.charAt(0)}
            </div>

            <div className="profile-info">
              <strong>{user?.name}</strong>
              <span>
                {user?.role === "admin"
                  ? "Administrator"
                  : "Counsellor"}
              </span>
            </div>

            <ChevronDown size={16} />
          </button>

          {open && (

            <div className="profile-dropdown">

              <div className="dropdown-header">

                <div className="profile-avatar">
                  {user?.name?.charAt(0)}
                </div>

                <div className="profile-info">
                  <strong>{user?.name}</strong>
                  <span>
                    {user?.role === "admin"
                      ? "Administrator"
                      : "Counsellor"}
                  </span>
                </div>

              </div>

              <button
                className="dropdown-item logout"
                onClick={logout}
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>

          )}

        </div>

      </div>
    </header>
  );
}
