import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "./logo.jpg";
import "./Styles.css";
import axios from "axios";
import { FaRegUser } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard, MdOutlineInventory2 } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import { FaListUl } from "react-icons/fa";
import profile from '../assets/d.png';

// Import charts/components for reports
import DemandForecastChart from "./DemandForecastChart";
// import InventoryReport from "./InventoryReport";   // 👈 add later if you have these
// import SalesReport from "./SalesReport";

function Reports() {
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userFirstName, setUserFirstName] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [selectedReport, setSelectedReport] = useState("Demand Report"); // 👈 dropdown state
  const [timeRange, setTimeRange] = useState("Monthly"); // 👈 new dropdown state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmployeeID = localStorage.getItem("employeeID");
        if (!storedEmployeeID) return;

        const response = await axios.get(`http://localhost:8000/api/users/${storedEmployeeID}`);

        if (response.data) {
          const fullName = `${response.data.firstname || ""} ${response.data.lastname || ""}`.trim();
          setUserFullName(fullName || "Unknown User");
          setEmployeeID(response.data.employee_id || storedEmployeeID);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);


    const fetchData = async () => {
    try {
      const employeeID = localStorage.getItem("employeeID");
      if (employeeID) {
        const userRes = await axios.get(`http://localhost:8000/api/users/${employeeID}`);
        if (userRes.data) {
          setUserFirstName(userRes.data.firstname || "");
          setUserFullName(`${userRes.data.firstname || ""} ${userRes.data.lastname || ""}`);
          setEmployeeID(userRes.data.employeeID || "");
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }
      useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div className={`dashboard-container ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "" : "collapsed"} ${overviewOpen ? "scrollable" : ""}`}>
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>
        <ul className="list-unstyled">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
              <MdOutlineDashboard /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventory" className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
              <MdOutlineInventory2 /> Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/sales-order" className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
              <BiPurchaseTag /> Sales Order
            </NavLink>
          </li>
          <li>
            <NavLink to="/purchase-order" className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
              <FaListUl /> Purchase Order
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
              <TbReportSearch /> Reports
            </NavLink>
          </li>
          <li>
            <NavLink to="/user-management" className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
              <FaRegUser /> Accounts
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}>
              <FaRegUser /> Customers
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="main-content">
<div className="topbar">
  <div className="topbar-left">
        <div className="profile-dropdown">
      <div
        className="profile-circle"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {userFullName
          ? userFullName.split(" ").map((n) => n[0]).join("").toUpperCase()
          : "U"}
      </div>
      <div className="profile-text">
        <strong className="fullname">{userFullName}</strong>
        <small className="employee">{employeeID}</small>
      </div>
    </div>
  </div>

  <div className="topbar-right">
          <select
            className="profile-select"
            onChange={(e) => {
              const value = e.target.value;
              if (value === "logout") {
                localStorage.clear();
                window.location.href = "/";
              } else if (value === "settings") {
                window.location.href = "/settings";
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              <strong>{userFirstName}</strong>
            </option>
            <option value="settings">Settings</option>
            <option value="logout">Logout</option>
          </select>
    </div>
</div>
          {/* Render Report Dynamically */}
                    {/* Dropdown for Reports */}
          <div className="report-selector mb-3">
            <select
              id="reportDropdown"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="custom-select w-auto d-inline-block"
            >
              <option value="Demand Report">Demand Report</option>
              <option value="Sales Report">Sales Report</option>
              <option value="Inventory Report">Inventory Report</option>
            </select>
          </div>

          <div className="topbar-grid-1col">
            <div className="demand-card">
              {selectedReport === "Demand Report" && <DemandForecastChart />}
              {selectedReport === "Sales Report" && <p>Sales Report goes here</p>}
              {selectedReport === "Inventory Report" && <p>Inventory Report goes here</p>}
            </div>
          </div>

        </div>
      </div>
  );
}

export default Reports;
