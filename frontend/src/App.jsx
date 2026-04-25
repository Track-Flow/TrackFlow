import { useState } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import tfTheme from './theme/tfTheme';
import { Sidebar, TopBar, DRAWER_W, ROLE_META } from './components/Shell';
import DashboardView from './views/DashboardView';
import TicketsView from './views/TicketsView';
import BoardView from './views/BoardView';
import {
  EndUserHome, SubmitTicketView, EndUserTicketsView,
  ManagerDashboard, HelpdeskRoutingView, AccessManagementView,
  RoleStub,
} from './views/RoleViews';

const DEFAULT_VIEW = {
  end_user:       'dashboard',
  tla:            'dashboard',
  mss_manager:    'dashboard',
  helpdesk_admin: 'tickets',
};

function renderView(role, view, setView) {
  // END USER
  if (role === 'end_user') {
    if (view === 'dashboard') return <EndUserHome setView={setView} />;
    if (view === 'submit')    return <SubmitTicketView setView={setView} />;
    if (view === 'tickets')   return <EndUserTicketsView />;
    if (view === 'inbox')     return <RoleStub icon="inbox"  title="Notifications"  blurb="Status updates on your tickets show up here." />;
    if (view === 'profile')   return <RoleStub icon="person" title="My profile"      blurb="Update your contact details and notification preferences." />;
  }

  // TLA
  if (role === 'tla') {
    if (view === 'dashboard') return <DashboardView setView={setView} />;
    if (view === 'tickets')   return <TicketsView />;
    if (view === 'board')     return <BoardView />;
    if (view === 'kb')        return <RoleStub icon="menu_book" title="Knowledge base"  blurb="Internal KB articles and runbooks for common issues." />;
    if (view === 'reports')   return <RoleStub icon="bar_chart" title="My performance"  blurb="Personal SLA, resolution times, and CSAT trend." />;
    if (view === 'inbox')     return <RoleStub icon="inbox"     title="Inbox"           blurb="@mentions, assignments, and reopened tickets." />;
    if (view === 'starred')   return <RoleStub icon="bookmark"  title="Starred tickets" blurb="Quick access to tickets you're tracking." />;
  }

  // MSS MANAGER
  if (role === 'mss_manager') {
    if (view === 'dashboard')   return <ManagerDashboard setView={setView} />;
    if (view === 'tickets')     return <TicketsView />;
    if (view === 'departments') return <RoleStub icon="groups"    title="Departments"    blurb="Drill into per-department staffing, queues, and SLA." />;
    if (view === 'reports')     return <RoleStub icon="analytics" title="SLA & reports"  blurb="Custom reports, exports, and trend deep-dives." />;
    if (view === 'rules')       return <RoleStub icon="rule"      title="Routing rules"  blurb="Rules engine that decides which dept handles which ticket." />;
    if (view === 'team')        return <RoleStub icon="badge"     title="TLAs"           blurb="Roster, capacity, leave, and per-agent performance." />;
    if (view === 'inbox')       return <RoleStub icon="inbox"     title="Escalations"    blurb="Tickets escalated up the chain for management decision." />;
  }

  // HELP-DESK ADMIN
  if (role === 'helpdesk_admin') {
    if (view === 'tickets')     return <HelpdeskRoutingView />;
    if (view === 'all_tickets') return <TicketsView />;
    if (view === 'access')      return <AccessManagementView />;
    if (view === 'rules')       return <RoleStub icon="rule"            title="Routing rules"        blurb="Define rules to auto-route by keyword, requester role, or category." />;
    if (view === 'categories')  return <RoleStub icon="category"        title="Categories"           blurb="Manage the category taxonomy users see when submitting." />;
    if (view === 'audit')       return <RoleStub icon="shield"          title="Audit log"            blurb="Immutable record of routing, role changes, and admin actions." />;
    if (view === 'system')      return <RoleStub icon="settings"        title="System settings"      blurb="SLA targets, business hours, integrations." />;
  }

  return <RoleStub title="Not available" blurb="This view isn't part of this role's workspace." />;
}

export default function App() {
  const [role, setRoleRaw] = useState(
    () => localStorage.getItem('tf_role') || 'tla'
  );
  const [view, setView] = useState(
    () => localStorage.getItem(`tf_view_${localStorage.getItem('tf_role') || 'tla'}`) || DEFAULT_VIEW[localStorage.getItem('tf_role') || 'tla']
  );

  const setRole = (r) => {
    setRoleRaw(r);
    localStorage.setItem('tf_role', r);
    const saved = localStorage.getItem(`tf_view_${r}`);
    setView(saved || DEFAULT_VIEW[r]);
  };

  const handleSetView = (v) => {
    setView(v);
    localStorage.setItem(`tf_view_${role}`, v);
  };

  return (
    <ThemeProvider theme={tfTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar role={role} view={view} setView={handleSetView} />
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar role={role} setRole={setRole} view={view} setView={handleSetView} />
          {renderView(role, view, handleSetView)}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
