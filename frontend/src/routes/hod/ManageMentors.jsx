import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../ProtectedRoute.jsx";
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

export default function ManageMentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    division: user?.division || "",
    password: ""
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Fetch mentors
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mentors", page, search],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users?role=mentor&page=${page}&limit=10&search=${search}`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (data?.users) {
      setMentors(data.users);
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
      const url = editingMentor 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/users/${editingMentor._id}` 
        : `${import.meta.env.VITE_BACKEND_URL}/api/users`;
      
      const method = editingMentor ? "PUT" : "POST";
      
      const requestData = { ...formData, role: "mentor" };
      
      // Remove password field if empty when editing
      if (editingMentor && !formData.password) {
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
        toast.success(editingMentor ? "Mentor updated successfully" : "Mentor created successfully");
        setShowForm(false);
        setEditingMentor(null);
        setFormData({
          name: "",
          email: "",
          division: "",
          password: ""
        });
        refetch();
        queryClient.invalidateQueries(["mentors"]);
      } else {
        toast.error(result.error || "Failed to save mentor");
      }
    } catch (error) {
      toast.error("Failed to save mentor");
    }
  };

  const handleEdit = (mentor) => {
    setEditingMentor(mentor);
    setFormData({
      name: mentor.name,
      email: mentor.email,
      division: mentor.division || "",
      password: ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mentor?")) {
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Mentor deleted successfully");
        refetch();
        queryClient.invalidateQueries(["mentors"]);
      } else {
        toast.error(result.error || "Failed to delete mentor");
      }
    } catch (error) {
      toast.error("Failed to delete mentor");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMentor(null);
    setFormData({
      name: "",
      email: "",
      division: user?.division || "",
      password: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Mentors</h1>
        <Button onClick={() => setShowForm(true)}>
          Add New Mentor
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search mentors by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <Button onClick={() => setPage(1)}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Mentor Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMentor ? "Edit Mentor" : "Add New Mentor"}</CardTitle>
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
                    disabled={!!editingMentor}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Division *</label>
                  <input
                    type="text"
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {editingMentor ? "New Password (optional)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required={!editingMentor}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingMentor ? "Update Mentor" : "Create Mentor"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mentors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Mentors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading mentors...</p>
          ) : mentors.length === 0 ? (
            <p className="text-center py-4">No mentors found</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.map((mentor) => (
                      <TableRow key={mentor._id}>
                        <TableCell className="font-medium">{mentor.name}</TableCell>
                        <TableCell>{mentor.email}</TableCell>
                        <TableCell>{mentor.division}</TableCell>
                        <TableCell>
                          {new Date(mentor.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(mentor)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(mentor._id)}
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