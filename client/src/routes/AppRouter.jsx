import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import AppLayout from '../components/layout/AppLayout';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// App pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProjectsListPage from '../pages/projects/ProjectsListPage';
import CreateProjectPage from '../pages/projects/CreateProjectPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import TasksPage from '../pages/tasks/TasksPage';
import TeamsPage from '../pages/team/TeamsPage';
import MembersPage from '../pages/members/MembersPage';
import SettingsPage from '../pages/settings/SettingsPage';
import { NotFoundPage, UnauthorizedPage } from '../pages/fallback/FallbackPages';

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#111111',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route element={<RoleRoute roles={['team_leader', 'project_manager']} />}>
                <Route path="/projects/new" element={<CreateProjectPage />} />
              </Route>
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route element={<RoleRoute roles={['team_leader', 'hr']} />}>
                <Route path="/members" element={<MembersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;