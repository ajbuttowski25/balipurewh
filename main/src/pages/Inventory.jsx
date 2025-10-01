import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import logo from './logo.jpg';
import './Styles.css';
import { FaRegUser } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import profile from '../assets/d.png';

function Inventory() {
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [inventoryData, setInventoryData] = useState([]);
  const [inventoryType, setInventoryType] = useState("normal");
  const [userFirstName, setUserFirstName] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [quantityInputs, setQuantityInputs] = useState({});
  // ✅ New States for Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ item: "", unit: "", quantity: "" });

// ✅ Add Item handler
const handleAddItem = async () => {
  if (!newItem.item || !newItem.unit || !newItem.quantity) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const endpoint =
      inventoryType === "raw"
        ? "http://localhost:8000/api/inventory_rawmats"
        : "http://localhost:8000/api/inventories";

    await axios.post(endpoint, newItem);

    fetchInventory();
    setShowAddModal(false);
    setNewItem({ item: "", unit: "", quantity: "" });
  } catch (err) {
    console.error("Error adding new item:", err);
    alert("Failed to add new item");
  }
};

const handleDeductQuantity = async (itemId) => {
  const deductQty = quantityInputs[itemId];
  if (!deductQty || isNaN(deductQty)) {
    alert("Please enter a valid number");
    return;
  }

  try {
    const endpoint = `http://localhost:8000/api/inventory_rawmats/${itemId}/deduct`;
    await axios.post(endpoint, { quantity: Number(deductQty) });
    fetchInventory(); // refresh inventory after deduction
    setQuantityInputs((prev) => ({ ...prev, [itemId]: "" })); // clear input
  } catch (err) {
    console.error("Error deducting quantity:", err);
    alert("Failed to deduct quantity");
  }
};

  // ✅ Custom order for display
  const finishedGoodsOrder = ["350ml", "500ml", "1L", "6L"];
  const rawMaterialsOrder = [
    "350ml",
    "500ml (McBride)",
    "500ml (Filpet)",
    "1L",
    "6L",
    "Cap (McBride)",
    "Cap (Filpet)",
    "6L Cap"
  ];

  const sortByCustomOrder = (items, orderArray) => {
    return [...items].sort(
      (a, b) => orderArray.indexOf(a.item) - orderArray.indexOf(b.item)
    );
  };

  const filteredItems = inventoryData.filter(i =>
    i.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Apply custom sorting depending on type
  const sortedItems =
    inventoryType === "raw"
      ? sortByCustomOrder(filteredItems, rawMaterialsOrder)
      : sortByCustomOrder(filteredItems, finishedGoodsOrder);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

  const fetchInventory = () => {
    const endpoint =
      inventoryType === "raw"
        ? "http://localhost:8000/api/inventory_rawmats"
        : "http://localhost:8000/api/inventories";

    axios
      .get(endpoint)
      .then((res) => setInventoryData(res.data))
      .catch((err) => console.error("Error fetching inventory:", err));
  };

  useEffect(() => {
    fetchInventory();

    const fetchUserInfo = async () => {
      try {
        const storedEmployeeID = localStorage.getItem("employeeID");
        if (!storedEmployeeID) return;

        const response = await axios.get(
          `http://localhost:8000/api/users/${storedEmployeeID}`
        );

        if (response.data) {
          setEmployeeID(response.data.employee_id || storedEmployeeID);
          setUserFullName(
            `${response.data.firstname || ""} ${response.data.lastname || ""}`
          );
          setUserFirstName(response.data.firstname || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserInfo();

    setSearchTerm("");
    setCurrentPage(1);
  }, [inventoryType]);

  const getQuantityColor = (qty, itemName) => {
    if (inventoryType === "raw") {
      if (qty < 150001) return "text-danger";
      if (qty < 160001) return "text-warning";
      return "text-success";
    }

    const thresholds = {
      "350ml": { red: 1001, yellow: 2000 },
      "500ml": { red: 1501, yellow: 2500 },
      "1L": { red: 1001, yellow: 2000 },
      "6L": { red: 501, yellow: 750 },
    };

    const size = itemName.trim();
    const threshold = thresholds[size];

    if (!threshold) return "text-success";
    if (qty < threshold.red) return "text-danger";
    if (qty < threshold.yellow) return "text-warning";
    return "text-success";
  };

  const handleAddQuantity = async (itemId) => {
    const addQty = quantityInputs[itemId];
    if (!addQty || isNaN(addQty)) {
      alert("Please enter a valid number");
      return;
    }

    try {
      const endpoint =
        inventoryType === "raw"
          ? `http://localhost:8000/api/inventory_rawmats/${itemId}/add`
          : `http://localhost:8000/api/inventories/${itemId}/add`;

      await axios.post(endpoint, { quantity: Number(addQty) });
      fetchInventory();
      setQuantityInputs((prev) => ({ ...prev, [itemId]: "" }));
    } catch (err) {
      console.error("Error adding quantity:", err);
      alert("Failed to update quantity");
    }
  };

  return (
    <div className={`dashboard-container ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'} ${overviewOpen ? 'scrollable' : ''}`}>
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>
        <ul className="list-unstyled">
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><MdOutlineDashboard /> Dashboard</NavLink></li>
          <li><NavLink to="/inventory" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><MdOutlineInventory2 /> Inventory</NavLink></li>
          <li><NavLink to="/sales-order" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><BiPurchaseTag /> Sales Order</NavLink></li>
          <li><NavLink to="/purchase-order" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><FaListUl /> Purchase Order</NavLink></li>
          <li><NavLink to="/reports" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><TbReportSearch /> Reports</NavLink></li>
          <li><NavLink to="/user-management" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><FaRegUser /> Accounts</NavLink></li>
          <li><NavLink to="/customers" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}><FaRegUser /> Customers</NavLink></li>
        </ul>
      </aside>

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

<h2 className="topbar-title">Inventory Overview</h2>
    <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
    {/* Left side: search + dropdown */}
    <div className="d-flex gap-2">
      <input
        type="text"
        className="form-control"
        style={{ width: "250px" }}
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <select
        className="custom-select"
        style={{ width: "200px" }}
        value={inventoryType}
        onChange={(e) => setInventoryType(e.target.value)}
      >
        <option value="normal">Finished Goods</option>
        <option value="raw">Raw Materials</option>
      </select>
    </div>

    {/* Right side: Add Item button */}
    <button
      className="btn btn-primary"
      onClick={() => setShowAddModal(true)}
    >
      + Add Item
    </button>
    </div>


<div className="topbar-inventory-box">
  <table className="custom-table">
    <thead>
      <tr>
        <th>Items</th>
        <th>Unit</th>
        <th>Quantity</th>
        <th>Action</th> {/* Always show Action column */}
      </tr>
    </thead>
    <tbody>
      {currentItems.length > 0 ? (
        currentItems.map((item) => (
          <tr key={item.id} style={{ padding: '10px 0' }}>
            <td>{item.item}</td>
            <td>{item.unit}</td>
            <td className={getQuantityColor(item.quantity, item.item)}>{item.quantity}</td>
            <td>
              <div className="table-actions">
                <input
                  type="number"
                  className="qty-input"
                  placeholder="Qty"
                  value={quantityInputs[item.id] || ""}
                  onChange={(e) =>
                    setQuantityInputs((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                />
                {inventoryType === "normal" ? (
                  <button
                    className="btn-add"
                    onClick={() => handleAddQuantity(item.id)}
                  >
                    Add
                  </button>
                ) : (
                  <button
                    className="btn-deduct"
                    onClick={() => handleDeductQuantity(item.id)}
                  >
                    Deduct
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="text-center">
            No items found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* Pagination */}
<div className="d-flex justify-content-between mt-2">
  <button
    className="btn btn-sm btn-light"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    &larr; Previous
  </button>
  <button
    className="btn btn-sm btn-light"
    disabled={indexOfLastItem >= sortedItems.length}
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    Next &rarr;
  </button>
</div>


          {/* ✅ Modal moved here (outside table) */}
          {showAddModal &&
            ReactDOM.createPortal(
              <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                <div
                  className="modal-content p-4 bg-white rounded shadow"
                  onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                >
                  <h5>
                    Add New {inventoryType === "raw" ? "Raw Material" : "Finished Good"}
                  </h5>

                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Item Name"
                    value={newItem.item}
                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  />

                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Unit (e.g., pcs, box)"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  />

                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                  />

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-success" onClick={handleAddItem}>
                      Save
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
  );
}

export default Inventory;
