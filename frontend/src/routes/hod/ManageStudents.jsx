import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { Search, Key, Trash2, Users } from "lucide-react";

export default function ManageStudents() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [departmentYears, setDepartmentYears] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const queryClient = useQueryClient();

  // Fetch department years for HOD
  const { data: departmentYearsData } = useQuery({
    queryKey: ["departmentYears"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me/department-years`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch students
  const { data, isLoading } = useQuery({
    queryKey: ["departmentStudents", search, year, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (year) params.append("year", year);
      if (status) params.append("status", status);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/department-students?${params}`,
        { credentials: "include" },
      );
      return res.json();
    },
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/student/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departmentStudents"]);
      toast.success("Student removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove student");
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, nextStatus }) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departmentStudents"]);
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Password update mutation
  const passwordMutation = useMutation({
    mutationFn: async ({ id, password }) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/student/${id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update password");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departmentStudents"]);
      toast.success("Password updated successfully");
      setShowPasswordModal(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const openPasswordModal = (studentId) => {
    setSelectedStudentId(studentId);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    passwordMutation.mutate({ id: selectedStudentId, password: newPassword });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
        <p className="text-gray-600 mt-2">View and manage department students</p>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Update Password</h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                    minLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setNewPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={passwordMutation.isLoading}
                  >
                    {passwordMutation.isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name or PRN"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {departmentYears && departmentYears.length > 0 ? (
                  departmentYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))
                ) : (
                  // Fallback options if department years are not loaded
                  <>
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                    <option value="Third">Third</option>
                    <option value="Fourth">Fourth</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Students ({data?.students?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">PRN</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Year</th>
                  <th className="text-left p-3">Points</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.students?.map((student) => {
                  const isActive = student.status !== "inactive";
                  return (
                    <tr key={student._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{student.prn}</td>
                      <td className="p-3">{student.name}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3">{student.currentYear}</td>
                      <td className="p-3 font-semibold">{student.totalPoints || 0}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPasswordModal(student._id)}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            Password
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              statusMutation.mutate({
                                id: student._id,
                                nextStatus: isActive ? "inactive" : "active",
                              })
                            }
                          >
                            {isActive ? "Mark Inactive" : "Mark Active"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm(`Remove ${student.name}?`)) {
                                deleteMutation.mutate(student._id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!data?.students || data.students.length === 0) && (
              <div className="text-center py-8 text-gray-500">No students found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}