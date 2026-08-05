import {
  BookOpenCheck,
  Building2,
  ClipboardList,
  CalendarDays,
  ListTodo,
  FileClock,
  LayoutDashboard,
  UserCheck,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";

export const dashboardNavigation = {
  ADMIN: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Pending Approvals",
      path: "/admin/pending-users",
      icon: UserCheck,
    },
    {
      label: "Branches",
      path: "/admin/branches",
      icon: Building2,
    },
    {
      label: "Mentor Allocation",
      path: "/admin/mentor-allocation",
      icon: UsersRound,
    },
  ],

  STAFF: [
    {
      label: "Dashboard",
      path: "/staff/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "My Students",
      path: "/staff/students",
      icon: Users,
    },
    {
      label: "My Profile",
      path: "/staff/profile",
      icon: UserCog,
    },
    { label: "Tasks", path: "/staff/tasks", icon: ListTodo },
    { label: "Meetings", path: "/staff/meetings", icon: CalendarDays },
    { label: "Announcements", path: "/staff/announcements", icon: ClipboardList },
  ],

  STUDENT: [
    {
      label: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "My Mentor",
      path: "/student/mentor",
      icon: UserCheck,
    },
    {
      label: "My Profile",
      path: "/student/profile",
      icon: UserCog,
    },
    {
      label: "My Group",
      path: "/student/group",
      icon: UsersRound,
    },
    { label: "My Tasks", path: "/student/tasks", icon: ListTodo },
    { label: "Meetings", path: "/student/meetings", icon: CalendarDays },
    { label: "Learning Activity", path: "/student/activity", icon: BookOpenCheck },
  ],
};

export const getRoleLabel = (role) => {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "Administrator";

    case "STAFF":
      return "Staff Member";

    case "STUDENT":
      return "Student";

    default:
      return "User";
  }
};