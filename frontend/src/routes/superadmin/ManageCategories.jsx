import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function ManageCategories() {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    levels: [{ name: "", points: "" }] // Initialize with one level
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      console.log("Fetching categories from:", `${import.meta.env.VITE_BACKEND_URL}/api/categories/all`);
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories/all`, {
        credentials: "include"
      });
      
      console.log("Categories API response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Categories API error response:", errorText);
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      
      const result = await res.json();
      console.log("Categories API Response:", result);
      return result;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-all"]);
      toast.success("Category created successfully");
      setShowForm(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message || "Failed to create category")
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
      const error = await res.json();
        throw new Error(error.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-all"]);
      toast.success("Category updated successfully");
      setShowForm(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message || "Failed to update category")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-all"]);
      toast.success("Category deleted successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to delete category")
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      levels: [{ name: "", points: "" }] // Reset to one empty level
    });
    setIsEditing(false);
    setCurrentCategory(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: currentCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      levels: category.levels && category.levels.length > 0 
        ? category.levels.map(level => ({ name: level.name, points: level.points.toString() }))
        : [{ name: "", points: "" }]
    });
    setIsEditing(true);
    setCurrentCategory(category);
    setShowForm(true);
  };

  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteMutation.mutate(category._id);
    }
  };

  // Add a new level field
  const addLevel = () => {
    setFormData({
      ...formData,
      levels: [...formData.levels, { name: "", points: "" }]
    });
  };

  // Remove a level field
  const removeLevel = (index) => {
    if (formData.levels.length > 1) {
      const newLevels = [...formData.levels];
      newLevels.splice(index, 1);
      setFormData({
        ...formData,
        levels: newLevels
      });
    }
  };

  // Update a specific level field
  const updateLevel = (index, field, value) => {
    const newLevels = [...formData.levels];
    newLevels[index][field] = value;
    setFormData({
      ...formData,
      levels: newLevels
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    console.error("Error fetching categories:", error);
    return <div className="p-6 text-red-500">Error loading categories: {error.message}</div>;
  }

  // Extract categories from the response data
  const categories = data?.categories || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-gray-600 mt-2">Create and manage activity categories with multiple levels</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Category" : "Add Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category description"
                    rows="3"
                  />
                </div>
              </div>

              {/* Levels Section */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Levels *</label>
                  <Button type="button" variant="outline" size="sm" onClick={addLevel}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Level
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.levels.map((level, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            required
                            value={level.name}
                            onChange={(e) => updateLevel(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Level name (e.g., College Level)"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            required
                            min="0"
                            value={level.points}
                            onChange={(e) => updateLevel(index, 'points', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Points"
                          />
                        </div>
                      </div>
                      {formData.levels.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeLevel(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {isEditing ? "Update Category" : "Create Category"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Levels</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{category.name}</td>
                    <td className="p-3">{category.description || "-"}</td>
                    <td className="p-3">
                      {category.levels && category.levels.length > 0 ? (
                        <div className="space-y-1">
                          {category.levels.map((level, index) => (
                            <div key={index} className="text-sm">
                              {level.name}: {level.points} points
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No levels</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-500">No categories found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}