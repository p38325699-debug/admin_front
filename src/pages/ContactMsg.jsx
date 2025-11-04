import React, { useEffect, useState } from "react";
import { 
  FaTrash, 
  FaExclamationTriangle, 
  FaCheck, 
  FaEnvelope, 
  FaUser, 
  FaClock, 
  FaSearch, 
  FaFilter,
  FaTimes
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ContactMsg = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Get unique emails for filter
  const uniqueEmails = [...new Set(messages.map(msg => msg.email))];

  const fetchMessages = async () => {
    try {
      setError(null);
      const res = await fetch(`${BASE_URL}/api/contact-messages`);
      const data = await res.json();
      setMessages(data);
      setFilteredMessages(data);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...messages];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply email filter
    if (selectedEmail) {
      filtered = filtered.filter(msg => msg.email === selectedEmail);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.submitted_at) - new Date(a.submitted_at);
        case "oldest":
          return new Date(a.submitted_at) - new Date(b.submitted_at);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredMessages(filtered);
  }, [messages, searchTerm, selectedEmail, sortBy]);

 const handleDelete = async (id) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact-messages/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete message");
    }

    setMessages(messages.filter((msg) => msg.id !== id));
  } catch (err) {
    console.error("❌ Error deleting message:", err);
  }
};


  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEmail("");
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-300 animate-pulse">Loading messages...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800 shadow-2xl mx-4 my-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                📩 Contact Messages
              </h2>
              <p className="text-gray-400 text-sm">
                Manage user contact messages and inquiries
              </p>
            </div>

            {/* Total Count */}
            <div className="flex items-center gap-2 bg-[#1f1f1f] rounded-xl px-4 py-2 border border-gray-700">
              <div className="text-gray-400 text-sm">Total:</div>
              <div className="text-xl font-bold text-white">
                {filteredMessages.length}
              </div>
              {filteredMessages.length !== messages.length && (
                <div className="text-xs text-gray-500 ml-2">
                  of {messages.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-4 bg-[#1f1f1f] rounded-xl border border-gray-800">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">
              Search Messages
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Email Filter */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">
              Filter by Email
            </label>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="">All Emails</option>
              {uniqueEmails.map(email => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaTimes />
            Clear
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-green-400">
            <FaCheck />
            <span>{message}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-400">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl">
        <div className="overflow-x-auto max-h-[60vh]">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-base font-medium">
                {messages.length === 0 ? "No messages found" : "No messages match your filters"}
              </p>
              <p className="text-sm mt-2">
                {messages.length === 0 
                  ? "User contact messages will appear here" 
                  : "Try adjusting your search or filters"
                }
              </p>
              {(searchTerm || selectedEmail) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-[#2a2a2a] text-gray-300 z-10">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-sm">ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    <div className="flex items-center gap-2">
                      <FaUser size={12} />
                      Name
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    <div className="flex items-center gap-2">
                      <FaEnvelope size={12} />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">Message</th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    <div className="flex items-center gap-2">
                      <FaClock size={12} />
                      Submitted At
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className="bg-[#1f1f1f] hover:bg-[#333] text-gray-300 transition-all duration-200"
                  >
                    <td className="px-6 py-4 font-mono text-violet-400">
                      {msg.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {msg.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-blue-400 truncate max-w-[200px]" title={msg.email}>
                        {msg.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[300px]">
                      <div 
                        className="truncate cursor-help" 
                        title={msg.message}
                      >
                        {msg.message}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-amber-400 text-sm">
                        {new Date(msg.submitted_at).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(msg.submitted_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 p-3 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
                        title="Delete Message"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      {filteredMessages.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing <span className="text-white font-medium">{filteredMessages.length}</span> 
              {filteredMessages.length !== messages.length && (
                <span> of <span className="text-white font-medium">{messages.length}</span></span>
              )} 
              messages
            </div>
            <div>
              Last updated: <span className="text-white font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMsg;