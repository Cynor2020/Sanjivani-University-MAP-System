import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { ToggleLeft, ToggleRight, Calendar } from "lucide-react";

export default function ToggleUpload() {
  const [deadlineAt, setDeadlineAt] = useState("");
  const queryClient = useQueryClient();

  const { data: statusData, isLoading } = useQuery({
    queryKey: ["uploadStatus"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-lock/status`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-lock/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["uploadStatus"]);
      toast.success("Upload status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    }
  });

  const handleToggle = () => {
    const newStatus = !statusData?.isActive;
    toggleMutation.mutate({
      isActive: newStatus,
      deadlineAt: newStatus ? null : (deadlineAt || new Date().toISOString())
    });
  };

  const handleSetDeadline = () => {
    if (!deadlineAt) {
      toast.error("Please select a date and time");
      return;
    }
    toggleMutation.mutate({
      isActive: false,
      deadlineAt: new Date(deadlineAt).toISOString()
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Toggle Certificate Upload</h1>
        <p className="text-gray-600 mt-2">Control certificate upload access for your department</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {statusData?.isActive ? (
                <ToggleRight className="h-8 w-8 text-green-600" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="font-semibold text-lg">
                  Upload is {statusData?.isActive ? "Active" : "Inactive"}
                </p>
                <p className="text-sm text-gray-600">{statusData?.message}</p>
                {statusData?.deadlineAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Deadline: {new Date(statusData.deadlineAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleToggle}
              className={statusData?.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {statusData?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>

          {!statusData?.isActive && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Set Deadline</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={deadlineAt}
                    onChange={(e) => setDeadlineAt(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button onClick={handleSetDeadline} className="w-full">
                  Set Deadline
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

