import { useState, useEffect } from "react";
import { useAuth } from "./ProtectedRoute.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Initialize form fields with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, mobile })
      });
      const ct = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : { error: await res.text() };
      if (!res.ok) throw new Error(json?.error || "Failed to update profile");
      setUser(json.user);
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error(e.message || "Failed to update profile");
    }
  };

  const handlePhotoUpdate = async () => {
    if (!profilePhoto) {
      toast.error("Please select a photo first");
      return;
    }
    try {
      const fd = new FormData();
      fd.append('profilePhoto', profilePhoto);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me/photo`, {
        method: "PUT",
        credentials: "include",
        body: fd
      });
      const ct = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : { error: await res.text() };
      if (!res.ok) throw new Error(json?.error || "Failed to update photo");
      setUser(json.user);
      setProfilePhoto(null);
      setPreviewUrl("");
      toast.success("Profile photo updated");
    } catch (e) {
      toast.error(e.message || "Failed to update photo");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Enter current and new password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const ct = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : { error: await res.text() };
      if (!res.ok) throw new Error(json?.error || "Failed to update password");
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (e) {
      toast.error(e.message || "Failed to update password");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Update your profile details, photo and password</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
              <input 
                type="tel" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg" 
              />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={handleProfileUpdate}>Save Details</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover border" />
            ) : user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user?.name || "User"} className="h-20 w-20 rounded-full object-cover border" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-2 border rounded-lg" />
              <div className="mt-3">
                <Button onClick={handlePhotoUpdate}>Update Photo</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg" 
              />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={handlePasswordUpdate}>Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}