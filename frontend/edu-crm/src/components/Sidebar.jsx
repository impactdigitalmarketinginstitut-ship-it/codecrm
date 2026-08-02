// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  Upload,
  GraduationCap,
  BookOpen,
  CalendarClock,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { user } = useAuth();
  const role = user?.role || "guest";

  const navigation = [
    {
      title: "MAIN",
      roles: ["admin"],
      items: [
        {
          to: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          to: "/admin/leads",
          label: "Leads",
          icon: Users,
        },
        {
          to: "/counsellor/converted",
          label: "Students",
          icon: GraduationCap,
        },
        {
          to: "/admin/followups",
          label: "Follow Ups",
          icon: CalendarClock,
        },
      ],
    },

    {
      title: "MANAGEMENT",
      roles: ["admin"],
      items: [
        {
          to: "/admin/brands",
          label: "Brands",
          icon: Building2,
        },
        {
          to: "/admin/courses",
          label: "Courses",
          icon: BookOpen,
        },
        {
          to: "/admin/counsellors",
          label: "Counsellors",
          icon: UserRound,
        },
      ],
    },

    {
      title: "REPORTS",
      roles: ["admin"],
      items: [
        {
          to: "/admin/reports",
          label: "Reports",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "SYSTEM",
      roles: ["admin"],
      items: [
        {
          to: "/admin/settings",
          label: "Settings",
          icon: Settings,
        },
      ],
    },

    {
      title: "COUNSELLOR",
      roles: ["counsellor"],
      items: [
        {
          to: "/counsellor",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          to: "/counsellor/leads",
          label: "Leads",
          icon: Users,
        },
        {
          to: "/counsellor/import",
          label: "Import",
          icon: Upload,
        },
      ],
    },
  ];

  return (
    <aside
      className={`sidebar
    ${collapsed ? "collapsed" : ""}
    ${mobileOpen ? "mobile-open" : ""}
  `}
    >
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-logo">
            CZ
          </div>

          {!collapsed && (
            <div className="brand-info">
              <h2>CodeZen</h2>
              <span>Education CRM</span>
            </div>
          )}
        </div>

        <button
          className="collapse-btn"
          onClick={() => {
            const next = !collapsed;

            setCollapsed(next);

            localStorage.setItem(
              "sidebar_collapsed",
              next
            );
          }}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <nav className="sidebar-nav">

        {navigation.map((section) => {

          if (!section.roles.includes(role))
            return null;

          return (

            <div
              key={section.title}
              className="sidebar-section"
            >

              {!collapsed && (

                <div className="section-title">

                  {section.title}

                </div>

              )}

              {section.items.map(

                ({
                  to,
                  label,
                  icon: Icon,
                }) => (

                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => {
                      if (window.innerWidth <= 991) {
                        setMobileOpen(false);
                      }
                    }}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon
                      size={18}
                    />

                    {!collapsed && (

                      <span>

                        {label}

                      </span>

                    )}

                  </NavLink>

                )

              )}

            </div>

          );

        })}

      </nav>
      <div className="sidebar-bottom">

        <div className="sidebar-user">

          <div className="avatar">
            {user?.name?.charAt(0)}
          </div>

          {!collapsed && (
            <div className="user-meta">
              <strong>{user?.name}</strong>
              <span>
                {user?.role === "admin"
                  ? "Administrator"
                  : "Counsellor"}
              </span>
            </div>
          )}

        </div>

      </div>
    </aside>
  );
}
