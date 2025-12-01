import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/Login.jsx";
import Register from "./routes/Register.jsx";
import DashboardLayout from "./routes/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import CreateStudent from "./pages/CreateStudent.jsx";
import Home from "./pages/Home.jsx";
import ManageCategories from "./routes/superadmin/ManageCategories.jsx";

// Student Routes
import StudentDashboard from "./routes/student/StudentDashboard.jsx";
import UploadCertificate from "./routes/student/UploadCertificate.jsx";
import MyCertificates from "./routes/student/MyCertificates.jsx";

// HOD Routes
import HODDashboard from "./routes/hod/HODDashboard.jsx";
import PendingCertificates from "./routes/hod/PendingCertificates.jsx";
import ToggleUpload from "./routes/hod/ToggleUpload.jsx";
import ManageStudents from "./routes/hod/ManageStudents.jsx";
import AnalyticsDepartment from "./routes/hod/AnalyticsDepartment.jsx";

// Director Routes
import DirectorDashboard from "./routes/director/DirectorDashboard.jsx";

// Super Admin Routes
import SuperAdminDashboard from "./routes/superadmin/SuperAdminDashboard.jsx";
import ManageDirectors from "./routes/superadmin/ManageDirectors.jsx";
import ManageHODs from "./routes/superadmin/ManageHODs.jsx";
import ManageDepartments from "./routes/superadmin/ManageDepartments.jsx";
import StartNewAcademicYear from "./routes/superadmin/StartNewAcademicYear.jsx";
import AuditLogs from "./routes/superadmin/AuditLogs.jsx";
import ExcellenceAwardsGenerator from "./routes/superadmin/ExcellenceAwardsGenerator.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-student" element={<CreateStudent />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/upload" element={<UploadCertificate />} />
          <Route path="/student/certificates" element={<MyCertificates />} />

          {/* HOD Routes */}
          <Route path="/hod" element={<HODDashboard />} />
          <Route path="/hod/pending" element={<PendingCertificates />} />
          <Route path="/hod/toggle-upload" element={<ToggleUpload />} />
          <Route path="/hod/students" element={<ManageStudents />} />
          <Route path="/hod/analytics" element={<AnalyticsDepartment />} />

          {/* Director Routes */}
          <Route path="/director" element={<DirectorDashboard />} />

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/manage-directors" element={<ManageDirectors />} />
          <Route path="/superadmin/manage-hods" element={<ManageHODs />} />
          <Route path="/superadmin/manage-departments" element={<ManageDepartments />} />
          <Route path="/superadmin/manage-categories" element={<ManageCategories />} />
          <Route path="/superadmin/start-year" element={<StartNewAcademicYear />} />
          <Route path="/superadmin/audit" element={<AuditLogs />} />
          <Route path="/superadmin/excellence" element={<ExcellenceAwardsGenerator />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}