import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaMoneyBillWave, FaHistory, FaCheck, FaTimes, FaClock, FaSync, FaFilter, FaUser, FaEnvelope, FaCalendar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const [filters, setFilters] = useState({ 
    from: "", 
    to: "", 
    status: "all" 
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/withdrawals/all`);
      const data = await res.json();
      if (data.success) {
        setAllWithdrawals(data.data);
        setWithdrawals(data.data);
        calculateStats(data.data);
      } else {
        console.error("Failed to load withdrawals");
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };
  

  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(w => w.status === 'pending').length;
    const completed = data.filter(w => w.status === 'completed').length;
    const rejected = data.filter(w => w.status === 'rejected').length;
    const totalAmount = data
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + parseFloat(w.amount), 0);

    setStats({ total, pending, completed, rejected, totalAmount });
  };

  const applyFilters = () => {
    let filtered = [...allWithdrawals];
    
    if (filters.from) {
      const fromDate = new Date(filters.from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(w => {
        const withdrawalDate = new Date(w.created_at);
        withdrawalDate.setHours(0, 0, 0, 0);
        return withdrawalDate >= fromDate;
      });
    }
    
    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(w => new Date(w.created_at) <= toDate);
    }
    
    if (filters.status !== "all") {
      filtered = filtered.filter(w => w.status === filters.status);
    }
    
    setWithdrawals(filtered);
  };

  const clearFilters = () => {
    setFilters({ from: "", to: "", status: "all" });
    setWithdrawals(allWithdrawals);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/withdrawals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      
      if (data.success) {
        const updatedWithdrawals = withdrawals.map(w =>
          w.id === id ? { ...w, status: newStatus } : w
        );
        const updatedAllWithdrawals = allWithdrawals.map(w =>
          w.id === id ? { ...w, status: newStatus } : w
        );
        
        setWithdrawals(updatedWithdrawals);
        setAllWithdrawals(updatedAllWithdrawals);
        calculateStats(updatedAllWithdrawals);
      } else {
        console.error("Failed to update withdrawal status");
      }
    } catch (err) {
      console.error("Error updating withdrawal status:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheck className="text-green-400 text-xs" />;
      case "rejected":
        return <FaTimes className="text-red-400 text-xs" />;
      case "pending":
        return <FaClock className="text-yellow-400 text-xs" />;
      default:
        return <FaClock className="text-gray-400 text-xs" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusButtons = (currentStatus, id) => {
    if (currentStatus === 'pending') {
      return (
        <div className="flex gap-1">
          <button
            onClick={() => handleStatusUpdate(id, 'completed')}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 px-2 py-1 rounded transition-all duration-300 border border-green-500/30 hover:border-green-500/50 text-xs"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusUpdate(id, 'rejected')}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-2 py-1 rounded transition-all duration-300 border border-red-500/30 hover:border-red-500/50 text-xs"
          >
            Reject
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-4 border border-gray-800 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 bg-[#1f1f1f] hover:bg-[#333] text-gray-300 px-3 py-2 rounded-lg transition-all duration-300 border border-gray-700 hover:border-violet-500/50 text-sm"
          >
            <FaArrowLeft className="text-violet-400 text-xs" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                💰 Withdrawal Management
              </h2>
              <p className="text-gray-400 text-xs">
                Manage user withdrawal requests
              </p>
            </div>

            {!loading && (
              <div className="flex items-center gap-1 bg-[#1f1f1f] ml-16 rounded-lg px-3 py-1 border border-gray-700">
                <div className="text-gray-400 text-xs">Total:</div>
                <div className="font-bold text-white text-sm">
                  {stats.total}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={fetchWithdrawals}
          className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50 text-sm"
        >
          <FaSync size={12} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-[#1f1f1f] rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-violet-500/20 rounded">
                <FaMoneyBillWave className="text-violet-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Amount</p>
                <p className="text-white font-bold text-sm">${stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1f1f1f] rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-yellow-500/20 rounded">
                <FaClock className="text-yellow-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Pending</p>
                <p className="text-white font-bold text-sm">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1f1f1f] rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-green-500/20 rounded">
                <FaCheck className="text-green-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Completed</p>
                <p className="text-white font-bold text-sm">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1f1f1f] rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-red-500/20 rounded">
                <FaTimes className="text-red-400 text-sm" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Rejected</p>
                <p className="text-white font-bold text-sm">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-3">
        <div>
          <label className="text-gray-300 text-xs mb-1 block">From Date</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="w-full bg-[#2a2a2a] border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
          />
        </div>
        <div>
          <label className="text-gray-300 text-xs mb-1 block">To Date</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="w-full bg-[#2a2a2a] border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
          />
        </div>
        <div>
          <label className="text-gray-300 text-xs mb-1 block">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full bg-[#2a2a2a] border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-1 justify-center text-sm"
          >
            <FaFilter size={10} />
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-all text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      
      {(filters.from || filters.to || filters.status !== "all") && (
        <div className="mb-3 text-xs text-gray-400">
          Showing {withdrawals.length} of {allWithdrawals.length} withdrawals
        </div>
      )}

      {/* Table Container */}
      {!loading && (
        <div className="overflow-hidden rounded-lg border border-gray-700">
          <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            <table className="min-w-full text-xs border-separate border-spacing-y-1">
              <thead className="sticky top-0 bg-[#2a2a2a] text-gray-300 z-10">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">ID</th>
                  <th className="px-4 py-2 text-left font-semibold">User Info</th>
                  <th className="px-4 py-2 text-left font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Message</th>
                  <th className="px-4 py-2 text-left font-semibold">Method</th>
                  <th className="px-4 py-2 text-left font-semibold">Details</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.length > 0 ? (
                  withdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="bg-[#1f1f1f] hover:bg-[#333] text-gray-300 transition-all duration-200"
                    >
                      {/* ID */}
                      <td className="px-4 py-2 font-mono text-violet-400 text-xs">
                        {withdrawal.id}
                      </td>

                      {/* User Info */}
                      <td className="px-4 py-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <FaUser className="text-blue-400 text-xs" />
                            <span className="text-xs">
                              {withdrawal.full_name || `User ${withdrawal.user_id}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaEnvelope className="text-green-400 text-xs" />
                            <span className="text-xs text-gray-400">{withdrawal.email}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            ID: {withdrawal.user_id}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-2">
                        <span className="font-bold text-white text-sm">
                          ${parseFloat(withdrawal.amount).toFixed(2)}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="px-4 py-2 max-w-[150px]">
                        <div
                          className="leading-relaxed text-xs"
                          title={withdrawal.message}
                        >
                          {withdrawal.message || "No message"}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-2">
                        <span className="text-xs font-medium text-blue-400 capitalize">
                          {withdrawal.method || "N/A"}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-2 max-w-[180px]">
                        <button
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="text-xs cursor-pointer text-violet-400 hover:text-violet-300 underline"
                        >
                          View Details
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded border ${getStatusColor(
                            withdrawal.status
                          )}`}
                        >
                          {getStatusIcon(withdrawal.status)}
                          <span className="font-medium capitalize text-xs">
                            {withdrawal.status}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <FaCalendar className="text-xs" />
                          <span className="text-xs">
                            {new Date(withdrawal.created_at).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2">
                        {getStatusButtons(withdrawal.status, withdrawal.id)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <FaHistory className="text-2xl mb-2 opacity-50" />
                        <p className="text-sm font-medium">No withdrawal requests found</p>
                        <p className="text-xs mt-0.5">
                          {(filters.from || filters.to || filters.status !== "all")
                            ? "Try changing your filter criteria"
                            : "No withdrawal requests yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add the popup rendering here */}
      {selectedWithdrawal && (
        <MethodDetailsPopup
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
        />
      )}
    </div>
  );
};

const MethodDetailsPopup = ({ withdrawal, onClose }) => {
  if (!withdrawal) return null;

  // Convert method to lowercase for consistent comparison
  const method = withdrawal.method?.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-6 w-96 max-w-90vw relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-violet-400 mb-4 text-center">
          {withdrawal.method} Details
        </h3>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="bg-[#2a2a2a] rounded-lg p-3">
            <h4 className="text-white font-semibold mb-2 text-sm">Basic Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Amount:</span>
                <p className="text-white font-semibold">${parseFloat(withdrawal.amount).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <p className="text-yellow-400 font-semibold capitalize">{withdrawal.status}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Date:</span>
                <p className="text-white">{new Date(withdrawal.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Method Specific Details */}
          <div className="bg-[#2a2a2a] rounded-lg p-3">
            <h4 className="text-white font-semibold mb-2 text-sm">Payment Details</h4>
            
            {method === "upi" && (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400">UPI Address:</span>
                  <p className="text-white font-mono">{withdrawal.upi_address || "N/A"}</p>
                </div>
              </div>
            )}

            {method === "crypto" && (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400">Crypto Address:</span>
                  <p className="text-white font-mono break-all">{withdrawal.crypto_address || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-400">Network:</span>
                  <p className="text-white">{withdrawal.crypto_network || "N/A"}</p>
                </div>
              </div>
            )}

            {method === "bank" && (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400">Account Holder:</span>
                  <p className="text-white">{withdrawal.bank_holder_name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-400">Bank Name:</span>
                  <p className="text-white">{withdrawal.bank_name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-400">IFSC Code:</span>
                  <p className="text-white font-mono">{withdrawal.ifsc_code || "N/A"}</p>
                </div>
              </div>
            )}

            {!["upi", "crypto", "bank"].includes(method) && (
              <p className="text-gray-400 text-center text-xs">No payment details available.</p>
            )}
          </div>

          {/* User Information */}
          <div className="bg-[#2a2a2a] rounded-lg p-3">
            <h4 className="text-white font-semibold mb-2 text-sm">User Information</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400">Full Name:</span>
                <p className="text-white">{withdrawal.full_name || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white">{withdrawal.email || "N/A"}</p>
              </div>
              
            </div>
          </div>
        </div>

        {/* Message if available */}
        {withdrawal.message && (
          <div className="bg-[#2a2a2a] rounded-lg p-3 mt-3">
            <h4 className="text-white font-semibold mb-2 text-sm">Message</h4>
            <p className="text-gray-300 text-xs">{withdrawal.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalPage;