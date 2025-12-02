import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Shield } from "lucide-react";

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [ip, setIp] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [role, setRole] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["auditLogs", page, q, action, ip, role, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 50 });
      if (q) params.set('q', q);
      if (action) params.set('action', action);
      if (ip) params.set('ip', ip);
      if (role) params.set('role', role);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/audit?${params.toString()}`,
        { credentials: "include" }
      );
      return res.json();
    }
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">View system activity logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Action/details contains"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <input
                type="text"
                value={action}
                onChange={(e) => { setAction(e.target.value); setPage(1); }}
                placeholder="Filter by action"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IP</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => { setIp(e.target.value); setPage(1); }}
                placeholder="Filter by IP"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="director">Director</option>
                <option value="hod">HOD</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Logs ({data?.pagination?.totalCount || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Timestamp</th>
                  <th className="text-left p-3">IP Address</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {data?.logs?.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm">{log.ip || "-"}</td>
                    <td className="p-3 text-sm">{log.user?.role || "-"}</td>
                    <td className="p-3">{log.action}</td>
                    <td className="p-3 text-sm max-w-md truncate">{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data?.logs || data.logs.length === 0) && (
              <div className="text-center py-8 text-gray-500">No audit logs found</div>
            )}
          </div>

          {data?.pagination && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!data.pagination.hasPrev}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!data.pagination.hasNext}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}