import { Suspense, lazy } from "react";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import StaffDepartmentGuard from "./components/common/StaffDepartmentGuard";
import Loader from "./components/common/Loader";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const StudentNotifications = lazy(() => import("./pages/student/Notifications"));
const StaffDashboard = lazy(() => import("./pages/staff/Dashboard"));
const PendingRequests = lazy(() => import("./pages/staff/PendingRequests"));
const ApprovedRequests = lazy(() => import("./pages/staff/ApprovedRequests"));
const RequestDetails = lazy(() => import("./pages/staff/RequestDetails"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminDepartments = lazy(() => import("./pages/admin/Departments"));
const AdminPhaseConfiguration = lazy(() => import("./pages/admin/PhaseConfiguration"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

function withSuspense(element) {
  return (
    <Suspense fallback={<div className="p-6"><Loader /></div>}>
      {element}
    </Suspense>
  );
}

export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(<Login />) },
      { path: "login", element: withSuspense(<Login />) },
      { path: "register", element: withSuspense(<Register />) },
      { path: "forgot-password", element: withSuspense(<ForgotPassword />) },
      { path: "reset-password/:token", element: withSuspense(<ResetPassword />) },
      {
        path: "student",
        element: (
          <ProtectedRoute allowRoles={["student"]}>
            {withSuspense(<StudentDashboard />)}
          </ProtectedRoute>
        )
      },
      {
        path: "student/profile",
        element: (
          <ProtectedRoute allowRoles={["student"]}>
            {withSuspense(<StudentProfile />)}
          </ProtectedRoute>
        )
      },
      {
        path: "student/notifications",
        element: (
          <ProtectedRoute allowRoles={["student"]}>
            {withSuspense(<StudentNotifications />)}
          </ProtectedRoute>
        )
      },
      {
        path: "staff",
        element: (
          <ProtectedRoute allowRoles={["staff"]}>
            <StaffDepartmentGuard>
              {withSuspense(<StaffDashboard />)}
            </StaffDepartmentGuard>
          </ProtectedRoute>
        )
      },
      {
        path: "staff/pending",
        element: (
          <ProtectedRoute allowRoles={["staff"]}>
            <StaffDepartmentGuard>
              {withSuspense(<PendingRequests />)}
            </StaffDepartmentGuard>
          </ProtectedRoute>
        )
      },
      {
        path: "staff/approved",
        element: (
          <ProtectedRoute allowRoles={["staff"]}>
            <StaffDepartmentGuard>
              {withSuspense(<ApprovedRequests />)}
            </StaffDepartmentGuard>
          </ProtectedRoute>
        )
      },
      {
        path: "staff/request/:clearanceId",
        element: (
          <ProtectedRoute allowRoles={["staff"]}>
            <StaffDepartmentGuard>
              {withSuspense(<RequestDetails />)}
            </StaffDepartmentGuard>
          </ProtectedRoute>
        )
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowRoles={["admin"]}>
            {withSuspense(<AdminDashboard />)}
          </ProtectedRoute>
        )
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute allowRoles={["admin"]}>
            {withSuspense(<AdminUsers />)}
          </ProtectedRoute>
        )
      },
      {
        path: "admin/departments",
        element: (
          <ProtectedRoute allowRoles={["admin"]}>
            {withSuspense(<AdminDepartments />)}
          </ProtectedRoute>
        )
      },
      {
        path: "admin/phase-configuration",
        element: (
          <ProtectedRoute allowRoles={["admin"]}>
            {withSuspense(<AdminPhaseConfiguration />)}
          </ProtectedRoute>
        )
      },
      {
        path: "admin/reports",
        element: (
          <ProtectedRoute allowRoles={["admin"]}>
            {withSuspense(<AdminReports />)}
          </ProtectedRoute>
        )
      },
      {
        path: "admin/settings",
        element: (
          <ProtectedRoute allowRoles={["admin"]}>
            {withSuspense(<AdminSettings />)}
          </ProtectedRoute>
        )
      },
      {
        path: "*",
        element: withSuspense(<NotFound />)
      }
    ]
  }
];

