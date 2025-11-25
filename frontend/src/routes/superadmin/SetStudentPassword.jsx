import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

export default function SetStudentPassword() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, find the user by email
      const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users?search=${encodeURIComponent(formData.email)}`, {
        credentials: "include"
      });
      
      const userData = await userRes.json();
      
      if (!userRes.ok || !userData.users || userData.users.length === 0) {
        toast.error("User not found");
        return;
      }
      
      const user = userData.users.find(u => u.email === formData.email && u.role === "student");
      
      if (!user) {
        toast.error("Student not found with this email");
        return;
      }
      
      // Set the password
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user._id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: formData.password })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Student password set successfully");
        // Reset form
        setFormData({
          email: "",
          password: ""
        });
      } else {
        toast.error(result.error || "Failed to set student password");
      }
    } catch (error) {
      toast.error("Failed to set student password: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/superadmin");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Set Student Password</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Password for Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Student Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">New Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Setting Password..." : "Set Student Password"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Enter the email of the student whose password you want to set</li>
            <li>Enter a strong password (at least 6 characters)</li>
            <li>Click "Set Student Password" to save the new password</li>
            <li>The student will be able to log in with this email and password</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}