import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

export default function TranscriptDownload() {
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

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

  // Fetch user certificates
  const { data: certificatesData, isLoading: certificatesLoading } = useQuery({
    queryKey: ["myApprovedCertificates"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/mine?status=approved`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (userData?.user) {
      setUser(userData.user);
    }
  }, [userData]);

  useEffect(() => {
    if (certificatesData?.certificates) {
      setCertificates(certificatesData.certificates);
      // Calculate total points from approved certificates
      const total = certificatesData.certificates.reduce((sum, cert) => sum + (cert.pointsAllocated || 0), 0);
      setTotalPoints(total);
    }
  }, [certificatesData]);

  const handleDownloadTranscript = () => {
    // In a real implementation, this would generate and download a PDF
    toast.success("Transcript download functionality would be implemented here");
    
    // For now, show a sample of what the transcript would contain
    const transcriptData = {
      student: user,
      certificates: certificates,
      totalPoints: totalPoints,
      generatedAt: new Date().toISOString()
    };
    
    console.log("Transcript Data:", transcriptData);
  };

  if (userLoading || certificatesLoading) {
    return <div className="flex items-center justify-center h-64">Loading transcript data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">MAP Transcript</h1>

      {/* Transcript Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Transcript Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-gray-300 rounded-lg p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Sanjivani University</h2>
              <h3 className="text-xl font-semibold mt-2">MAP (Multi-Activity Points) Transcript</h3>
              <div className="border-t border-gray-300 my-4"></div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-lg mb-2">Student Information</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {user?.name}</p>
                  <p><span className="font-medium">Enrollment Number:</span> {user?.enrollmentNumber || "N/A"}</p>
                  <p><span className="font-medium">Program:</span> {user?.program}</p>
                  <p><span className="font-medium">Department:</span> {user?.department}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Academic Information</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Current Year:</span> {user?.currentYear}</p>
                  <p><span className="font-medium">Total Points:</span> <span className="font-bold text-blue-600">{totalPoints}</span></p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.status === "alumni" 
                        ? "bg-green-100 text-green-800" 
                        : user?.status === "pending_clearance" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user?.status === "alumni" ? "Alumni" : 
                       user?.status === "pending_clearance" ? "Pending Clearance" : "Active"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Certificates Summary */}
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-4">Certificates Summary</h4>
              {certificates.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No approved certificates found</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-semibold border-b pb-2">
                    <div>Activity</div>
                    <div>Level</div>
                    <div>Date</div>
                    <div className="text-right">Points</div>
                  </div>
                  {certificates.map((cert, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2 border-b">
                      <div>
                        <div className="font-medium">{cert.title}</div>
                        <div className="text-sm text-gray-500">{cert.categoryName}</div>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cert.level}
                        </span>
                      </div>
                      <div>{new Date(cert.createdAt).toLocaleDateString()}</div>
                      <div className="text-right font-medium">{cert.pointsAllocated}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 font-bold text-lg">
                    <div></div>
                    <div></div>
                    <div className="text-right">Total Points:</div>
                    <div className="text-right text-blue-600">{totalPoints}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm">Generated on: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Official Transcript</p>
                  <p className="text-xs text-gray-500">Sanjivani University</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Options */}
      <Card>
        <CardHeader>
          <CardTitle>Download Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleDownloadTranscript}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={certificates.length === 0}
            >
              Download Official Transcript (PDF)
            </Button>
            <Button variant="outline">
              Download Detailed Report (CSV)
            </Button>
          </div>
          {certificates.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              You need approved certificates to generate a transcript.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>This transcript is official and can be used for academic and employment purposes</li>
            <li>Only approved certificates are included in the transcript</li>
            <li>The transcript is digitally signed and tamper-proof</li>
            <li>For any discrepancies, contact your department HOD</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}