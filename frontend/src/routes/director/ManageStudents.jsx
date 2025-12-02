import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { Search, Eye, Trash2, Users } from "lucide-react";

export default function ManageStudents() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [departments, setDepartments] = useState([]);
  const queryClient = useQueryClient();

  // Fetch all departments for Director
  const { data: departmentsData } = useQuery({
    queryKey: ["allDepartments"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (departmentsData?.departments) {
      setDepartments(departmentsData.departments);
    }
  }, [departmentsData]);

  const { data, isLoading } = useQuery({
    queryKey: ["allStudents", search, department, year, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (department) params.append("department", department);
      if (year) params.append("year", year);
      if (status) params.append("status", status);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/all-students?${params}`,
        { credentials: "include" },
      );
      return res.json();
    },
  });

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
      queryClient.invalidateQueries(["allStudents"]);
      toast.success("Student removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove student");
    },
  });

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
      queryClient.invalidateQueries(["allStudents"]);
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const viewPassword = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/student/${id}/password`,
        {
          credentials: "include",
        },
      );
      const resp = await res.json();
      if (res.ok) {
        if (resp.hasPassword || resp.student?.hasPassword) {
          toast.info("Password is set. Plain text password cannot be viewed for security.");
        } else {
          toast.info("Password not set yet for this student.");
        }
      } else {
        toast.error(resp.error || "Failed to fetch password info");
      }
    } catch (error) {
      toast.error("Failed to fetch password info");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage All Students</h1>
        <p className="text-gray-600 mt-2">View and manage students across all departments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments && departments.length > 0 ? (
                  departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <option value="">No departments available</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
                <option value="Fourth">Fourth</option>
                <option value="Fifth">Fifth</option>
                <option value="Sixth">Sixth</option>
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
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Year</th>
                  <th className="text-left p-3">Points</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.students && data.students.length > 0 ? (
                  data.students.map((student) => (
                    <tr key={student._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{student.prn}</td>
                      <td className="p-3 font-medium">{student.name}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3">{student.department?.name || "—"}</td>
                      <td className="p-3">{student.currentYear || "—"}</td>
                      <td className="p-3">{student.totalPoints || 0}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewPassword(student._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              statusMutation.mutate({
                                id: student._id,
                                nextStatus: student.status === "active" ? "inactive" : "active",
                              })
                            }
                          >
                            {student.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(student._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center p-6 text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}