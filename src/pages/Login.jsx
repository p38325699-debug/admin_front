import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
if (email === "knovo0301@gmail.com" && password === "git_123") {
     // Save login session
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", Date.now());

      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-[#1c1c1c] p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">
          Admin Login
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Sign in to manage your MLM Quiz App
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Email Address *
            </label>
            <input
              type="email"
              className="w-full border border-gray-600 bg-black text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Password *
            </label>
            <input
              type="password"
              className="w-full border border-gray-600 bg-black text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Sign In
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
