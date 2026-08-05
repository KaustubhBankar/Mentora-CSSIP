import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLogin from "./auth/pages/AdminLogin";
import LoginSelection from "./auth/pages/LoginSelection";
import ProtectedRoute from "./auth/ProtectedRoute";
import Register from "./auth/pages/Register";
import StaffLogin from "./auth/pages/StaffLogin";
import StudentLogin from "./auth/pages/StudentLogin";
import DashboardLayout from "./common/layouts/DashboardLayout";
import ComingSoon from "./common/pages/ComingSoon";
import LandingPage from "./common/pages/LandingPage";
import NotFound from "./common/pages/NotFound";
import Unauthorized from "./common/pages/Unauthorized";
import StaffDashboard from "./staff/pages/StaffDashboard";
import StudentDashboard from "./student/pages/StudentDashboard";
import StudentProfile from "./student/pages/StudentProfile";
import MyMentor from "./student/pages/MyMentor";
import MyGroup from "./student/pages/MyGroup";
import MyStudents from "./staff/pages/MyStudents";
import StaffProfile from "./staff/pages/StaffProfile";
import UserManagement from "./admin/pages/UserManagement";
import BranchManagement from "./admin/pages/BranchManagement";
import MentorAllocation from "./admin/pages/MentorAllocation";
import TaskManagement from "./staff/pages/TaskManagement";
import MyTasks from "./student/pages/MyTasks";
import MeetingManagement from "./staff/pages/MeetingManagement";
import MyMeetings from "./student/pages/MyMeetings";


const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginSelection />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/staff" element={<StaffLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route
            path="/admin/users"
            element={<UserManagement />}
          />

          <Route
            path="/admin/pending-users"
            element={
              <UserManagement initialStatusFilter="PENDING" />
            }
          />

          <Route
            path="/admin/branches"
            element={<BranchManagement />}
          />

          <Route
            path="/admin/mentor-allocation"
            element={<MentorAllocation />}
          />
        </Route>
      </Route>

      {/* Staff routes */}
      <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />

          <Route
            path="/staff/students"
            element={<MyStudents />}
          />

          <Route
            path="/staff/profile"
            element={<StaffProfile />}
          />

          <Route path="/staff/tasks" element={<TaskManagement />} />
          <Route path="/staff/meetings" element={<MeetingManagement />} />

          <Route
            path="/staff/announcements"
            element={
              <ComingSoon
                title="Announcements"
                description="Create and manage group announcements."
              />
            }
          />
        </Route>
      </Route>

      {/* Student routes */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />

          <Route
            path="/student/mentor"
            element={<MyMentor />}
          />

          <Route
            path="/student/profile"
            element={<StudentProfile />}
          />

          <Route
            path="/student/group"
            element={<MyGroup />}
          />

          <Route path="/student/tasks" element={<MyTasks />} />
          <Route path="/student/meetings" element={<MyMeetings />} />

          <Route
            path="/student/activity"
            element={
              <ComingSoon
                title="Learning activity"
                description="View upcoming tasks and learning activity."
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;