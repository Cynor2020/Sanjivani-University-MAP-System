import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/audit?page=${page}&limit=20&search=${search}&role=${roleFilter}&action=${actionFilter}`,
        { credentials: "include" }
      );
      const data = await res.json();
      
      if (res.ok) {
        setLogs(data.logs || []);
        setPagination(data.pagination || {});
      } else {
        toast.error(data.error || "Failed to fetch audit logs");
      }
    } catch (error) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, search, roleFilter, actionFilter]);

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this audit log?")) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audit/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Audit log deleted successfully");
        fetchAuditLogs(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete audit log");
      }
    } catch (error) {
      toast.error("Failed to delete audit log");
    }
  };

  const handleDeleteAllLogs = async () => {
    if (!window.confirm("Are you sure you want to delete ALL audit logs? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audit`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "All audit logs deleted successfully");
        fetchAuditLogs(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete audit logs");
      }
    } catch (error) {
      toast.error("Failed to delete audit logs");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <Button 
          variant="destructive" 
          onClick={handleDeleteAllLogs}
          disabled={loading}
        >
          Delete All Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by username, email, or action"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="director_admin">Director</option>
                <option value="hod">HOD</option>
                <option value="mentor">Mentor</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="upload_certificate">Upload Certificate</option>
                <option value="approve_certificate">Approve Certificate</option>
                <option value="reject_certificate">Reject Certificate</option>
                <option value="start_new_academic_year">Start New Academic Year</option>
                <option value="set_deadline">Set Deadline</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Audit Logs ({pagination.totalCount || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading audit logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center py-4">No audit logs found</p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.username}</TableCell>
                        <TableCell>{log.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {log.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{log.action}</span>
                          {log.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              {JSON.stringify(log.details).substring(0, 50)}
                              {JSON.stringify(log.details).length > 50 ? "..." : ""}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteLog(log._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
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
                      disabled={page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}