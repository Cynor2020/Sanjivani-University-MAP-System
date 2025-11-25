import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export default function ManageDirectors() {
  const [directors, setDirectors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: ""
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Fetch directors
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["directors", page, search],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users?role=director_admin&page=${page}&limit=10&search=${search}`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (data?.users) {
      setDirectors(data.users);
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingDirector 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/users/${editingDirector._id}` 
        : `${import.meta.env.VITE_BACKEND_URL}/api/users`;
      
      const method = editingDirector ? "PUT" : "POST";
      
      const requestData = { ...formData, role: "director_admin" };
      
      // Remove password field if empty when editing
      if (editingDirector && !formData.password) {
        delete requestData.password;
      }
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestData)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success(editingDirector ? "Director updated successfully" : "Director created successfully");
        setShowForm(false);
        setEditingDirector(null);
        setFormData({
          name: "",
          email: "",
          department: "",
          password: ""
        });
        refetch();
        queryClient.invalidateQueries(["directors"]);
      } else {
        toast.error(result.error || "Failed to save director");
      }
    } catch (error) {
      toast.error("Failed to save director");
    }
  };

  const handleEdit = (director) => {
    setEditingDirector(director);
    setFormData({
      name: director.name,
      email: director.email,
      department: director.department || "",
      password: ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this director?")) {
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Director deleted successfully");
        refetch();
        queryClient.invalidateQueries(["directors"]);
      } else {
        toast.error(result.error || "Failed to delete director");
      }
    } catch (error) {
      toast.error("Failed to delete director");
    }
  };

  // Function to set password for directors without one
  const handleSetPassword = async (directorId, directorName) => {
    const password = prompt(`Enter new password for ${directorName}:`);
    if (!password) return;
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${directorId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Password set successfully");
        refetch();
        queryClient.invalidateQueries(["directors"]);
      } else {
        toast.error(result.error || "Failed to set password");
      }
    } catch (error) {
      toast.error("Failed to set password");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDirector(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      password: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Directors</h1>
        <Button onClick={() => setShowForm(true)}>
          Add New Director
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search directors by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <Button onClick={() => setPage(1)}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Director Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDirector ? "Edit Director" : "Add New Director"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                    disabled={!!editingDirector}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department *</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {editingDirector ? "New Password (optional)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required={!editingDirector}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingDirector ? "Update Director" : "Create Director"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Directors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Directors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading directors...</p>
          ) : directors.length === 0 ? (
            <p className="text-center py-4">No directors found</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Password Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {directors.map((director) => (
                      <TableRow key={director._id}>
                        <TableCell className="font-medium">{director.name}</TableCell>
                        <TableCell>{director.email}</TableCell>
                        <TableCell>{director.department}</TableCell>
                        <TableCell>
                          {new Date(director.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {director.passwordHash ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Set
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Not Set
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(director)}
                            >
                              Edit
                            </Button>
                            {!director.passwordHash && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleSetPassword(director._id, director.name)}
                              >
                                Set Password
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(director._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {data.pagination.currentPage} of {data.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}