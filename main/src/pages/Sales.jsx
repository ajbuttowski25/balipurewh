import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import LineChartSales from "./LineChartSales";
import logo from "./logo.jpg";
import "./Styles.css";
import { FaRegUser } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";

function Sales() {
  // State hooks
  const [userName, setUserName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const location = useLocation();

  // Fetch username
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const employeeID = localStorage.getItem("employeeID");
        if (!employeeID) return;

        const response = await axios.get(
          `http://localhost:8000/api/users/${employeeID}`
        );

        if (response.data && response.data.name) {
          setUserName(response.data.name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserName();
  }, []);

  // Handle overview toggle on route change
  useEffect(() => {
    if (
      location.pathname.includes("/overview/sales") ||
      location.pathname.includes("/overview/demand")
    ) {
      setOverviewOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      <aside className={`sidebar ${isSidebarOpen ? "" : "collapsed"} ${overviewOpen ? "scrollable" : ""}`}>
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>
        <ul className="list-unstyled">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              <MdOutlineDashboard /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              <MdOutlineInventory2 /> Inventory
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/sales-order"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              <FaListUl /><BiPurchaseTag /> Sales Order
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/purchase-order"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              <FaListUl /> Purchase Order
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              <TbReportSearch /> Reports
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/user-management"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              <FaRegUser /> User Management
            </NavLink>
          </li>
          <li><NavLink to="/customers" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><FaRegUser /> Customers</NavLink></li>
          <li>
            <div
              className="nav-link"
              onClick={() => setOverviewOpen(!overviewOpen)}
              style={{ cursor: "pointer" }}
            >
              {isSidebarOpen
                ? `Overview ${overviewOpen ? "▲" : "▼"}`
                : "≡"}
            </div>
            {overviewOpen && isSidebarOpen && (
              <ul className="list-unstyled ps-3">
                <li>
                  <NavLink
                    to="/overview/sales"
                    className={({ isActive }) =>
                      isActive ? "nav-link active-link" : "nav-link"
                    }
                  >
                    $ Sales
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/overview/demand"
                    className={({ isActive }) =>
                      isActive ? "nav-link active-link" : "nav-link"
                    }
                  >
                    ％ Demand
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <div className="topbar-card">
          <div className="mt-4">
            <h2 className="text-2xl font-semibold mb-4">SALES</h2>
            <div style={{ maxWidth: "700px", margin: "auto" }}>
              <LineChartSales />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
