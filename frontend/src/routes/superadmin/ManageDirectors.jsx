import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { UserPlus, Trash2, Edit } from "lucide-react";

export default function ManageDirectors() {
  const [showForm, setShowForm] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    whatsapp: "",
    address: "",
    designation: ""
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [hasPassword, setHasPassword] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["directors"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/directors`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataObj = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'profilePhoto' && data[key]) {
          formDataObj.append(key, data[key]);
        }
      });
      if (profilePhoto) {
        formDataObj.append('profilePhoto', profilePhoto);
      }
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/directors`, {
        method: "POST",
        credentials: "include",
        body: formDataObj
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["directors"]);
      toast.success("Director created successfully");
      setShowForm(false);
      setFormData({ name: "", email: "", password: "", mobile: "", whatsapp: "", address: "", designation: "" });
      setProfilePhoto(null);
      setPreviewUrl("");
    },
    onError: (error) => toast.error(error.message || "Failed to create director")
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates, newPassword }) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates)
      });
      const ct1 = res.headers.get("content-type") || "";
      const result = ct1.includes("application/json") ? await res.json() : { error: await res.text() };
      if (!res.ok) throw new Error(result?.error || "Failed to update director");

      if (newPassword && newPassword.length >= 6) {
        const pres = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password: newPassword })
        });
        const ct2 = pres.headers.get("content-type") || "";
        const pjson = ct2.includes("application/json") ? await pres.json() : { error: await pres.text() };
        if (!pres.ok) throw new Error(pjson?.error || "Failed to set password");
      }
      
      if (profilePhoto) {
        const fd = new FormData();
        fd.append('profilePhoto', profilePhoto);
        const upres = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}/photo`, {
          method: "PUT",
          credentials: "include",
          body: fd
        });
        const ct3 = upres.headers.get("content-type") || "";
        const upjson = ct3.includes("application/json") ? await upres.json() : { error: await upres.text() };
        if (!upres.ok) throw new Error(upjson?.error || "Failed to update photo");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["directors"]);
      toast.success("Director updated successfully");
      setShowForm(false);
      setEditingDirector(null);
      setHasPassword(null);
      setFormData({ name: "", email: "", password: "", mobile: "", whatsapp: "", address: "", designation: "" });
    },
    onError: (error) => toast.error(error.message || "Failed to update director")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["directors"]);
      toast.success("Director deleted");
    },
    onError: () => toast.error("Failed to delete")
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingDirector) {
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      createMutation.mutate(formData);
    } else {
      const updates = {
        name: formData.name,
        mobile: formData.mobile,
        whatsapp: formData.whatsapp,
        address: formData.address,
        designation: formData.designation
      };
      const newPassword = formData.password || "";
      updateMutation.mutate({ id: editingDirector._id, updates, newPassword });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Directors</h1>
          <p className="text-gray-600 mt-2">Create and manage directors</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingDirector(null); setHasPassword(null); }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Director
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDirector ? "Edit Director" : "Add Director"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingDirector}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{editingDirector ? "New Password (optional)" : "Password *"}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={editingDirector ? "Enter new password (min 6)" : "Enter password (min 6 characters)"}
                    minLength={editingDirector ? 0 : 6}
                    required={!editingDirector}
                  />
                  {editingDirector && hasPassword !== null && (
                    <p className="text-xs text-gray-500 mt-1">Current: {hasPassword ? "Password set" : "No password set"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">{editingDirector ? "Update Director" : "Create Director"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingDirector(null); setHasPassword(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Directors ({data?.directors?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Photo</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Mobile</th>
                  <th className="text-left p-3">Designation</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.directors?.map((director) => (
                  <tr key={director._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {director.profilePhoto ? (
                        <img src={director.profilePhoto} alt={director.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {director.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="p-3">{director.name}</td>
                    <td className="p-3">{director.email}</td>
                    <td className="p-3">{director.mobile || "-"}</td>
                    <td className="p-3">{director.designation || "-"}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          setEditingDirector(director);
                          setShowForm(true);
                          setFormData({
                            name: director.name || "",
                            email: director.email || "",
                            password: "",
                            mobile: director.mobile || "",
                            whatsapp: director.whatsapp || "",
                            address: director.address || "",
                            designation: director.designation || ""
                          });
                          try {
                            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${director._id}/password-status`, { credentials: "include" });
                            const ct = res.headers.get("content-type") || "";
                            const json = ct.includes("application/json") ? await res.json() : {};
                            if (res.ok) setHasPassword(!!json.hasPassword);
                            else setHasPassword(null);
                          } catch {
                            setHasPassword(null);
                          }
                        }}
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm(`Delete ${director.name}?`)) {
                            deleteMutation.mutate(director._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data?.directors || data.directors.length === 0) && (
              <div className="text-center py-8 text-gray-500">No directors found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
