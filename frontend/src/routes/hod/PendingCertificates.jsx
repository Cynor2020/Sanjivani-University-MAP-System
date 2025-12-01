import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { Check, X, Eye } from "lucide-react";

export default function PendingCertificates() {
  const [academicYear, setAcademicYear] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pendingCertificates", academicYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (academicYear) params.append("academicYear", academicYear);
      
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/pending?${params}`,
        { credentials: "include" }
      );
      return res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (certificateId) => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/${certificateId}/approve`,
        {
          method: "POST",
          credentials: "include"
        }
      );
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingCertificates"]);
      toast.success("Certificate approved");
    },
    onError: () => toast.error("Failed to approve")
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ certificateId, reason }) => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/${certificateId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason })
        }
      );
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingCertificates"]);
      toast.success("Certificate rejected");
      setSelectedCert(null);
      setRejectReason("");
    },
    onError: () => toast.error("Failed to reject")
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Certificates</h1>
        <p className="text-gray-600 mt-2">Review and approve/reject student certificates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <input
                type="text"
                placeholder="e.g., 2024-25"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Certificates ({data?.certificates?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.certificates?.map((cert) => (
              <div key={cert._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{cert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{cert.userId?.name}</span> ({cert.userId?.prn}) - {cert.categoryName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Level: <span className="capitalize">{cert.level}</span> | Points: {cert.pointsAllocated || 0}
                    </p>
                    {cert.cloudinaryUrl && (
                      <a
                        href={cert.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Certificate
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(cert._id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {(!data?.certificates || data.certificates.length === 0) && (
              <div className="text-center py-8 text-gray-500">No pending certificates</div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCert && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle>Reject Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate({ certificateId: selectedCert._id, reason: rejectReason })}
              >
                Confirm Reject
              </Button>
              <Button variant="outline" onClick={() => {
                setSelectedCert(null);
                setRejectReason("");
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
