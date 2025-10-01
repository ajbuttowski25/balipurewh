import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from 'react-router-dom';
import logo from '../assets/bg.png'; // Make sure this path is correct
import './Styles.css';
import { FaRegUser } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import { FaTrash } from "react-icons/fa"; // Import the delete icon
import profile from '../assets/d.png';

function Customers() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedRows, setSelectedRows] = useState([]);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        billing_address: '',
        shipping_address: '',
        bank_details: '',
        tin: '',
        discounts: 0
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [userFullName, setUserFullName] = useState("");
    const [userFirstName, setUserFirstName] = useState("");
    const [employeeID, setEmployeeID] = useState("");

    const isAllSelected = selectedRows.length === customers.length && customers.length > 0;

    // === Helper Functions ===
    const showMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const openViewModal = (customer) => {
        setSelectedCustomer(customer);
        setIsViewModalOpen(true);
    };

    // === Data Fetching ===
    const fetchCustomers = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/customers");
            setCustomers(res.data);
        } catch (err) {
            showMessage("Failed to fetch customers.");
        }
    };
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
    
    // Fetch user and customer data on component mount
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const employeeID = localStorage.getItem("employeeID");
                if (!employeeID) return;
                const response = await axios.get(`http://localhost:8000/api/users/${employeeID}`);
                if (response.data && response.data.name) {
                    setUserName(response.data.name);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserName();
        fetchCustomers();
    }, []);

    // === Handler Functions ===
    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            // Post new customer data to the backend
            const response = await axios.post("http://localhost:8000/api/customers", newCustomer);
            
            // Add the new customer to the local state
            setCustomers(prevCustomers => [...prevCustomers, response.data]);
            
            // Reset the form fields
            setNewCustomer({
                name: '',
                billing_address: '',
                shipping_address: '',
                bank_details: '',
                tin: '',
                discounts: 0
            });
            
            // Close the modal
            setIsAddCustomerModalOpen(false);
            
            // Show a success message
            showMessage("Customer added successfully!");
        } catch (err) {
            console.error("Error adding customer:", err);
            let errorMessage = "An unknown error occurred.";
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.request) {
                errorMessage = "Could not connect to the server. Please check if the backend is running.";
            }
            showMessage(errorMessage);
        }
    };

    const handleDeleteCustomers = async () => {
    const customerIdsToDelete = selectedRows.map(index => customers[index].id);

    if (customerIdsToDelete.length === 0) {
        showMessage("Please select customers to delete.");
        return;
    }

    try {
        for (const id of customerIdsToDelete) {
        await axios.delete(`http://localhost:8000/api/customers/${id}`);
        }

        setCustomers(prevCustomers => 
        prevCustomers.filter(c => !customerIdsToDelete.includes(c.id))
        );
        setSelectedRows([]);
        showMessage("Selected customers deleted successfully!");
    } catch (err) {
        console.error("Error deleting customers:", err);
        showMessage("Failed to delete customers.");
    }
    };

    const handleSelectAll = (e) => {
        setSelectedRows(e.target.checked ? customers.map((_, i) => i) : []);
    };
    
    const handleRowCheckbox = (index) => {
        setSelectedRows(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
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
    <h2 className="topbar-title">Customers</h2>
    <div className="d-flex align-items-center gap-2 mb-3 mt-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      <div className="d-flex justify-content-end gap-2 ms-auto">
        <button className="btn btn-primary btn-sm" onClick={() => setIsAddCustomerModalOpen(true)}>+ New Customer</button>
        <button 
            className="btn btn-danger btn-sm" 
            onClick={handleDeleteCustomers}
        >
            <FaTrash /> Delete
        </button>
      </div>
    </div>
                    
<div className="topbar-inventory-box mt-4" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
  <table className="custom-table">
    <thead>
      <tr>
        <th>
          <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
        </th>
        <th>ID</th>
        <th>Name</th>
        <th>Billing Address</th>
        <th>Shipping Address</th>
        <th>TIN</th>
      </tr>
    </thead>
    <tbody>
      {customers.map((customer, index) => (
        <tr
          key={customer.id}
          onClick={() => openViewModal(customer)}
          style={{ cursor: 'pointer' }}
        >
          <td onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedRows.includes(index)}
              onChange={() => handleRowCheckbox(index)}
            />
          </td>
          <td>{customer.id}</td>
          <td>{customer.name}</td>
          <td>{customer.billing_address}</td>
          <td>{customer.shipping_address}</td>
          <td>{customer.tin || 'N/A'}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


{isAddCustomerModalOpen && (
  <div className="custom-modal-backdrop">
    <div className="custom-modal">
      <h5>Add New Customer</h5>

      <div className="mb-2">
        <label className="form-label">Customer Name</label>
        <input
          type="text"
          className="form-control"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Billing Address</label>
        <input
          type="text"
          className="form-control"
          value={newCustomer.billing_address}
          onChange={(e) => setNewCustomer({ ...newCustomer, billing_address: e.target.value })}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Shipping Address</label>
        <input
          type="text"
          className="form-control"
          value={newCustomer.shipping_address}
          onChange={(e) => setNewCustomer({ ...newCustomer, shipping_address: e.target.value })}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Bank Details</label>
        <input
          type="text"
          className="form-control"
          value={newCustomer.bank_details}
          onChange={(e) => setNewCustomer({ ...newCustomer, bank_details: e.target.value })}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">TIN</label>
        <input
          type="text"
          className="form-control"
          value={newCustomer.tin}
          onChange={(e) => setNewCustomer({ ...newCustomer, tin: e.target.value })}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Discounts</label>
        <input
          type="number"
          className="form-control"
          value={newCustomer.discounts}
          onChange={(e) => setNewCustomer({ ...newCustomer, discounts: e.target.value })}
        />
      </div>

      <div className="text-end">
        <button className="btn btn-primary btn-sm me-2" onClick={handleAddCustomer}>
          Save
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setIsAddCustomerModalOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    {/* View Customer Details Modal */}
    {isViewModalOpen && selectedCustomer && (
        <div className="custom-modal-backdrop">
            <div className="custom-modal">
                <h2>Customer Details</h2>
                <p><strong>ID:</strong> {selectedCustomer.id}</p>
                <p><strong>Name:</strong> {selectedCustomer.name}</p>
                <p><strong>Billing Address:</strong> {selectedCustomer.billing_address}</p>
                <p><strong>Shipping Address:</strong> {selectedCustomer.shipping_address}</p>
                <p><strong>TIN:</strong> {selectedCustomer.tin || 'N/A'}</p>
                <p><strong>Discounts:</strong> {selectedCustomer.discounts}</p>
                <p><strong>Bank Details:</strong> {selectedCustomer.bank_details || 'N/A'}</p>
                <button onClick={() => setIsViewModalOpen(false)} className="cancel-button">Close</button>
            </div>
        </div>
    )}
</div>
{successMessage && <div className="success-message">{successMessage}</div>}
</div>
);
}

export default Customers;
