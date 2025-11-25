import { useState } from "react";
import { useAuth } from "./ProtectedRoute.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    const parse = schema.safeParse({ email, password });
    if (!parse.success) return toast.error("Invalid input");
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Handle specific error for users without passwords
        if (data.error && data.error.includes("Account not activated")) {
          toast.error(data.error, { duration: 8000 });
        } else {
          toast.error(data.error || "Login failed");
        }
        return;
      }
      
      setUser(data.user);
      
      // Map role to correct route
      const roleRouteMap = {
        super_admin: "/superadmin",
        director_admin: "/director",
        hod: "/hod",
        mentor: "/mentor",
        student: "/student"
      };
      
      const to = loc.state?.from?.pathname || roleRouteMap[data.user.role] || "/";
      nav(to, { replace: true });
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <form onSubmit={submit} className="bg-white shadow p-6 rounded w-full max-w-sm space-y-3">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">Sanjivani University</h1>
          <h2 className="text-xl font-semibold mt-1">MAP System</h2>
          <p className="text-sm text-gray-500 mt-2">Multi-Activity Points Management</p>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <input 
            className="w-full border p-2 rounded" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={isLoading}
          />
          <input 
            className="w-full border p-2 rounded" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={isLoading}
          />
          <button 
            className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>developed BY CYNOR SET Team</p>
          <p className="mt-1">© {new Date().getFullYear()} Sanjivani University</p>
        </div>
      </form>
    </div>
  );
}