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

export default function ManageDepartments() {
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    years: []
  });
  const [hodData, setHodData] = useState({
    departmentId: "",
    hodId: ""
  });
  const [hods, setHods] = useState([]);
  const queryClient = useQueryClient();

  // Fetch all departments
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch all HODs
  const { data: hodsData } = useQuery({
    queryKey: ["hods"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users?role=hod`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (hodsData?.users) {
      setHods(hodsData.users);
    }
  }, [hodsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingDepartment 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/departments/${editingDepartment._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/departments`;
        
      const method = editingDepartment ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success(editingDepartment ? "Department updated successfully" : "Department created successfully");
        resetForm();
        refetch();
        queryClient.invalidateQueries(["departments"]);
      } else {
        toast.error(result.error || "Failed to save department");
      }
    } catch (error) {
      toast.error("Failed to save department");
    }
  };

  const handleAssignHOD = async (e) => {
    e.preventDefault();
    
    if (!hodData.departmentId || !hodData.hodId) {
      toast.error("Please select both department and HOD");
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${hodData.departmentId}/assign-hod`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hodId: hodData.hodId })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("HOD assigned successfully");
        setHodData({ departmentId: "", hodId: "" });
        refetch();
        queryClient.invalidateQueries(["departments"]);
      } else {
        toast.error(result.error || "Failed to assign HOD");
      }
    } catch (error) {
      toast.error("Failed to assign HOD");
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      years: department.years || (department.year ? [department.year] : [])
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Department deleted successfully");
        refetch();
        queryClient.invalidateQueries(["departments"]);
      } else {
        toast.error(result.error || "Failed to delete department");
      }
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
    setFormData({
      name: "",
      years: []
    });
  };

  const departments = data?.departments || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Departments</h1>
        <Button onClick={() => setShowForm(true)}>Add Department</Button>
      </div>

      {/* Add/Edit Department Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name *</label>
                <input
                  className="w-full border rounded p-2"
                  placeholder="e.g., Computer Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Years *</label>
                <div className="space-y-2">
                  {['First', 'Second', 'Third', 'Final'].map((year) => (
                    <div key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`year-${year}`}
                        checked={formData.years.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, years: [...formData.years, year]});
                          } else {
                            setFormData({...formData, years: formData.years.filter(y => y !== year)});
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`year-${year}`} className="ml-2 text-sm text-gray-700">
                        {year} Year
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">{editingDepartment ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assign HOD Form */}
      <Card>
        <CardHeader>
          <CardTitle>Assign HOD to Department</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignHOD} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department *</label>
                <select
                  className="w-full border rounded p-2"
                  value={hodData.departmentId}
                  onChange={(e) => setHodData({...hodData, departmentId: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.years ? dept.years.join(', ') : 'No years assigned'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">HOD *</label>
                <select
                  className="w-full border rounded p-2"
                  value={hodData.hodId}
                  onChange={(e) => setHodData({...hodData, hodId: e.target.value})}
                  required
                >
                  <option value="">Select HOD</option>
                  {hods.map(hod => (
                    <option key={hod._id} value={hod._id}>{hod.name} ({hod.email})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button type="submit">Assign HOD</Button>
          </form>
        </CardContent>
      </Card>

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading departments...</p>
          ) : departments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>HOD</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept._id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>
                        {dept.years ? dept.years.join(', ') : 'No years assigned'}
                      </TableCell>
                      <TableCell>
                        {dept.hod ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {dept.hod.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Not Assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dept.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {dept.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(dept)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(dept._id)}
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
          ) : (
            <p className="text-center py-4">No departments found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}