import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import tfTheme       from './theme/tfTheme';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import TLAHome       from './pages/TLAHome';
import ManagerHome   from './pages/ManagerHome';
import EndUserHome   from './pages/EndUserHome';
import HelpdeskHome  from './pages/HelpDeskHome';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function getUser() {
  try { return JSON.parse(localStorage.getItem('tf_user')); }
  catch { return null; }
}

function getToken() {
  return localStorage.getItem('tf_token');
}

// ─── Role → route map ─────────────────────────────────────────────────────────

const ROLE_ROUTES = {
  tla:         '/tla',
  mss_manager: '/manager',
  end_user:    '/home',
  admin:       '/helpdesk',
};

// ─── Guards ───────────────────────────────────────────────────────────────────

/** Redirects to login if not authenticated, or wrong role */
function PrivateRoute({ children, roles }) {
  const token = getToken();
  const user  = getUser();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

/** After login, redirect to the correct home based on role */
function RoleRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_ROUTES[user.role] ?? '/login'} replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider theme={tfTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected role routes */}
          <Route path="/tla"      element={<PrivateRoute roles={['tla']}        ><TLAHome      /></PrivateRoute>} />
          <Route path="/manager"  element={<PrivateRoute roles={['mss_manager']}><ManagerHome  /></PrivateRoute>} />
          <Route path="/home"     element={<PrivateRoute roles={['end_user']}   ><EndUserHome  /></PrivateRoute>} />
          <Route path="/helpdesk" element={<PrivateRoute roles={['admin']}      ><HelpdeskHome /></PrivateRoute>} />

          {/* Catch-all — redirect based on role */}
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}