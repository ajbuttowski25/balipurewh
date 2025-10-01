import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "./logo.jpg";
import "./Styles.css";
import { api, ensureCsrf } from "../axios";
import axios from "axios";   // ✅ You missed this import
import { FaRegUser } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import profile from '../assets/d.png';

function PurchaseOrder() {
  const [receivingModalOpen, setReceivingModalOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [userFirstName, setUserFirstName] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [receivingQty, setReceivingQty] = useState({});
  const [isReceiving, setIsReceiving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const storedEmployeeID = localStorage.getItem("employeeID");
      if (!storedEmployeeID) return;

      const response = await axios.get(`http://localhost:8000/api/users/${storedEmployeeID}`);

      if (response.data) {
        // Safely build full name
        const fullName = `${response.data.firstname || ""} ${response.data.lastname || ""}`.trim();
        setUserFullName(fullName || "Unknown User");

        // Use employee_id if exists, otherwise fallback to stored
        setEmployeeID(response.data.employee_id || storedEmployeeID);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchUserData();
}, []);


  const [formData, setFormData] = useState({
    po_number: `PO-${Date.now()}`,
    supplier_name: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_date: "",
    status: "Pending",
    amount: "",
  });

  const [items, setItems] = useState([{ item_name: "", quantity: 0 }]);

  const itemPrices = {
    McBride: {
      "350ml": 2.1,
      "500ml": 2.25,
      "1L": 4.05,
      "6L": 23,
      Cap: 0.5,
      "6L Cap": 3,
    },
    Filpet: {
      "500ml": 2.35,
      Cap: 0.49,
    },
      Synergy: {
      Stretchfilm: 320,   // ✅ sample price, change as needed
    },
      Polyflex: {
      Shrinkfilm: 2337,     // ✅ sample price, change as needed
    }
  };

  const availableItems = {
    McBride: ["350ml", "500ml", "1L", "6L", "Cap", "6L Cap"],
    Filpet: ["500ml", "Cap"],
    Synergy: ["Stretchfilm"],
    Polyflex: ["Shrinkfilm"],
  };

  const getFilteredItems = (supplier) => availableItems[supplier] || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const getExpectedRange = (orderDate) => {
    const [year, month, day] = orderDate.split("-").map(Number);
    const order = new Date(year, month - 1, day);

    const twoWeeksLater = new Date(order);
    twoWeeksLater.setDate(order.getDate() + 14);

    const oneMonthLater = new Date(order);
    oneMonthLater.setMonth(order.getMonth() + 1);

    const format = (d) => {
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    return `${format(twoWeeksLater)} to ${format(oneMonthLater)}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const total = items.reduce((acc, item) => {
      const price = itemPrices[formData.supplier_name]?.[item.item_name] || 0;
      return acc + price * (parseFloat(item.quantity) || 0);
    }, 0);
    setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
  }, [items, formData.supplier_name]);

  useEffect(() => {
    const [year, month, day] = formData.order_date.split("-").map(Number);
    const order = new Date(year, month - 1, day);
    order.setDate(order.getDate() + 14);
    const expected = order.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, expected_date: expected }));
  }, [formData.order_date]);

  const fetchOrders = async () => {
    try {
      await ensureCsrf();
      const response = await api.get("/api/purchase-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchOrderItems = async (purchaseOrderId) => {
    try {
      await ensureCsrf();
      const response = await api.get(`/api/purchase-order-items/${purchaseOrderId}`);
      setOrderItems(response.data);
    } catch (error) {
      console.error("Failed to fetch order items:", error);
      setOrderItems([]);
    }
  };

const handleFormSubmit = async (e) => {
  e.preventDefault();
  try {
    if (!formData.supplier_name || !formData.expected_date) {
      alert("Supplier and Expected Date are required.");
      return;
    }

    const validItems = items.filter((item) => item.item_name && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Please add at least one valid item.");
      return;
    }

    const rawMaterialNames = ["Cap", "6L Cap", "Stretchfilm", "Shrinkfilm"];

    await ensureCsrf();
    const response = await api.post("/api/purchase-orders", formData);
    const poId = response.data.id;

    for (let item of validItems) {
      const item_type = rawMaterialNames.includes(item.item_name)
        ? "raw_material"
        : "pcs";

      await api.post("/api/purchase-order-items", {
        purchase_order_id: poId,
        item_name: item.item_name,
        item_type,
        quantity: item.quantity,
      });
    }

    alert("Purchase Order created successfully!");
    console.log("Purchase Order ID:", poId);

    // ✅ reset only PO number + items, keep supplier & expected_date
    setFormData((prev) => ({
      ...prev,
      po_number: `PO-${Date.now()}`,
      amount: "",
    }));

    setItems([{ item_name: "", quantity: 0 }]);

    fetchOrders();

  } catch (err) {
    console.error("Failed to submit purchase order", err);
    alert("Failed to submit purchase order. Please try again.");
  }
};

const handleReceiveSave = async () => {
  if (isReceiving) return;
  setIsReceiving(true);

  try {
    for (let item of orderItems) {
      const qty = parseInt(receivingQty[item.id] || 0);
      const remainingQty = item.quantity - (item.received_quantity || 0);

      if (qty > remainingQty) {
        alert(`❌ Cannot receive more than remaining quantity for ${item.item_name}.`);
        setIsReceiving(false);
        return;
      }

      if (qty > 0) {
        await ensureCsrf();
        await api.post(`/api/purchase-orders/${selectedOrder.id}/receive`, {
          item_id: item.id,
          quantity: qty,
        });
      }
    }

    alert("✅ Items received successfully!");

    // reset modal + inputs
    setReceivingModalOpen(false);
    setReceivingQty({});

    // 🔄 refresh global orders list
    await fetchOrders();

    // 🚪 also close order detail modal
    setSelectedOrder(null);
    setOrderItems([]);

  } catch (err) {
    console.error("Error receiving items:", err);
    alert("❌ Failed to receive items.");
  } finally {
    setIsReceiving(false);
  }
};


  // Sidebar/Row selection handlers
  const handleSupplierChange = (e) => {
    const supplier = e.target.value;
    setFormData({ ...formData, supplier_name: supplier, amount: "" });
    setItems([{ item_name: "", quantity: 0 }]);
  };

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? orders.map((_, i) => i) : []);
  };

  const handleRowCheckbox = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...items];
    if (key === "item_name") {
      const allowed = getFilteredItems(formData.supplier_name);
      if (!allowed.includes(value)) {
        alert(`Choose only ${formData.supplier_name} offered materials.`);
        updatedItems[index][key] = "";
      } else {
        updatedItems[index][key] = value;
      }
    } else {
      updatedItems[index][key] = value;
    }
    setItems(updatedItems);
  };

  const addItem = () => setItems([...items, { item_name: "", quantity: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const confirmDelete = async () => {
    const toDelete = selectedRows.map((index) => orders[index].id);
    try {
      await ensureCsrf();
      await Promise.all(toDelete.map((id) => api.delete(`/api/purchase-orders/${id}`)));
      setOrders(orders.filter((_, index) => !selectedRows.includes(index)));
      setSelectedRows([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete orders:", error);
      alert("Error deleting orders.");
      setShowDeleteConfirm(false);
    }
  };

const handleGenerateDeliveryNote = async (orderId) => {
  try {
    const response = await api.get(`/api/purchase-orders/${orderId}/delivery-note`, {
      responseType: "blob",
      withCredentials: true,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DeliveryNote-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating Delivery Note:", error);
    alert("Failed to generate delivery note.");
  }
};

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

  const isAllSelected = selectedRows.length === orders.length;

  return (
    <div className={`dashboard-container ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "" : "collapsed"} ${overviewOpen ? "scrollable" : ""}`}>
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

      {/* Main content */}
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
            <h2 className="topbar-title">Purchase Order</h2>
<div className="d-flex flex-wrap align-items-center gap-2 mb-3 mt-3">
  {/* Search */}
  <input
    type="text"
    className="form-control"
    style={{ width: "250px" }}
    placeholder="Search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
    {/* Dropdown Filter */}
  <select
    className="custom-select"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="All">All</option>
    <option value="Pending">Pending</option>
    <option value="Partially Received">Partially Received</option>
    <option value="Completed">Completed</option>
  </select>

  {/* Action Buttons */}
  <div className="ms-auto d-flex gap-2">
    <button
      className="btn btn-primary btn-sm"
      onClick={() => setIsFormModalOpen(true)}
    >
      + Send Request
    </button>
    <button
      className="btn btn-danger btn-sm"
      onClick={() => setShowDeleteConfirm(true)}
      disabled={selectedRows.length === 0}
    >
      <FaTrash /> Delete
    </button>
  </div>
</div>

          <div className="topbar-inventory-box">
 <table className="custom-table">
  <thead>
    <tr>
      <th>
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAll}
        />
      </th>
      <th>PO Number</th>
      <th>Order Date</th>
      <th>Expected Delivery</th>
      <th>Supplier</th>
      <th>Status</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    {orders
      .filter(order => {
        // ✅ Status filter
        if (statusFilter !== "All" && order.status !== statusFilter) return false;

        // ✅ Search filter (case-insensitive)
        if (searchTerm.trim() !== "") {
          const term = searchTerm.toLowerCase();
          return (
            order.po_number.toLowerCase().includes(term) ||
            order.supplier_name.toLowerCase().includes(term) ||
            order.status.toLowerCase().includes(term)
          );
        }

        return true;
      })
      .map((order, index) => (
        <tr
          key={index}
          onClick={() => {
            setSelectedOrder(order);
            fetchOrderItems(order.id);
            setIsModalOpen(true);
          }}
          style={{ cursor: "pointer" }}
        >
          <td onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedRows.includes(index)}
              onChange={() => handleRowCheckbox(index)}
            />
          </td>
          <td>{order.po_number}</td>
          <td>{formatDate(order.order_date)}</td>
          <td>{formatDate(order.expected_date)}</td>
          <td>{order.supplier_name}</td>
          <td>
            <strong>{order.status}</strong>
          </td>
          <td className="text-right">
            ₱{parseFloat(order.amount).toLocaleString()}
          </td>
        </tr>
      ))}
  </tbody>
</table>
          </div>
        </div>

{/* Order detail modal */}
{isModalOpen && selectedOrder && (
  <div className="custom-modal-backdrop">
    <div className="custom-modal">
      <h5>Purchase Order Details</h5>
      <p><strong>PO Number:</strong> {selectedOrder.po_number}</p>
      <p><strong>Order Date:</strong> {selectedOrder.order_date}</p>
      <p><strong>Expected Date:</strong> {selectedOrder.expected_date}</p>
      <p><strong>Supplier:</strong> {selectedOrder.supplier_name}</p>
      <p><strong>Status:</strong> {selectedOrder.status}</p>
      <p>
        <strong>Amount:</strong>{" "}
        ₱{parseFloat(selectedOrder.amount).toLocaleString()}
      </p>

<h6>Ordered Items</h6>
<table className="table table-sm table-bordered">
  <thead>
    <tr>
      <th>Item Name</th>
      <th>Ordered Qty</th>
      <th>Received Qty</th>
    </tr>
  </thead>
<tbody>
  {orderItems.length > 0 ? (
    orderItems.map((item, idx) => {
      const partiallyReceived = item.received_quantity > 0 && item.received_quantity < item.quantity;
      return (
        <tr key={idx} style={{ backgroundColor: partiallyReceived ? '#fff3cd' : 'transparent' }}>
          <td>{item.item_name}</td>
          <td>{item.quantity}</td>
          <td>{item.received_quantity || 0}</td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="3" className="text-center">
        No items found.
      </td>
    </tr>
  )}
</tbody>
</table>

<div className="text-end">
  {selectedOrder.status && (
    <>
      {(selectedOrder.status.toLowerCase() === "pending" || 
        selectedOrder.status.toLowerCase() === "partially received") && (
        <button
          className="btn btn-success btn-sm me-2"
          onClick={() => setReceivingModalOpen(true)}
        >
          ✅ Receive Items
        </button>
      )}

      {(selectedOrder.status.toLowerCase() === "partially received" || 
        selectedOrder.status.toLowerCase() === "completed") && (
        <button
          className="btn btn-primary btn-sm me-2"
          onClick={() => handleGenerateDeliveryNote(selectedOrder.id)}
        >
          📄 Generate PDF
        </button>
      )}
    </>
  )}

  <button
    className="btn btn-secondary btn-sm"
    onClick={() => setIsModalOpen(false)}
  >
    Close
  </button>
</div>

    </div>
  </div>
)}

      {/* Receiving modal */}
      {receivingModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal" style={{ maxWidth: "700px" }}>
            <h5>Receive Items - {selectedOrder.po_number}</h5>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Ordered</th>
                  <th>New Receive</th>
                </tr>
              </thead>
<tbody>
  {orderItems.map((item, idx) => {
    const remainingQty = item.quantity - (item.received_quantity || 0); // Remaining
    return (
      <tr key={idx}>
        <td>{item.item_name}</td>
        <td>{item.quantity}</td>
        <td>
          <input
            type="number"
            min="0"
            max={remainingQty}
            className="form-control"
            value={receivingQty[item.id] || ""}
            onChange={(e) => {
              let value = parseInt(e.target.value) || 0;
              if (value > remainingQty) value = remainingQty; // Cap at remaining
              if (value < 0) value = 0;
              setReceivingQty({ ...receivingQty, [item.id]: value });
            }}
          />
          <small className="text-muted">Remaining: {remainingQty}</small>
        </td>
      </tr>
    );
  })}
</tbody>
            </table>

            <div className="text-end">
              <button className="btn btn-secondary btn-sm me-2" onClick={() => setReceivingModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleReceiveSave}
                disabled={isReceiving}
              >
                {isReceiving ? "Receiving..." : "Save Receiving"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {isFormModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal"   style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '95vw',
              maxWidth: '750px'
            }}>
            <h5>Purchase Request</h5>
            <div className="mb-2">
              <label>PO Number:</label>
              <input className="form-control" type="text" value={formData.po_number} disabled />
            </div>

            <div className="mb-2">
              <label>Supplier:</label>
              <select className="form-control" value={formData.supplier_name} onChange={handleSupplierChange}>
                <option value="">-- Select Supplier --</option>
                <option value="McBride">McBride</option>
                <option value="Filpet">Filpet</option>
                <option value="Synergy">Synergy</option>
                <option value="Polyflex">Polyflex</option>
              </select>
            </div>

            <div className="mb-2">
              <label>Order Date:</label>
              <div className="form-control bg-light">
                {formatDate(formData.order_date)}
              </div>
            </div>

            <div className="mb-2">
              <label>Expected Delivery Date (Range):</label>
              <div className="form-control bg-light">
                {getExpectedRange(formData.order_date)}
              </div>
            </div>

            <div className="mb-3">
              <label>Total Amount (₱):</label>
              <input className="form-control" type="number" value={formData.amount} readOnly />
            </div>

            <hr />
<h6>Items</h6>

<table className="table table-bordered table-sm align-middle">
  <thead className="table-light">
    <tr>
      <th style={{ width: "20%" }}>Item</th>
      <th style={{ width: "10%" }}>Qty</th>
      <th style={{ width: "15%", textAlign: "right" }}>Unit Price</th>
      <th style={{ width: "15%", textAlign: "right" }}>Total Price</th>
      <th style={{ width: "10%", textAlign: "center" }}>Delete</th>
    </tr>
  </thead>
  <tbody>
    {items.map((item, index) => {
      const unitPrice = itemPrices[formData.supplier_name]?.[item.item_name] || 0;
      const totalPrice = unitPrice * (parseFloat(item.quantity) || 0);

      return (
        <tr key={index}>
          {/* Item select */}
          <td>
            <select
              className="form-control"
              value={item.item_name}
              onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
            >
              <option value="">-- Select Item --</option>
              {getFilteredItems(formData.supplier_name).map((itm, idx) => (
                <option key={idx} value={itm}>{itm}</option>
              ))}
            </select>
          </td>

          {/* Quantity input */}
          <td>
            <input
              className="form-control"
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            />
          </td>

          {/* Unit Price */}
          <td style={{ textAlign: "right" }}>
            ₱{unitPrice.toFixed(2)}
          </td>

          {/* Total Price */}
          <td style={{ textAlign: "right", fontWeight: "bold" }}>
            ₱{totalPrice.toFixed(2)}
          </td>

          {/* Delete button */}
          <td style={{ textAlign: "center" }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => removeItem(index)}
            >
              Delete
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

            <div className="mb-3 text-start">
              <button className="btn btn-success btn-sm" onClick={addItem}>➕ Add Item</button>
            </div>

            <div className="text-end">
              <button className="btn btn-secondary btn-sm me-2" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleFormSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5>Confirm Delete</h5>
            <p>Are you sure you want to delete the selected order(s)?</p>
            <div className="text-end">
              <button className="btn btn-danger btn-sm me-2" onClick={confirmDelete}>Yes</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrder;
