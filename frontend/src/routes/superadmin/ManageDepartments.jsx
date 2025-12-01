import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { FolderPlus, Trash2 } from "lucide-react";

const YEARS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];

export default function ManageDepartments() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    years: []
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to create department" }));
        throw new Error(errorData.error || "Failed to create department");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      toast.success("Department created successfully");
      setShowForm(false);
      setFormData({ name: "", years: [] });
    },
    onError: (error) => {
      console.error("Create department error:", error);
      toast.error(error.message || "Failed to create department. Please login again.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      toast.success("Department deleted");
    },
    onError: () => toast.error("Failed to delete")
  });

  const handleYearToggle = (year) => {
    setFormData(prev => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter(y => y !== year)
        : [...prev.years, year]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.years.length === 0) {
      toast.error("Please select at least one year");
      return;
    }
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Departments</h1>
          <p className="text-gray-600 mt-2">Create and manage departments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Department</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Years *</label>
                <div className="grid grid-cols-3 gap-2">
                  {YEARS.map(year => (
                    <label key={year} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.years.includes(year)}
                        onChange={() => handleYearToggle(year)}
                        className="rounded"
                      />
                      <span>{year}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Create Department</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Departments ({data?.departments?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Years</th>
                  <th className="text-left p-3">HOD</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.departments?.map((dept) => (
                  <tr key={dept._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{dept.name}</td>
                    <td className="p-3">{dept.years?.join(", ") || "-"}</td>
                    <td className="p-3">{dept.hod?.name || "-"}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm(`Delete ${dept.name}?`)) {
                            deleteMutation.mutate(dept._id);
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
            {(!data?.departments || data.departments.length === 0) && (
              <div className="text-center py-8 text-gray-500">No departments found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
