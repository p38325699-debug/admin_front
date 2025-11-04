// src/pages/UserTable.jsx
import React, { useState, useEffect } from "react";
import { FaTrash, FaCheck, FaSearch, FaTimes } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { FaAward, FaGem, FaCrown, FaStar, FaMedal } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    trust: "",
    verified: "",
    businessPlan: "",
    country: "",
    gender: ""
  });

  // Apply filters whenever users or filters change
  useEffect(() => {
    const filtered = users.filter(user => {
      // Search filter (name, email, phone, ref code)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          user.full_name?.toLowerCase(),
          user.email?.toLowerCase(),
          user.phone_number?.toLowerCase(),
          user.reference_code?.toLowerCase(),
          user.country_code?.toLowerCase()
        ].filter(Boolean);
        
        if (!searchableFields.some(field => field.includes(searchTerm))) {
          return false;
        }
      }

      // Status filter
      if (filters.status && user.tempStatus !== filters.status) {
        return false;
      }

      // Trust filter
      if (filters.trust !== "") {
        const trustValue = filters.trust === "true";
        if (user.trust !== trustValue) {
          return false;
        }
      }

      // Verified filter
      if (filters.verified !== "") {
        const verifiedValue = filters.verified === "true";
        if (user.verified !== verifiedValue) {
          return false;
        }
      }

      // Business plan filter
      if (filters.businessPlan && user.business_plan !== filters.businessPlan) {
        return false;
      }

      // Country filter
      if (filters.country && user.country_code !== filters.country) {
        return false;
      }

      // Gender filter
      if (filters.gender && user.gender !== filters.gender) {
        return false;
      }

      return true;
    });

    setFilteredUsers(filtered);
  }, [users, filters]);

  // Get unique values for filter dropdowns
  const uniqueBusinessPlans = [...new Set(users.map(u => u.business_plan).filter(Boolean))];
  const uniqueCountries = [...new Set(users.map(u => u.country_code).filter(Boolean))];
  const uniqueGenders = [...new Set(users.map(u => u.gender).filter(Boolean))];

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      trust: "",
      verified: "",
      businessPlan: "",
      country: "",
      gender: ""
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  useEffect(() => {
    const saved = localStorage.getItem("users");
    if (saved) {
      setUsers(JSON.parse(saved));
    }

    fetch(`${BASE_URL}/api/users/all-users`)
      .then((res) => res.json())
      .then((data) => {
        const usersArray = Array.isArray(data) ? data : data.users || [];
        const formatted = usersArray.map((u) => ({
          ...u,
          wallet: u.coin ?? 0,
          dob: u.dob ? new Date(u.dob).toISOString().split("T")[0] : "-",
          createdAt: u.created_at
            ? new Date(u.created_at).toISOString().split("T")[0]
            : "-",
          pause_start: u.pause_start || null,
          block_date: u.block_date || null,
          tempStatus: u.status || "ok",
          trust: Boolean(u.trust),
          editingWallet: false,
        }));

        setUsers(formatted);
        localStorage.setItem("users", JSON.stringify(formatted)); // ✅ update cache
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const isPauseExpired = (pauseStartDate) => {
    const pauseStart = new Date(pauseStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - pauseStart);
    const diffMinutes = Math.floor(diffTime / (1000 * 60)); // difference in minutes
    return diffMinutes >= 5; // expire after 5 min
  };

  // Auto-update expired pause to "ok"
  const autoUpdatePauseToAllOk = (id) => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ok" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, ...data.user, tempStatus: "ok" } : u
            )
          );
        }
      })
      .catch((err) => console.error("Error auto-updating status:", err));
  };

  // Temporary trust state (similar to tempStatus)
  const handleTempTrustChange = (id, newValue) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, tempTrust: newValue } : u
      )
    );
  };

  const confirmTrustChange = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    // Use tempTrust if set, otherwise keep current trust
    const newTrust = user.tempTrust !== undefined ? user.tempTrust : user.trust;

    fetch(`${BASE_URL}/api/users/${id}/trust`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trust: newTrust }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, trust: newTrust, tempTrust: undefined } : u
            )
          );
          alert(`Trust status updated: ${newTrust ? "✅ True" : "❌ False"}`);
        } else {
          alert("Failed to update trust status");
        }
      })
      .catch((err) => {
        console.error("Error updating trust:", err);
        alert("Error updating trust status");
      });
  };

  // Confirm status change
  const confirmStatusChange = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    let finalStatus = user.tempStatus;

    const updateData = { status: finalStatus };

    if (finalStatus === "pause") {
      updateData.pause_start = new Date().toISOString();
      updateData.block_date = null;
    } else if (finalStatus === "block") {
      updateData.block_date = new Date().toISOString();
      updateData.pause_start = null;
    } else if (finalStatus === "ok") {
      updateData.pause_start = null;
      updateData.block_date = null;
    }

    console.log("Sending status update:", updateData); // Debug log

    fetch(`${BASE_URL}/api/admin/users/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Status API Response:", data); // Debug log
        if (data.success && data.user) {

          setUsers((prev) => {
            const updated = prev.map((u) =>
              u.id === id
                ? {
                    ...u,
                    ...data.user,
                    tempStatus: data.user.status,
                    pause_start: data.user.pause_start || null,
                    block_date: data.user.block_date || null,
                  }
                : u
            );
            localStorage.setItem("users", JSON.stringify(updated)); // ✅ persist
            return updated;
          });

          alert("Status changed ✅");
        } else {
          alert("Status changed ✅");
        }
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        alert("Error updating status");
      });
  };

  // Temp status change
  const handleTempStatusChange = (id, newStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, tempStatus: newStatus } : u))
    );
  };

  // Delete user
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user permanently?")) {
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== id));
        } else {
          console.error("Error deleting user");
        }
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  const getStatusDate = (user) => {
    let pauseDate = user.pause_start ? new Date(user.pause_start).toLocaleDateString() : "-";
    let blockDate = user.block_date ? new Date(user.block_date).toLocaleDateString() : "-";

    // If status is being changed right now, show today's date
    if (user.tempStatus !== user.status) {
      if (user.tempStatus === "pause") pauseDate = new Date().toLocaleDateString();
      if (user.tempStatus === "block") blockDate = new Date().toLocaleDateString();
    }

    return { pauseDate, blockDate };
  };

  return (
    <div
      className="max-w-[78vw] h-[80vh] mx-0 bg-[#1f1f1f] rounded-xl shadow-lg p-6 scrollbar-hide"
      style={{ overflow: "auto" }}
    >
      <h2 className="text-xl font-bold mb-6 text-white flex-shrink-0">
        User List {filteredUsers.length !== users.length && `(${filteredUsers.length}/${users.length})`}
      </h2>

      {/* FILTER SECTION */}
      <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full p-2 pl-8 bg-[#1f1f1f] text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              />
              <FaSearch className="absolute left-2 top-3 text-gray-400" />
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 bg-[#1f1f1f] text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="ok">Ok</option>
              <option value="pause">Pause</option>
              <option value="block">Block</option>
            </select>
          </div>

          {/* Trust Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Trust
            </label>
            <select
              value={filters.trust}
              onChange={(e) => setFilters(prev => ({ ...prev, trust: e.target.value }))}
              className="w-full p-2 bg-[#1f1f1f] text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Trust</option>
              <option value="true">Trusted</option>
              <option value="false">Not Trusted</option>
            </select>
          </div>

          {/* Verified Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Verified
            </label>
            <select
              value={filters.verified}
              onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
              className="w-full p-2 bg-[#1f1f1f] text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Business Plan Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Business Plan
            </label>
            <select
              value={filters.businessPlan}
              onChange={(e) => setFilters(prev => ({ ...prev, businessPlan: e.target.value }))}
              className="w-full p-2 bg-[#1f1f1f] text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Plans</option>
              {uniqueBusinessPlans.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="w-full p-2 bg-[#1f1f1f] text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full p-2 bg-[#1f1f1f] text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Genders</option>
              {uniqueGenders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <FaTimes />
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <style>
        {`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .trust-icon {
          cursor: pointer;
          transition: opacity 0.3s ease;
          font-size: 16px;
        }
        .trust-icon.active {
          opacity: 1;
        }
        .trust-icon.inactive {
          opacity: 0.3;
        }
      `}
      </style>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <table className="min-w-full text-sm border-separate border-spacing-y-2 table-fixed">
          <thead className="sticky top-0 bg-[#2a2a2a] text-gray-300 z-10 rounded-lg">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">DOB</th>
              <th className="px-6 py-3 text-left">Country</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Gender</th>
              <th className="px-6 py-3 text-left">Verified</th>
              <th className="px-6 py-3 text-left">Wallet</th>
              <th className="px-6 py-3 text-left">Business Plan</th>
              <th className="px-6 py-3 text-left">Gold1 Count</th> 
              <th className="px-6 py-3 text-left">Day Count</th>
              <th className="px-6 py-3 text-left">Trust</th>
              <th className="px-6 py-3 text-left">Under Ref</th>
              <th className="px-6 py-3 text-left">Ref Count</th>
              <th className="px-6 py-3 text-left">Ref Code</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Pause/Block Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="19"
                  className="p-6 text-center text-gray-400 bg-[#2a2a2a] rounded-lg"
                >
                  {users.length === 0 ? "No data available" : "No users match your filters"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="bg-[#292828] hover:bg-[#333] text-gray-200 rounded-lg"
                >
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    {u.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-nowrap">{u.dob}</td>
                  <td className="px-6 py-4">{u.country_code}</td>
                  <td className="px-6 py-4">{u.phone_number}</td>
                  <td className="px-6 py-4">{u.gender || "-"}</td>
                  <td className="px-6 py-4">{u.verified ? "✅" : "❌"}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {u.editingWallet ? (
                      <input
                        type="number"
                        value={u.wallet}
                        onChange={(e) =>
                          setUsers((prev) =>
                            prev.map((user) =>
                              user.id === u.id ? { ...user, wallet: e.target.value } : user
                            )
                          )
                        }
                        onBlur={() => {
                          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${u.id}/wallet`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ coin: parseFloat(u.wallet) }),
                          })
                            .then((res) => res.json())
                            .then(() => {
                              setUsers((prev) =>
                                prev.map((user) =>
                                  user.id === u.id ? { ...user, editingWallet: false } : user
                                )
                              );
                            });
                        }}
                        className="bg-[#1f1f1f] text-white p-1 rounded w-20"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span>${u.wallet ? Number(u.wallet).toFixed(2) : "0.00"}</span>
                        <FaEdit
                          className="text-gray-400 cursor-pointer hover:text-white"
                          onClick={() =>
                            setUsers((prev) =>
                              prev.map((user) =>
                                user.id === u.id ? { ...user, editingWallet: true } : user
                              )
                            )
                          }
                        />
                      </>
                    )}
                  </td>

                  <td className="px-6 py-4">{u.business_plan || "-"}</td>
                  <td className="p-3">{u.gold1_count}</td>
                  <td className="px-6 py-4">{u.day_count ?? "-"}</td>
                  
                  {/* Trust Column */}
                  <td className="px-6 py-4 flex items-center gap-2">
                    <select
                      value={u.tempTrust !== undefined ? (u.tempTrust ? "true" : "false") : (u.trust ? "true" : "false")}
                      onChange={(e) => handleTempTrustChange(u.id, e.target.value === "true")}
                      className="border rounded p-1"
                    >
                      <option className="text-black font-bold" value="true">True</option>
                      <option className="text-black font-bold" value="false">False</option>
                    </select>
                    <button
                      onClick={() => confirmTrustChange(u.id)}
                      className="text-green-400 cursor-pointer hover:text-green-600"
                      title="Save trust changes"
                    >
                      <FaCheck />
                    </button>
                  </td>

                  <td className="px-6 py-4">{u.under_ref || "-"}</td>
                  <td className="px-6 py-4">{u.reference_count ?? 0}</td>
                  <td className="px-6 py-4">{u.reference_code || "-"}</td>
                  <td className="px-6 py-4 text-nowrap">{u.createdAt}</td>

                  {/* Status Column */}
                  <td className="px-6 py-4 flex items-center gap-2">
                    <select
                      value={u.tempStatus ?? u.status}
                      onChange={(e) => handleTempStatusChange(u.id, e.target.value)}
                      className="border rounded p-1 "
                    >
                      <option className="text-black font-bold" value="ok">Ok</option>
                      <option className="text-black font-bold" value="pause">Pause</option>
                      <option className="text-black font-bold" value="block">Block</option>
                    </select>
                    <button
                      onClick={() => confirmStatusChange(u.id)}
                      className="text-green-400 cursor-pointer hover:text-green-600"
                      title="Save status changes"
                    >
                      <FaCheck />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="block">Pause: {getStatusDate(u).pauseDate}</span>
                      <span className="block">Block: {getStatusDate(u).blockDate}</span>

                      {u.tempStatus === "pause" && u.pause_start && isPauseExpired(u.pause_start) && (
                        <span className="text-yellow-400 text-xs block">(Expired)</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;