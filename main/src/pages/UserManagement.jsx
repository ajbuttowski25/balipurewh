import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "./logo.jpg";
import "./Styles.css";
import axios from "axios";
import { FaRegUser, FaEdit, FaTrash } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineDashboard, MdOutlineInventory2 } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { BiPurchaseTag } from "react-icons/bi";
import profile from '../assets/d.png';

function UserManagement() {
  const [userFullName, setUserFullName] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const storedEmployeeID = localStorage.getItem("employeeID");
  const storedRole = localStorage.getItem("role");

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

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

  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    employeeID: "",
    contact: "",
    password: "",
    role: "Employee",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const employeeID = localStorage.getItem("employeeID");
        if (!employeeID) return;
        const res = await axios.get(`http://localhost:8000/api/users/${employeeID}`);
        if (res.data) setUserName(`${res.data.firstname} ${res.data.lastname}`);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserName();
  }, []);

  if (!storedEmployeeID) {
    window.location.href = "/";
    return null;
  }
  if (storedRole !== "Admin") {
    alert("Access denied. Only admins allowed.");
    window.location.href = "/dashboard";
    return null;
  }

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add user
  const handleAddUser = async () => {
    if (!newUser.firstname || !newUser.lastname || !newUser.email || !newUser.employeeID || !newUser.password) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      setAdding(true);
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
      const res = await axios.post("http://localhost:8000/api/users", newUser);
      const created = res.data?.user || res.data;
      if (created?.id) setUsers((prev) => [created, ...prev]);
      else fetchUsers();
      setNewUser({
        firstname: "",
        lastname: "",
        email: "",
        employeeID: "",
        contact: "",
        password: "",
        role: "Employee",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user.");
    } finally {
      setAdding(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await axios.put(`http://localhost:8000/api/users/${editingUser.id}`, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`http://localhost:8000/api/users/${id}`);
      alert("User deleted.");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  // Apply search + role filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.firstname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.lastname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employeeID || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.contact || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

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

      {/* Main */}
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
<h2 className="topbar-title">Accounts</h2>
          {/* Search + Role Filter + Add User */}
<div className="d-flex flex-wrap align-items-center gap-2 mb-3 mt-3">
  {/* Search */}
  <input
    type="text"
    placeholder="Search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="form-control"
    style={{ width: "250px" }}
  />
    {/* Role Filter */}
  <select
    className="custom-select"
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value)}
  >
    <option value="">All Roles  </option>
    <option value="Employee">Employee</option>
    <option value="Admin">Admin</option>
  </select>

  {/* Right-aligned button */}
  <div className="ms-auto d-flex gap-2">
    <button
      className="btn btn-primary btn-sm"
      data-bs-toggle="modal"
      data-bs-target="#addUserModal"
    >
      + Create Account
    </button>
  </div>
</div>

<div className="topbar-inventory-box mt-4" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          {/* Users Table */}
          <table className="custom-table">
            <thead>
              <tr>
                <th>Lastname</th>
                <th>Firstname</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>Contact</th>
                <th>Role</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.lastname || "—"}</td>
                    <td>{u.firstname || "—"}</td>
                    <td>{u.email || "—"}</td>
                    <td>{u.employeeID || "—"}</td>
                    <td>{u.contact || "—"}</td>
                    <td>
                      <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                        {u.role || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => setEditingUser({ ...u })}
                          className="btn btn-warning btn-sm me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#editUserModal"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn btn-danger btn-sm"
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? "..." : <FaTrash />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <div className="modal fade" id="addUserModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Create Account</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <label>Lastname:</label>
              <input type="text" value={newUser.lastname}
                onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })} className="form-control mb-2" />

              <label>Firstname:</label>
              <input type="text" value={newUser.firstname}
                onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })} className="form-control mb-2" />

              <label>Email:</label>
              <input type="email" value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="form-control mb-2" />

              <label>Employee ID:</label>
              <input type="text" value={newUser.employeeID}
                onChange={(e) => setNewUser({ ...newUser, employeeID: e.target.value })} className="form-control mb-2" />

              <label>Contact:</label>
              <input type="text" value={newUser.contact}
                onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })} className="form-control mb-2" />

              <label>Password:</label>
              <input type="password" value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="form-control mb-2" />

              <label>Role:</label>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="form-control mb-2">
                <option>Employee</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-success" onClick={handleAddUser} data-bs-dismiss="modal" disabled={adding}>
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <div className="modal fade" id="editUserModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {editingUser && (
                <>
                  <label>Lastname:</label>
                  <input type="text" value={editingUser.lastname || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })} className="form-control mb-2" />

                  <label>Firstname:</label>
                  <input type="text" value={editingUser.firstname || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, firstname: e.target.value })} className="form-control mb-2" />

                  <label>Email:</label>
                  <input type="email" value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="form-control mb-2" />

                  <label>Employee ID:</label>
                  <input type="text" value={editingUser.employeeID || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, employeeID: e.target.value })} className="form-control mb-2" />

                  <label>Contact:</label>
                  <input type="text" value={editingUser.contact || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, contact: e.target.value })} className="form-control mb-2" />

                  <label>Role:</label>
                  <select value={editingUser.role || "Employee"}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="form-control mb-2">
                    <option>Employee</option>
                    <option>Admin</option>
                  </select>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-warning" onClick={handleUpdateUser} data-bs-dismiss="modal">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
