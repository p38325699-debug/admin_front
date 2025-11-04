import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ new

import Dashboard from "./pages/Dashboard";
import UserTable from "./pages/UserTable";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

import HomeData from "./pages/HomeData";
import TaskData from "./pages/TaskData";
import QuizForm from "./pages/quiz_form";
import QuizTable from "./pages/quiz_table";
import PaymentPage from "./pages/PaymentPage";
import NotificationsPage from "./pages/NotificationsPage";
import UPIScanner from "./pages/UPIScanner";
import WithdrawalPage from "./pages/WithdrawalPage";
import CryptoPay from "./pages/CryptoPay";
import GoldMembers from "./pages/GoldMembers";
import PlanPurchases from "./pages/PlanPurchases";
import RefRedirect from "./pages/RefRedirect";
import ContactMsg from "./pages/ContactMsg";

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const hiddenRoutes = ["/"];
  const hideLayout = hiddenRoutes.includes(location.pathname);

  return (
    <div className="flex bg-black min-h-screen text-white">
      {!hideLayout && isSidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-60 bg-gray-900 z-40 transition-all duration-300">
          <Sidebar />
        </div>
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          !hideLayout && isSidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        {!hideLayout && (
          <div className="sticky top-0 z-30 bg-gray-950 shadow-md">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
        )}

        <main className="flex-1 p-6">
          <Routes>
            {/* Login Page */}
            <Route path="/" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/user-table" element={<ProtectedRoute element={<UserTable />} />} />
            <Route path="/home-data" element={<ProtectedRoute element={<HomeData />} />} />
            <Route path="/task-data" element={<ProtectedRoute element={<TaskData />} />} />
            <Route path="/quiz_form" element={<ProtectedRoute element={<QuizForm />} />} />
            <Route path="/quiz_table" element={<ProtectedRoute element={<QuizTable />} />} />
            <Route path="/payment" element={<ProtectedRoute element={<PaymentPage />} />} />
            <Route path="/notifications" element={<ProtectedRoute element={<NotificationsPage />} />} />
            <Route path="/withdrawal" element={<ProtectedRoute element={<WithdrawalPage />} />} />
            <Route path="/upi-scanner" element={<ProtectedRoute element={<UPIScanner />} />} />
            <Route path="/crypto-pay" element={<ProtectedRoute element={<CryptoPay />} />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
            <Route path="/gold-members" element={<ProtectedRoute element={<GoldMembers />} />} />
            <Route path="/plan-purchases" element={<ProtectedRoute element={<PlanPurchases />} />} />
            <Route path="/referral" element={<ProtectedRoute element={<RefRedirect />} />} />
            <Route path="/contact-msg" element={<ProtectedRoute element={<ContactMsg/>} />} />

            {/* Default fallback */}
            <Route path="*" element={<ProtectedRoute element={<Dashboard />} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppLayout />
  </Router>
);

export default App;
