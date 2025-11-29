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

export default function ManageHODsSA() {
  const [hods, setHods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHod, setEditingHod] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: ""
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Fetch HODs
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["hods", page, search],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users?role=hod&page=${page}&limit=10&search=${search}`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (data?.users) {
      setHods(data.users);
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
      const url = editingHod 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/users/${editingHod._id}` 
        : `${import.meta.env.VITE_BACKEND_URL}/api/users`;
      
      const method = editingHod ? "PUT" : "POST";
      
      const requestData = { ...formData, role: "hod" };
      
      // Remove password field if empty when editing
      if (editingHod && !formData.password) {
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
        toast.success(editingHod ? "HOD updated successfully" : "HOD created successfully");
        setShowForm(false);
        setEditingHod(null);
        setFormData({
          name: "",
          email: "",
          department: "",
          password: ""
        });
        refetch();
        queryClient.invalidateQueries(["hods"]);
      } else {
        toast.error(result.error || "Failed to save HOD");
      }
    } catch (error) {
      toast.error("Failed to save HOD");
    }
  };

  const handleEdit = (hod) => {
    setEditingHod(hod);
    setFormData({
      name: hod.name,
      email: hod.email,
      department: hod.department || "",
      password: ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this HOD?")) {
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("HOD deleted successfully");
        refetch();
        queryClient.invalidateQueries(["hods"]);
      } else {
        toast.error(result.error || "Failed to delete HOD");
      }
    } catch (error) {
      toast.error("Failed to delete HOD");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingHod(null);
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
        <h1 className="text-3xl font-bold">Manage HODs</h1>
        <Button onClick={() => setShowForm(true)}>
          Add New HOD
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search HODs by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <Button onClick={() => setPage(1)}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* HOD Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingHod ? "Edit HOD" : "Add New HOD"}</CardTitle>
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
                    disabled={!!editingHod}
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
                    {editingHod ? "New Password (optional)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required={!editingHod}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingHod ? "Update HOD" : "Create HOD"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* HODs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All HODs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading HODs...</p>
          ) : hods.length === 0 ? (
            <p className="text-center py-4">No HODs found</p>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hods.map((hod) => (
                      <TableRow key={hod._id}>
                        <TableCell className="font-medium">{hod.name}</TableCell>
                        <TableCell>{hod.email}</TableCell>
                        <TableCell>{hod.department}</TableCell>
                        <TableCell>
                          {new Date(hod.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(hod)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(hod._id)}
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