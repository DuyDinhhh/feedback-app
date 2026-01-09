import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function SidebarItem({ icon, label, to, active, onClick, asButton = false }) {
  const baseClass =
    "flex items-center px-4 py-3 cursor-pointer transition-colors select-none gap-3";
  const activeClass = "bg-[#d40724] text-white font-bold rounded-xl";
  const inactiveClass =
    "text-black hover:bg-[#ffded6] hover:text-red-500 font-bold rounded-xl";
  const content = (
    <>
      <span className="text-current">{icon}</span>
      <span>{label}</span>
    </>
  );

  if (asButton) {
    return (
      <button
        onClick={onClick}
        className={`${baseClass} w-full text-left ${
          active ? activeClass : inactiveClass
        }`}
        aria-expanded={active ? "true" : "false"}
      >
        {content}
        <svg
          className={`ml-auto w-4 h-4 transition-transform duration-200 ${
            active ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <polyline
            points="6 9 12 15 18 9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClass} ${active ? activeClass : inactiveClass}`}
    >
      {content}
    </Link>
  );
}

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const [isMonitoringOpen, setIsMonitoringOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isActive = (base) =>
    location.pathname.toLowerCase().startsWith(base.toLowerCase());

  useEffect(() => {
    // Auto-expand Monitoring if on related pages
    if (isActive("/logs") || isActive("/deployment_logs")) {
      setIsMonitoringOpen(true);
    }

    // Auto-expand Feedback if on related pages
    if (isActive("/feedbacks")) {
      setIsFeedbackOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen?.(false);
  }, [location.pathname, setMobileOpen]);

  const onKey = useCallback(
    (e) => {
      if (e.key === "Escape") setMobileOpen?.(false);
    },
    [setMobileOpen]
  );

  useEffect(() => {
    if (mobileOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onKey]);

  const Content = (
    <>
      <div className="p-4 border-b border-[#dbdee4]">
        <Link to="/" onClick={() => setMobileOpen?.(false)}>
          <h2 className="h-16 text-2xl font-bold text-[#d40724] flex items-center justify-center">
            Nam Trung
          </h2>
        </Link>
      </div>
      <nav className="flex-1 mx-4 py-4 flex flex-col gap-1">
        <div className="flex flex-col gap-2 rounded-full">
          <SidebarItem
            icon={<HomeIcon />}
            label="Trang chủ"
            to="/dashboards"
            active={isActive("/dashboards")}
          />

          <SidebarItem
            icon={<FileTextIcon />}
            label="Đánh giá"
            to="/feedbacks"
            active={isActive("/feedbacks")}
          />

          <SidebarItem
            icon={<StaffIcon />}
            label="Nhân viên"
            to="/staffs"
            active={isActive("/staffs")}
          />

          <SidebarItem
            icon={<ActivityIcon />}
            label="Giám sát"
            active={isMonitoringOpen}
            onClick={() => setIsMonitoringOpen((prev) => !prev)}
            asButton
          />

          {isMonitoringOpen && (
            <div className="ml-8 flex flex-col gap-1">
              <SidebarItem
                icon={
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                }
                label="Thao tác"
                to="/logs"
                active={isActive("/logs")}
              />
              <SidebarItem
                icon={
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                }
                label="Hệ thống"
                to="/deployment_logs"
                active={isActive("/deployment_logs")}
              />
            </div>
          )}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 bg-[#f7f8fc] border-r border-[#dbdee4] hidden md:flex flex-col">
        {Content}
      </aside>

      {/* Mobile off-canvas */}
      <div
        className={`md:hidden fixed inset-0 z-50 ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen?.(false)}
          aria-hidden="true"
        />
        {/* Drawer */}
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-[#f7f8fc] border-r border-[#dbdee4] transform transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
        >
          {Content}
        </aside>
      </div>
    </>
  );
}

export default Sidebar;
