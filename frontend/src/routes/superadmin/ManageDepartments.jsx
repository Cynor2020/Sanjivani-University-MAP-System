import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { FolderPlus, Trash2, Edit } from "lucide-react";

const YEARS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];

export default function ManageDepartments() {
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    years: [],
    yearRequirements: {}
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
      setFormData({ name: "", years: [], yearRequirements: {} });
    },
    onError: (error) => {
      console.error("Create department error:", error);
      toast.error(error.message || "Failed to create department. Please login again.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to update department");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      toast.success("Department updated successfully");
      setShowForm(false);
      setEditingDept(null);
      setFormData({ name: "", years: [], yearRequirements: {} });
    },
    onError: (error) => toast.error(error.message || "Failed to update department")
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

  const handleYearRequirementChange = (year, field, value) => {
    setFormData(prev => ({
      ...prev,
      yearRequirements: {
        ...prev.yearRequirements,
        [year]: {
          ...prev.yearRequirements[year],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.years.length === 0) {
      toast.error("Please select at least one year");
      return;
    }
    if (!editingDept) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({ id: editingDept._id, updates: formData });
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      years: dept.years || [],
      yearRequirements: dept.yearRequirements || {}
    });
    setShowForm(true);
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
        <Button onClick={() => { setShowForm(!showForm); setEditingDept(null); setFormData({ name: "", years: [], yearRequirements: {} }); }}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDept ? "Edit Department" : "Add Department"}</CardTitle>
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
              
              {/* Year Requirements Section */}
              {formData.years.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Requirements</label>
                  <div className="space-y-3">
                    {formData.years.map(year => (
                      <div key={year} className="p-3 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">Year {year}</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Points</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.yearRequirements[year]?.points || 100}
                              onChange={(e) => handleYearRequirementChange(year, 'points', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button type="submit">{editingDept ? "Update Department" : "Create Department"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingDept(null); setFormData({ name: "", years: [], yearRequirements: {} }); }}>
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
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(dept)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            if (window.confirm(`Delete department ${dept.name}?`)) {
                              deleteMutation.mutate(dept._id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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