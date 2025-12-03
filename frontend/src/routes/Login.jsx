// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "./ProtectedRoute.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    const parse = schema.safeParse({ email, password });
    if (!parse.success) return toast.error("Invalid email or password");

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.includes("Account not activated")) {
          toast.error(data.error, { duration: 8000 });
        } else {
          toast.error(data.error || "Login failed");
        }
        return;
      }

      setUser(data.user);

      const roleRouteMap = {
        super_admin: "/superadmin",
        director: "/director",
        hod: "/hod",
        student: "/student",
      };

      const to = loc.state?.from?.pathname || roleRouteMap[data.user.role] || "/";
      nav(to, { replace: true });
      toast.success("Login Successful!");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Pure White Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header – Only Logo + Text (no blue background) */}
          <div className="p-10 text-center">
            <img
              src="https://sanjivani.edu.in/images/SU%20LOGO.png"
              alt="Sanjivani University"
              className="w-24 h-24 mx-auto rounded-full shadow-lg border-4 border-white"
            />
            <h1 className="text-3xl font-bold text-gray-900 mt-5">Sanjivani University</h1>
            <p className="text-gray-600 text-lg">Multi-Activity Points System</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="px-10 pb-8 space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-12"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Blue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer – CYNORTECH */}
          <div className="px-10 pb-10 text-center border-t pt-6">
            <p className="text-sm text-gray-600">
              Developed by <span className="font-bold text-blue-600">CYNORTECH</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              © {new Date().getFullYear()} Sanjivani University. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}