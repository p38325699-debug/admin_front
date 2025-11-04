// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const loginTime = localStorage.getItem("loginTime");

  if (!isLoggedIn || !loginTime) return <Navigate to="/" replace />;

  const now = Date.now();
  const elapsed = now - parseInt(loginTime, 10);
  const fifteenMinutes = 15 * 60 * 1000;

  if (elapsed > fifteenMinutes) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    alert("Session expired. Please log in again.");
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
