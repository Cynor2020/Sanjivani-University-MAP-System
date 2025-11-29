import { useState } from "react";
import { useAuth } from "./ProtectedRoute.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Sanjivani University</CardTitle>
            <p className="text-blue-100 mt-2">Multi-Activity Points Management</p>
          </CardHeader>
          
          <form onSubmit={submit}>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Email Address</label>
                  <input 
                    className="form-input"
                    placeholder="Enter your email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={isLoading}
                    type="email"
                  />
                </div>
                
                <div>
                  <label className="form-label">Password</label>
                  <input 
                    className="form-input"
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col p-8 pt-0 space-y-4">
              <Button 
                className="w-full py-3 text-base font-medium"
                isLoading={isLoading}
                type="submit"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                <p>Developed by CYNOR SET Team</p>
                <p className="mt-1">© {new Date().getFullYear()} Sanjivani University</p>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Having trouble signing in? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
}