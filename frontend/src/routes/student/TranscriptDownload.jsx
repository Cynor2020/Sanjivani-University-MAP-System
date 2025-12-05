import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";

export default function TranscriptDownload() {
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [certificatesByYear, setCertificatesByYear] = useState({});

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
      
      // Group certificates by department year based on academic year
      // Create a mapping from academic years to department years
      const grouped = {};
      const baseYears = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
      
      // Get unique academic years and sort them
      const uniqueAcademicYears = [...new Set(certificatesData.certificates
        .map(cert => cert.academicYear)
        .filter(Boolean))]
        .sort();
      
      // Create mapping from academic year to department year
      const academicToDeptYearMap = {};
      uniqueAcademicYears.forEach((academicYear, index) => {
        const deptYear = baseYears[index] || `Year ${index + 1}`;
        academicToDeptYearMap[academicYear] = `${deptYear} Year`;
      });
      
      // Group certificates by department year
      certificatesData.certificates.forEach(cert => {
        const academicYear = cert.academicYear || 'Unknown Academic Year';
        const deptYear = academicToDeptYearMap[academicYear] || academicYear;
        
        if (!grouped[deptYear]) {
          grouped[deptYear] = [];
        }
        grouped[deptYear].push(cert);
      });
      
      setCertificatesByYear(grouped);
    }
  }, [certificatesData]);

  const handleDownloadSkillCard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/skill-card`, {
        credentials: "include"
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skill-card-${user?.prn || user?.enrollmentNumber || 'student'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Skill card downloaded successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to download skill card");
      }
    } catch (error) {
      console.error("Error downloading skill card:", error);
      toast.error("Failed to download skill card");
    }
  };

  if (userLoading || certificatesLoading) {
    return <div className="flex items-center justify-center h-64">Loading skill card data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Skill Card</h1>

      {/* Skill Card Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Card Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-gray-300 rounded-lg p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="https://sanjivani.edu.in/images/SU%20LOGO.png" 
                  alt="Sanjivani University Logo" 
                  className="h-16 w-16 mr-4"
                />
                <div>
                  <h2 className="text-2xl font-bold">SANJIVANI UNIVERSITY</h2>
                  <p className="text-gray-600">Kopargaon, Dist: Ahilyanagar, Maharashtra-423601</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-2">STUDENT SKILL CARD</h3>
              <div className="border-t border-gray-300 my-4"></div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-lg mb-2">Student Information</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {user?.name}</p>
                  <p><span className="font-medium">Enrollment Number:</span> {user?.enrollmentNumber || user?.prn || "N/A"}</p>
                  <p><span className="font-medium">Department:</span> {user?.department?.name || user?.department}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Academic Information</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Current Year:</span> {user?.currentYear}</p>
                  <p><span className="font-medium">Total Points:</span> <span className="font-bold text-purple-600">{totalPoints}</span></p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.status === "alumni" 
                        ? "bg-green-100 text-green-800" 
                        : user?.status === "pending_clearance" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {user?.status === "alumni" ? "Alumni" : 
                       user?.status === "pending_clearance" ? "Pending Clearance" : "Active"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Department Year Breakdown */}
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-4">Department Year Breakdown</h4>
              {Object.keys(certificatesByYear).length === 0 ? (
                <p className="text-center text-gray-500 py-4">No approved certificates found</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(certificatesByYear).map(([deptYear, certs]) => {
                    const yearPoints = certs.reduce((sum, cert) => sum + (cert.pointsAllocated || 0), 0);
                    
                    return (
                      <div key={deptYear} className="border rounded-lg p-4">
                        <h5 className="font-bold text-lg mb-3">{deptYear}</h5>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold border-b pb-2">
                            <div>Activity</div>
                            <div>Level</div>
                            <div className="text-right">Points</div>
                          </div>
                          {certs.map((cert, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-b">
                              <div>
                                <div className="font-medium">{cert.title}</div>
                                <div className="text-sm text-gray-500">{cert.categoryName}</div>
                              </div>
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {cert.level}
                                </span>
                              </div>
                              <div className="text-right font-medium">{cert.pointsAllocated}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
                  <p className="text-sm">Official Skill Card</p>
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
              onClick={handleDownloadSkillCard}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={certificates.length === 0}
            >
              Download Official Skill Card (PDF)
            </Button>
            
          </div>
          {certificates.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              You need approved certificates to generate a skill card.
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
            <li>This skill card is official and can be used for academic and employment purposes</li>
            <li>Only approved certificates are included in the skill card</li>
            <li>The skill card is digitally signed and tamper-proof</li>
            <li>For any discrepancies, contact your department HOD</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}