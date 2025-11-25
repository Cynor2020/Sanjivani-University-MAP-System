import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function StartNewAcademicYear() {
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    
    if (!year) {
      toast.error("Please enter academic year");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to start academic year ${year}? This will process all students.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ year })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "Academic year started successfully");
        setYear("");
      } else {
        toast.error(data.error || "Failed to start academic year");
      }
    } catch (error) {
      toast.error("Failed to start academic year");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Start New Academic Year</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Transition</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This process will:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 text-gray-600">
            <li>Increment all active students to the next academic year</li>
            <li>Mark students who have completed their program as alumni</li>
            <li>Flag students with insufficient points for pending clearance</li>
            <li>Update the academic year across the system</li>
          </ul>
          
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                New Academic Year
              </label>
              <input 
                className="border p-2 rounded w-full max-w-xs" 
                placeholder="e.g., 2026-27" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: YYYY-YY (e.g., 2026-27)
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !year}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Processing..." : "Start New Academic Year"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>This action cannot be undone</li>
            <li>Ensure all pending certificates are processed before starting</li>
            <li>Notify all users about the academic year change</li>
            <li>Backup the database before proceeding</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}