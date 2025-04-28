import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OTP from "./pages/OTP.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/otp-verification/:email" element={<OTP />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
      </Routes>
      <ToastContainer theme={"dark"} />
    </Router>
  );
};

export default App;
