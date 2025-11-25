import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

export default function CarryForwardRequest() {
  const [requestReason, setRequestReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousRequests, setPreviousRequests] = useState([]);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch previous carry forward requests
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["carryForwardRequests"],
    queryFn: async () => {
      // In a real implementation, this would fetch actual requests
      // For now, we'll simulate with sample data
      return {
        requests: [
          {
            id: 1,
            reason: "Participated in national level competition",
            status: "approved",
            pointsCarried: 25,
            requestedAt: "2025-10-15T10:30:00Z",
            reviewedAt: "2025-10-20T14:45:00Z"
          }
        ]
      };
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestReason.trim()) {
      toast.error("Please provide a reason for your carry forward request");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would submit the request to the backend
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Carry forward request submitted successfully!");
      setRequestReason("");
      
      // Add to previous requests for demo purposes
      const newRequest = {
        id: Date.now(),
        reason: requestReason,
        status: "pending",
        pointsCarried: 0,
        requestedAt: new Date().toISOString()
      };
      
      setPreviousRequests(prev => [newRequest, ...prev]);
    } catch (error) {
      toast.error("Failed to submit carry forward request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading || requestsLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Carry Forward Request</h1>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Carry Forward Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Reason for Carry Forward Request *
              </label>
              <textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={4}
                className="w-full border rounded p-2"
                placeholder="Please provide detailed information about why you need to carry forward points..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Explain the circumstances that prevented you from meeting the minimum requirements
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>Carry forward requests are reviewed by the Academic Committee</li>
                <li>Approval is not guaranteed and depends on the merit of your case</li>
                <li>Only exceptional circumstances are considered</li>
                <li>You may be required to provide supporting documentation</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Carry Forward Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Must have valid academic or personal reasons</li>
                <li>Minimum 70% of required points must be earned</li>
                <li>No disciplinary actions during the academic year</li>
                <li>Previous carry forward requests must be resolved</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Required Documentation</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Medical certificates (if applicable)</li>
                <li>Participation proofs for events</li>
                <li>Letters from organizing committees</li>
                <li>Any other supporting evidence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <p>Loading previous requests...</p>
          ) : previousRequests.length === 0 && (!requestsData?.requests || requestsData.requests.length === 0) ? (
            <p className="text-center py-4 text-gray-500">No previous requests found</p>
          ) : (
            <div className="space-y-4">
              {[...(requestsData?.requests || []), ...previousRequests].map((request) => (
                <div key={request.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{request.reason}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Requested on: {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === "approved" 
                        ? "bg-green-100 text-green-800" 
                        : request.status === "rejected" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  {request.status === "approved" && request.pointsCarried > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Points Carried Forward:</span> 
                      <span className="ml-2 font-bold text-green-600">+{request.pointsCarried}</span>
                    </div>
                  )}
                  {request.reviewedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Reviewed on: {new Date(request.reviewedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}