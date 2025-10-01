import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import PurchaseOrder from "./pages/PurchaseOrder";
import Demand from "./pages/Demand";
import Reports from "./pages/Reports";
import SalesOrder from "./pages/SalesOrder";
import UserManagement from "./pages/UserManagement";
import PrivateRoute from "./PrivateRoute";
import Records from "./pages/Record";
import Forecast from './pages/Forecast';
import ForecastChart from "./pages/ForecastChart";
import Customers from './pages/Customers';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
        <Route path="/sales-order" element={<PrivateRoute><SalesOrder /></PrivateRoute>} />
        <Route path="/purchase-order" element={<PrivateRoute><PurchaseOrder /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/overview/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
        <Route path="/overview/demand" element={<PrivateRoute><Demand /></PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/record" element={<PrivateRoute><Records /></PrivateRoute>} />
        <Route path="/forecast" element={<PrivateRoute><Forecast /></PrivateRoute>} />
        <Route path="/forecast" element={<PrivateRoute><ForecastChart /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
