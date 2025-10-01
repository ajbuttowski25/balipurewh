import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/bg.png";
import "./Styles.css";
import axios from "axios";
import { FaRegUser, FaListUl } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard, MdOutlineInventory2 } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import { FaBoxOpen, FaUndo, FaTrashAlt, FaShoppingCart, FaClipboardList } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import PurchaseOrderPieChart from "./PurchaseOrderPieChart";
import FinishedGoodsChart from "./FinishedGoodsChart";
import RawMaterialsChart from "./RawMaterialsChart";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const storedEmployeeID = localStorage.getItem("employeeID");
  if (!storedEmployeeID) {
    window.location.href = "/";
    return null;
  }

  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const [userFirstName, setUserFirstName] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [employeeID, setEmployeeID] = useState("");

  const [rtvCount, setRtvCount] = useState(0);
  const [disposalCount, setDisposalCount] = useState(0);
  const [purchaseOrdersCount, setPurchaseOrdersCount] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [rawMats, setRawMats] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [partiallyReceivedOrders, setPartiallyReceivedOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");
  const [topSellingProduct, setTopSellingProduct] = useState("N/A");
  const [topProducts, setTopProducts] = useState([]);
  const salesOrdersCount = 120; // Example static value


  const fetchDashboardData = async () => {
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

      const [rtvRes, dispRes] = await Promise.all([
        axios.get("http://localhost:8000/api/sales-orders/rtv-count"),
        axios.get("http://localhost:8000/api/sales-orders/disposal-count"),
      ]);
      setRtvCount(rtvRes.data.count || 0);
      setDisposalCount(dispRes.data.count || 0);

      const [pendingRes, unservedRes, completedRes] = await Promise.all([
        axios.get("http://localhost:8000/api/purchase-orders/pending-count"),
        axios.get("http://localhost:8000/api/purchase-orders/partial-count"),
        axios.get("http://localhost:8000/api/purchase-orders/completed-count"),
      ]);
      setPurchaseOrdersCount(
        (pendingRes.data.count || 0) + (unservedRes.data.count || 0) + (completedRes.data.count || 0)
      );
      setPendingOrders(pendingRes.data.count || 0);
      setPartiallyReceivedOrders(unservedRes.data.count || 0);
      setCompletedOrders(completedRes.data.count || 0);

      const [inventoryRes, rawMatsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/inventories"),
        axios.get("http://localhost:8000/api/inventory_rawmats"),
      ]);
      setInventory(inventoryRes.data || []);
      setRawMats(rawMatsRes.data || []);

      const topSellingRes = await axios.get("http://localhost:8000/api/sales-orders/most-selling");
      if (topSellingRes.data && topSellingRes.data.top_product) {
        setTopSellingProduct(
          `${topSellingRes.data.top_product} (${topSellingRes.data.total_sold} sold)`
        );
      }
      
    const topProductsRes = await axios.get("http://localhost:8000/api/sales-orders/top-products");
    setTopProducts(topProductsRes.data || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });
    setCurrentMonth(monthName.toUpperCase());
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
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
            <NavLink
              to="/user-management"
              className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
            >
              <FaRegUser /> Accounts
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customers"
              className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
            >
              <FaRegUser /> Customers
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* ✅ All content moved inside main-content */}
      <div className="main-content">
        {/* Topbar */}
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
        <h2 className="topbar-title">Activity Overview</h2>
        <p className="subtext">Here's what's happening in your warehouse.</p>
        <div className="dashboard-grid">
{/* Top 5 Stat Cards */}
<div className="top-cards">
  <NavLink to="/sales-order" className="dashboard-card">
    <div className="card-header">
      <div className="card-title">Top Selling Product</div>
    </div>
    <div className="card-value">{topSellingProduct}</div>
    <FaBoxOpen className="card-icon" />
  </NavLink>

  <NavLink to="/sales-order" className="dashboard-card">
    <div className="card-header">
      <div className="card-title">RTV</div>
    </div>
    <div className="card-value">{rtvCount}</div>
    <FaUndo className="card-icon" />
  </NavLink>

  <NavLink to="/sales-order" className="dashboard-card">
    <div className="card-header">
      <div className="card-title">Disposal</div>
    </div>
    <div className="card-value">{disposalCount}</div>
    <FaTrashAlt className="card-icon" />
  </NavLink>

  <NavLink to="/purchase-order" className="dashboard-card">
    <div className="card-header">
      <div className="card-title">Purchase Orders</div>
    </div>
    <div className="card-value">{purchaseOrdersCount}</div>
    <FaShoppingCart className="card-icon" />
  </NavLink>

  <NavLink to="/sales-order" className="dashboard-card">
    <div className="card-header">
      <div className="card-title">Sales Orders</div>
    </div>
    <div className="card-value">{salesOrdersCount}</div>
    <FaClipboardList className="card-icon" />
  </NavLink>
</div>

{/* Raw Materials Chart */}
<div className="section-box raw-materials">
  <div className="section-title text-center">Raw Materials Inventory Levels</div>
  <RawMaterialsChart rawMats={rawMats} />
</div>

{/* Most Selling Products */}
<div className="section-box most-selling text-center">
  <div className="section-title">Most Selling Products<br />(This Month)</div>
  <div className="sales-sub-box">
    {topProducts.length > 0 ? (
      topProducts.map((product, index) => (
        <div className="sales-sub-item" key={index}>
          <span className="label">{product.product}</span>
          <span className="value">{product.total_sales} Sales</span>
        </div>
      ))
    ) : (
      <p>No sales data available</p>
    )}
  </div>
</div>

{/* Finished Goods */}
<div className="section-box finished-goods">
  <div className="section-title text-center">Finished Goods Inventory Levels</div>
  <FinishedGoodsChart inventory={inventory} />
</div>

{/* Purchase Order Status */}
<div className="section-box po-status">
  <div className="section-title text-center">Purchase Order Status</div>
  <PurchaseOrderPieChart 
    pending={pendingOrders}
    partiallyReceived={partiallyReceivedOrders}
    completed={completedOrders}
  />
</div>


        </div>
      </div>
    </div>
  );
}

export default Dashboard;
