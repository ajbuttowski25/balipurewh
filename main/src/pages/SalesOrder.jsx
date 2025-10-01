import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from 'react-router-dom';
import logo from './logo.jpg';
import { FaTrashAlt } from 'react-icons/fa';
import './Styles.css';
import { FaRegUser } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import profile from '../assets/d.png';

function SalesOrder() {
    // === State Variables ===
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempType, setTempType] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [userFullName, setUserFullName] = useState("");
    const [employeeID, setEmployeeID] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    // --- Filter Orders ---
    const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customer_id);
    const customerName = customer ? customer.name : "";
    const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatOrderNumber(order).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
    });
// --- Pagination states ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

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

    const [newCustomer, setNewCustomer] = useState({
        name: "",
        billing_address: "",
        shipping_address: "",
        bank_details: "",
        tin: "",
        discounts: ""
    });

// Define product prices as constants for easy management
    const PRICES = {
        '350ml': 130,
        '500ml': 155,
        '1L': 130,
        '6L': 60,
    };

    const [newOrder, setNewOrder] = useState({
        products: [],
        quantities: { '350ml': '', '500ml': '', '1L': '', '6L': '' },
        location: '',
        customer_id: '',
        delivery_date: '',
        date: '',
        order_type: 'CSO'
    });
    
    // === ADDED: New State for Product Totals and Grand Total ===
    const [productTotals, setProductTotals] = useState({
        '350ml': 0,
        '500ml': 0,
        '1L': 0,
        '6L': 0,
    });
    const [grandTotal, setGrandTotal] = useState(0);

    // === Data Fetching Effects ===
    const fetchOrders = async (type = "All") => {
        try {
            let url = "http://localhost:8000/api/sales-orders";
            if (type !== "All") {
                url += `?order_type=${encodeURIComponent(type)}`;
            }
            const res = await axios.get(url);
            setOrders(res.data);
        } catch (err) {
            showMessage("Failed to fetch orders.");
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/customers");
            setCustomers(res.data);
        } catch (err) {
            showMessage("Failed to fetch customers.");
        }
    };

    useEffect(() => {
        fetchOrders(filterType);
        fetchCustomers();
    }, [filterType]);

    // === Handler Functions ===
    const showMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleSelectAll = (e) => {
        setSelectedRows(e.target.checked ? orders.map((_, i) => i) : []);
    };

    const handleRowCheckbox = (index) => {
        setSelectedRows((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

const confirmDelete = async () => {
  const idsToDelete = selectedRows.map(index => orders[index].id);

  try {
    // Send bulk delete request with array of IDs
    await axios.delete("http://localhost:8000/api/sales-orders", {
      data: { ids: idsToDelete },
    });

    const remainingOrders = orders.filter((_, i) => !selectedRows.includes(i));
    setOrders(remainingOrders);
    setSelectedRows([]);
    setShowDeleteConfirm(false);
    showMessage("Selected order(s) deleted successfully!");
  } catch (err) {
    setShowDeleteConfirm(false);
    console.error("Error deleting orders:", err.response?.data || err.message);
    showMessage("Failed to delete order(s).");
  }
};



    const handleDelete = () => {
        if (!selectedRows.length) return;
        setShowDeleteConfirm(true);
    };

    const isAllSelected = selectedRows.length > 0 && selectedRows.length === orders.length;

    const openModal = (index) => {
        setSelectedOrderIndex(index);
        setTempType(orders[index].order_type);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        const selectedOrder = orders[selectedOrderIndex];
        const payload = { ...selectedOrder, order_type: tempType };
        axios.put(`http://localhost:8000/api/sales-orders/${selectedOrder.id}`, payload)
            .then(() => {
                const updatedOrders = [...orders];
                updatedOrders[selectedOrderIndex].order_type = tempType;
                setOrders(updatedOrders);
                setIsModalOpen(false);
                showMessage("Order type updated successfully!");
            }).catch(() => {
                setIsModalOpen(false);
                showMessage("Failed to update order type.");
            });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

const formatOrderNumber = (order) => {
    // Add a check to ensure the 'order' object and its properties exist
    // This prevents the "Cannot read properties of undefined" error
    if (!order || !order.date || !order.id) {
        return 'N/A'; // Return a default value if data is missing
    }

    // Convert the date to a string and remove hyphens
    const datePart = order.date.toString().replace(/-/g, '');

    // Convert the ID to a string and pad it with leading zeros
    const idPart = String(order.id).padStart(4, '0');

    // Return the formatted order number
    return `SO-${datePart}-${idPart}`;
};
    const handleQuantityChange = (e) => {
        const { name, value } = e.target;
        const newQuantities = {
            ...newOrder.quantities,
            [name]: parseInt(value) || 0,
        };
        setNewOrder(prev => ({
            ...prev,
            quantities: newQuantities,
        }));

        const newProductTotals = {
            ...productTotals,
            [name]: (parseInt(value) || 0) * PRICES[name]
        };
        setProductTotals(newProductTotals);

        const total = Object.values(newProductTotals).reduce((sum, current) => sum + current, 0);
        setGrandTotal(total);
    };

    const handleAddCustomer = async () => {
  try {
    const res = await axios.post("http://localhost:8000/api/customers", newCustomer);
    // Add new customer to list
    setCustomers(prev => [...prev, res.data]);
    // Select the newly added customer in the order form
    setNewOrder(prev => ({ ...prev, customer_id: res.data.id }));
    setIsAddCustomerModalOpen(false);
    setNewCustomer({
      name: "",
      billing_address: "",
      shipping_address: "",
      bank_details: "",
      tin: "",
      discounts: ""
    });
    showMessage("Customer added successfully!");
  } catch (err) {
    console.error("Error adding customer:", err);
    showMessage("Failed to add customer.");
  }
};


const handleAddOrder = async () => {
  const payload = {
    customer_id: newOrder.customer_id,
    location: newOrder.location,
    date: newOrder.date,
    delivery_date: newOrder.delivery_date,
    order_type: newOrder.order_type,
    products: Object.keys(newOrder.quantities)
      .filter(key => Number(newOrder.quantities[key]) > 0)
      .join(", "),
    quantities: newOrder.quantities,
    amount: grandTotal,
    qty_350ml: Number(newOrder.quantities["350ml"]) || 0,
    qty_500ml: Number(newOrder.quantities["500ml"]) || 0,
    qty_1L: Number(newOrder.quantities["1L"]) || 0,
    qty_6L: Number(newOrder.quantities["6L"]) || 0,
  };

  try {
    // Save order
    const res = await axios.post("http://localhost:8000/api/sales-orders", payload);

    // ✅ Use returned order directly (no need for GET)
    setOrders((prev) => [...prev, res.data.data]);

    // Reset form
    setGrandTotal(0);
    setProductTotals({ "350ml": 0, "500ml": 0, "1L": 0, "6L": 0 });
    setIsAddModalOpen(false);
    setNewOrder({
      products: [],
      quantities: { "350ml": "", "500ml": "", "1L": "", "6L": "" },
      location: "",
      customer_id: "",
      delivery_date: "",
      date: "",
      order_type: "CSO",
    });

    showMessage("Sales order successfully added!");
  } catch (err) {
    console.error("Error adding order:", err.response?.data || err.message);
    showMessage("Failed to add order.");
  }
};


    const handleGeneratePdf = async () => {
        if (selectedOrderIndex === null) return;
        
        const orderId = orders[selectedOrderIndex].id;
        
        try {
            const response = await axios.get(`http://localhost:8000/api/sales-orders/${orderId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SalesOrder-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showMessage("Failed to generate PDF.");
        }
    };

const selectedCustomer = customers.find(c => c.id == newOrder?.customer_id);

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
<h2 className="topbar-title">Sales Order</h2>
<div className="d-flex justify-content-between align-items-center mb-3 mt-3 flex-wrap">
  {/* Left side: dropdown + search */}
  <div className="d-flex gap-2">
    <input
      type="text"
      placeholder="Search"
      className="form-control"
      style={{ width: "250px" }}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
        <select
      className="custom-select"
      onChange={(e) => setFilterType(e.target.value)}
    >
      <option value="All">All</option>
      <option value="CSO">CSO</option>
      <option value="RTV">RTV</option>
      <option value="Disposal">Disposal</option>
    </select>
  </div>

  {/* Right side: buttons */}
  <div className="d-flex gap-2">
    <button
      className="btn btn-primary btn-sm"
      onClick={() => setIsAddModalOpen(true)}
    >
      + Add Order
    </button>

    <button
      className="btn btn-danger btn-sm"
      onClick={handleDelete}
      disabled={selectedRows.length === 0}
    >
      <FaTrashAlt /> Delete
    </button>
  </div>
</div>

{/* Success message (placed below for clean layout) */}
{successMessage && (
  <div className="alert alert-info py-1 px-2 mb-2" role="alert">
    {successMessage}
  </div>
)}


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
        <th>Order #</th>
        <th>Customer Name</th>
        <th>Date Ordered</th>
        <th>Delivery Date</th>
        <th>Order Type</th>
        <th>Amount</th>
      </tr>
    </thead>
 <tbody>
  {currentOrders.map((order, index) => {
    const customer = customers.find(c => c.id === order?.customer_id);
    const customerName = customer?.name || "Unknown";
    const globalIndex = indexOfFirstItem + index; // global index for selection

    return (
      <tr
        key={order?.id || `order-${globalIndex}`}
        onClick={() => openModal(globalIndex)}
        style={{ cursor: "pointer" }}
      >
        <td onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selectedRows.includes(globalIndex)}
            onChange={() => handleRowCheckbox(globalIndex)}
          />
        </td>
        <td>{order ? formatOrderNumber(order) : "N/A"}</td>
        <td>{customerName}</td>
        <td>{order?.date || "N/A"}</td>
        <td>{order?.delivery_date || "N/A"}</td>
        <td>
          <strong>{order?.order_type || order?.status || "N/A"}</strong>
        </td>
        <td>{order?.amount || "N/A"}</td>
      </tr>
    );
  })}
</tbody>
  </table>
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
    disabled={indexOfLastItem >= filteredOrders.length}
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    Next &rarr;
  </button>
</div>
</div>
</div>

            {/* Add Order Modal */}
            {isAddModalOpen && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal">
                        <h5>Add New Order</h5>
                        <div className="mb-2">
                            <label>Customer Name:</label>
                            <select
                                className="form-control"
                                value={newOrder.customer_id}
                                onChange={(e) => {
                                    const customerId = e.target.value;
                                    const selected = customers.find(c => c.id == customerId);
                                    setNewOrder({
                                        ...newOrder,
                                        customer_id: customerId,
                                        location: selected ? selected.shipping_address : ''
                                    });
                                }}
                            >
                                <option value="">Select a Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-2">
                            <label>Location:</label>
                            <input className="form-control" value={selectedCustomer ? selectedCustomer.shipping_address : ''} readOnly />
                        </div>

                        <div className="mb-2">
                            <label>Date:</label>
                            <input type="date" className="form-control" value={newOrder.date} onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })} />
                        </div>

                        <div className="mb-2">
                            <label>Delivery Date:</label>
                            <input type="date" className="form-control" value={newOrder.delivery_date} onChange={(e) => setNewOrder({ ...newOrder, delivery_date: e.target.value })} />
                        </div>

                        <div className="mb-2">
                            <label>Quantities:</label>
                            <div className="d-flex flex-column gap-2">
                                {/* 350ml */}
                                <div className="d-flex align-items-center gap-2">
                                    <label style={{ width: '100px', flexShrink: 0 }}>350ml:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="350ml"
                                        style={{ maxWidth: '80px' }}
                                        value={newOrder.quantities['350ml']}
                                        onChange={handleQuantityChange}
                                    />
                                    <span>x ₱{PRICES['350ml'].toFixed(2)}</span>
                                    <span className="ms-auto">Total: ₱{productTotals['350ml'].toFixed(2)}</span>
                                </div>
                                {/* 500ml */}
                                <div className="d-flex align-items-center gap-2">
                                    <label style={{ width: '100px', flexShrink: 0 }}>500ml:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="500ml"
                                        style={{ maxWidth: '80px' }}
                                        value={newOrder.quantities['500ml']}
                                        onChange={handleQuantityChange}
                                    />
                                    <span>x ₱{PRICES['500ml'].toFixed(2)}</span>
                                    <span className="ms-auto">Total: ₱{productTotals['500ml'].toFixed(2)}</span>
                                </div>
                                {/* 1L */}
                                <div className="d-flex align-items-center gap-2">
                                    <label style={{ width: '100px', flexShrink: 0 }}>1L:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="1L"
                                        style={{ maxWidth: '80px' }}
                                        value={newOrder.quantities['1L']}
                                        onChange={handleQuantityChange}
                                    />
                                    <span>x ₱{PRICES['1L'].toFixed(2)}</span>
                                    <span className="ms-auto">Total: ₱{productTotals['1L'].toFixed(2)}</span>
                                </div>
                                {/* 6L */}
                                <div className="d-flex align-items-center gap-2">
                                    <label style={{ width: '100px', flexShrink: 0 }}>6L:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="6L"
                                        style={{ maxWidth: '80px' }}
                                        value={newOrder.quantities['6L']}
                                        onChange={handleQuantityChange}
                                    />
                                    <span>x ₱{PRICES['6L'].toFixed(2)}</span>
                                    <span className="ms-auto">Total: ₱{productTotals['6L'].toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <label>Overall Total Amount:</label>
                            <input type="text" className="form-control" value={`₱${grandTotal.toFixed(2)}`} readOnly />
                        </div>

                        <div className="text-end">
                            <button className="btn btn-primary btn-sm me-2" onClick={handleAddOrder}>Submit</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {isModalOpen && selectedOrderIndex !== null && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal">
                        <h5>Order Details</h5>
                        <p><strong>Order #:</strong> {formatOrderNumber(orders[selectedOrderIndex])}</p>
                        <p><strong>Customer Name:</strong> {customers.find(c => c.id === orders[selectedOrderIndex].customer_id)?.name || 'Unknown'}</p>
                        <p><strong>Location:</strong> {orders[selectedOrderIndex].location}</p>
                        <p><strong>Product/s:</strong> {orders[selectedOrderIndex].products}</p>
                        <p><strong>Quantities:</strong></p>
                        <ul>
                            <li>350ml: {orders[selectedOrderIndex]?.quantities?.['350ml'] || 0}</li>
                            <li>500ml: {orders[selectedOrderIndex]?.quantities?.['500ml'] || 0}</li>
                            <li>1L: {orders[selectedOrderIndex]?.quantities?.['1L'] || 0}</li>
                            <li>6L: {orders[selectedOrderIndex]?.quantities?.['6L'] || 0}</li>
                        </ul>
                        <p><strong>Date Ordered:</strong> {orders[selectedOrderIndex].date}</p>
                        <p><strong>Delivery Date:</strong> {orders[selectedOrderIndex].delivery_date}</p>
                        <p><strong>Amount:</strong> {orders[selectedOrderIndex].amount}</p>
                        <div className="mb-3">
                            <label><strong>Order Type:</strong></label>
                            <select
                                className="form-select mt-1"
                                value={tempType}
                                onChange={(e) => setTempType(e.target.value)}
                            >
                                <option value="CSO">CSO</option>
                                <option value="RTV">RTV</option>
                                <option value="Disposal">Disposal</option>
                            </select>
                        </div>
                        <div className="text-end">
                            <button className="btn btn-info btn-sm me-2" onClick={handleGeneratePdf}>Generate PDF</button>
                            <button className="btn btn-primary btn-sm me-2" onClick={handleOk}>OK</button>
                            <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
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

export default SalesOrder;