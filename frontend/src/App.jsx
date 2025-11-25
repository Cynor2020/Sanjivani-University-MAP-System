import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/Login.jsx";
import SetPassword from "./routes/SetPassword.jsx";
import DashboardLayout from "./routes/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import StudentDashboard from "./routes/student/StudentDashboard.jsx";
import UploadCertificate from "./routes/student/UploadCertificate.jsx";
import MyCertificates from "./routes/student/MyCertificates.jsx";
import TranscriptDownload from "./routes/student/TranscriptDownload.jsx";
import CarryForwardRequest from "./routes/student/CarryForwardRequest.jsx";
import MentorDashboard from "./routes/mentor/MentorDashboard.jsx";
import PendingCertificatesMentor from "./routes/mentor/PendingCertificates.jsx";
import StudentListWithPassword from "./routes/mentor/StudentListWithPassword.jsx";
import HODDashboard from "./routes/hod/HODDashboard.jsx";
import PendingCertificatesHOD from "./routes/hod/PendingCertificates.jsx";
import SetUploadDeadline from "./routes/hod/SetUploadDeadline.jsx";
import ManageMentors from "./routes/hod/ManageMentors.jsx";
import DepartmentReports from "./routes/hod/DepartmentReports.jsx";
import AnalyticsDepartment from "./routes/hod/AnalyticsDepartment.jsx";
import DirectorDashboard from "./routes/director/DirectorDashboard.jsx";
import ManageHODs from "./routes/director/ManageHODs.jsx";
import ManageCategories from "./routes/director/ManageCategories.jsx";
import UniversityAnalytics from "./routes/director/UniversityAnalytics.jsx";
import PerformanceVsStrength from "./routes/director/PerformanceVsStrength.jsx";
import TopWeakBranches from "./routes/director/TopWeakBranches.jsx";
import SuperAdminDashboard from "./routes/superadmin/SuperAdminDashboard.jsx";
import StartNewAcademicYear from "./routes/superadmin/StartNewAcademicYear.jsx";
import ManageDirectors from "./routes/superadmin/ManageDirectors.jsx";
import AcademicYearManager from "./routes/superadmin/AcademicYearManager.jsx";
import AuditLogs from "./routes/superadmin/AuditLogs.jsx";
import ExcellenceAwardsGenerator from "./routes/superadmin/ExcellenceAwardsGenerator.jsx";
import UniversityWideReports from "./routes/superadmin/UniversityWideReports.jsx";
import CreateStudentAccount from "./routes/superadmin/CreateStudentAccount.jsx";
import SetStudentPassword from "./routes/superadmin/SetStudentPassword.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route element={<ProtectedRoute />}> 
        <Route element={<DashboardLayout />}> 
          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/upload" element={<UploadCertificate />} />
          <Route path="/student/certificates" element={<MyCertificates />} />
          <Route path="/student/transcript" element={<TranscriptDownload />} />
          <Route path="/student/carry-forward" element={<CarryForwardRequest />} />

          {/* Mentor Routes */}
          <Route path="/mentor" element={<MentorDashboard />} />
          <Route path="/mentor/pending" element={<PendingCertificatesMentor />} />
          <Route path="/mentor/students" element={<StudentListWithPassword />} />

          {/* HOD Routes */}
          <Route path="/hod" element={<HODDashboard />} />
          <Route path="/hod/pending" element={<PendingCertificatesHOD />} />
          <Route path="/hod/deadline" element={<SetUploadDeadline />} />
          <Route path="/hod/mentors" element={<ManageMentors />} />
          <Route path="/hod/reports" element={<DepartmentReports />} />
          <Route path="/hod/analytics" element={<AnalyticsDepartment />} />

          {/* Director Routes */}
          <Route path="/director" element={<DirectorDashboard />} />
          <Route path="/director/hods" element={<ManageHODs />} />
          <Route path="/director/categories" element={<ManageCategories />} />
          <Route path="/director/analytics" element={<UniversityAnalytics />} />
          <Route path="/director/performance" element={<PerformanceVsStrength />} />
          <Route path="/director/top-weak" element={<TopWeakBranches />} />

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/start-year" element={<StartNewAcademicYear />} />
          <Route path="/superadmin/directors" element={<ManageDirectors />} />
          <Route path="/superadmin/academic" element={<AcademicYearManager />} />
          <Route path="/superadmin/audit" element={<AuditLogs />} />
          <Route path="/superadmin/excellence" element={<ExcellenceAwardsGenerator />} />
          <Route path="/superadmin/reports" element={<UniversityWideReports />} />
          <Route path="/superadmin/create-student" element={<CreateStudentAccount />} />
          <Route path="/superadmin/set-student-password" element={<SetStudentPassword />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}