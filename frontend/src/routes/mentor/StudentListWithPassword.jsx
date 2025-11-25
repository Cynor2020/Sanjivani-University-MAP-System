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

export default function StudentListWithPassword() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Fetch students with passwords
  const { data, isLoading } = useQuery({
    queryKey: ["studentPasswords"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/student-passwords`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (data?.students) {
      setStudents(data.students);
      setFilteredStudents(data.students);
    }
  }, [data]);

  useEffect(() => {
    if (search) {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        (student.enrollmentNumber && student.enrollmentNumber.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [search, students]);

  const handleResetPassword = async (studentId, studentName) => {
    const newPassword = prompt(`Enter new password for ${studentName}:`);
    if (newPassword !== null) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/set-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: studentId, password: newPassword })
        });
        
        const result = await res.json();
        
        if (res.ok) {
          toast.success("Password reset successfully");
        } else {
          toast.error(result.error || "Failed to reset password");
        }
      } catch (error) {
        toast.error("Failed to reset password");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student List with Passwords</h1>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search students by name, email, or enrollment number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students in Your Division</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-center py-4">No students found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enrollment Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.enrollmentNumber || "N/A"}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.division}</TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResetPassword(student._id, student.name)}
                        >
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Important Security Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            This page shows student account information for emergency purposes only. 
            Please ensure this information is kept secure and only used when necessary. 
            Reset passwords only when requested by the student or in emergency situations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}