import { useState } from "react";
import { useAuth } from "./ProtectedRoute.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z.object({ 
  email: z.string().email(), 
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export default function SetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    const parse = schema.safeParse({ email, password });
    if (!parse.success) {
      const errorMsg = parse.error.errors[0]?.message || "Invalid input";
      toast.error(errorMsg);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to set password");
        return;
      }
      
      toast.success("Password set successfully!");
      
      // Try to login automatically after setting password
      const loginRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      
      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        setUser(loginData.user);
        
        // Map role to correct route
        const roleRouteMap = {
          super_admin: "/superadmin",
          director_admin: "/director",
          hod: "/hod",
          mentor: "/mentor",
          student: "/student"
        };
        
        const to = roleRouteMap[loginData.user.role] || "/";
        nav(to, { replace: true });
      } else {
        // If auto-login fails, redirect to login page
        nav("/login");
      }
    } catch (error) {
      toast.error("Failed to set password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <form onSubmit={submit} className="bg-white shadow p-6 rounded w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">Sanjivani University</h1>
          <h2 className="text-xl font-semibold mt-1">Set Your Password</h2>
          <p className="text-sm text-gray-500 mt-2">Welcome! Please set your password to continue.</p>
        </div>
        
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              className="w-full border p-2 rounded" 
              placeholder="your.email@sanjivaniuniversity.edu.in" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading}
              type="email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input 
              className="w-full border p-2 rounded" 
              type="password" 
              placeholder="Enter new password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input 
              className="w-full border p-2 rounded" 
              type="password" 
              placeholder="Confirm new password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              disabled={isLoading}
            />
          </div>
          
          <button 
            className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50" 
            disabled={isLoading}
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>For security reasons, please choose a strong password</p>
          <p className="mt-1">developed BY CYNOR SET Team</p>
        </div>
      </form>
    </div>
  );
}