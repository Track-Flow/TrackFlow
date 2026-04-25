import { useState } from 'react';
import {
  AppBar, Toolbar, Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Badge, InputBase, Typography, Avatar, Tooltip, Menu, MenuItem, Button,
} from '@mui/material';
import { TrackFlowWordmark } from './Logo';
import { UserAvatar } from './Atoms';
import { tfUsers, tfDepartments, tfDeptLoad } from '../data/mockData';

export const DRAWER_W = 248;

export const ROLE_META = {
  end_user:       { label: 'End user',        sub: 'Student / Lecturer',   userId: 9,  brand: '#6fdcff' },
  tla:            { label: 'TLA',             sub: 'Tier-Level Agent · IT', userId: 1,  brand: '#2ec8ff' },
  mss_manager:    { label: 'MSS Manager',     sub: 'Service Operations',   userId: 7,  brand: '#ff9bd0' },
  helpdesk_admin: { label: 'Help-desk admin', sub: 'Routing & access',      userId: 8,  brand: '#8fe7ff' },
};

const NAV_BY_ROLE = {
  end_user: [
    { group: 'Support' },
    { icon: 'home',                label: 'Home',          view: 'dashboard' },
    { icon: 'add_circle',          label: 'Submit ticket', view: 'submit' },
    { icon: 'confirmation_number', label: 'My tickets',    view: 'tickets', badge: 3 },
    { group: 'Account' },
    { icon: 'inbox',               label: 'Notifications', view: 'inbox', badge: 2 },
    { icon: 'person',              label: 'Profile',       view: 'profile' },
  ],
  tla: [
    { group: 'Workspace' },
    { icon: 'dashboard',           label: 'Dashboard',      view: 'dashboard' },
    { icon: 'confirmation_number', label: 'My queue',       view: 'tickets', badge: 5 },
    { icon: 'view_kanban',         label: 'Board',          view: 'board' },
    { icon: 'menu_book',           label: 'Knowledge base', view: 'kb' },
    { icon: 'bar_chart',           label: 'My performance', view: 'reports' },
    { group: 'My stuff' },
    { icon: 'inbox',               label: 'Inbox',    view: 'inbox', badge: 4 },
    { icon: 'bookmark',            label: 'Starred',  view: 'starred' },
  ],
  mss_manager: [
    { group: 'Operations' },
    { icon: 'dashboard',           label: 'MSS dashboard', view: 'dashboard' },
    { icon: 'confirmation_number', label: 'All tickets',   view: 'tickets', badge: 23 },
    { icon: 'groups',              label: 'Departments',   view: 'departments' },
    { icon: 'analytics',           label: 'SLA & reports', view: 'reports' },
    { icon: 'rule',                label: 'Routing rules', view: 'rules' },
    { group: 'Team' },
    { icon: 'badge',               label: 'TLAs',        view: 'team' },
    { icon: 'inbox',               label: 'Escalations', view: 'inbox', badge: 3 },
  ],
  helpdesk_admin: [
    { group: 'Triage' },
    { icon: 'inbox',               label: 'Unrouted',      view: 'tickets', badge: 1 },
    { icon: 'confirmation_number', label: 'All tickets',   view: 'all_tickets' },
    { icon: 'rule',                label: 'Routing rules', view: 'rules' },
    { group: 'Administration' },
    { icon: 'manage_accounts', label: 'User access', view: 'access', badge: 2 },
    { icon: 'category',        label: 'Categories',  view: 'categories' },
    { icon: 'shield',          label: 'Audit log',   view: 'audit' },
    { icon: 'settings',        label: 'System',      view: 'system' },
  ],
};

function NavItem({ icon, label, view, currentView, setView, badge }) {
  const selected = currentView === view;
  return (
    <ListItem disablePadding sx={{ px: 1, mb: 0.25 }}>
      <ListItemButton selected={selected} onClick={() => setView(view)} sx={{ py: 0.9 }}>
        <ListItemIcon sx={{ minWidth: 34, color: selected ? '#2ec8ff' : '#8fa2c0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: 13.5, fontWeight: selected ? 600 : 500,
            color: selected ? '#e6edf7' : '#c5d1e4',
          }}
        />
        {badge != null && (
          <Box sx={{
            minWidth: 22, height: 18, px: 0.75, borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10.5, fontWeight: 700,
            background: selected ? 'rgba(46,200,255,0.2)' : 'rgba(143,162,192,0.12)',
            color: selected ? '#2ec8ff' : '#8fa2c0',
          }}>{badge}</Box>
        )}
      </ListItemButton>
    </ListItem>
  );
}

function NavGroup({ label }) {
  return (
    <Typography variant="overline" sx={{
      px: 3, pt: 2.5, pb: 1, display: 'block', color: '#5b6d8a', fontSize: 10,
    }}>{label}</Typography>
  );
}

export function Sidebar({ role, view, setView }) {
  const items = NAV_BY_ROLE[role] || [];
  const meta = ROLE_META[role];
  const me = tfUsers.find(u => u.id === meta.userId);

  return (
    <Drawer variant="permanent" sx={{
      width: DRAWER_W, flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: DRAWER_W, boxSizing: 'border-box',
        background: '#0b1a33',
        borderRight: '1px solid rgba(143,162,192,0.10)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      },
    }}>
      <Box sx={{ px: 2.5, pt: 2.25, pb: 1.5, position: 'relative' }}>
        <TrackFlowWordmark size={18} />
        <Typography sx={{ mt: 0.5, ml: '50px', color: '#5b8ec2', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontStyle: 'italic' }}>
          Wits University · MSS
        </Typography>
      </Box>

      <Box sx={{ px: 2, mb: 1 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75,
          border: '1px solid rgba(143,162,192,0.14)', borderRadius: 2,
          background: 'rgba(10,22,40,0.6)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8fa2c0' }}>search</span>
          <InputBase
            placeholder={role === 'end_user' ? 'Search my tickets…' : 'Search tickets, users…'}
            sx={{ fontSize: 13, color: '#e6edf7', flex: 1 }}
          />
          <Box sx={{ fontSize: 10, color: '#5b6d8a', border: '1px solid rgba(143,162,192,0.2)', px: 0.6, borderRadius: 0.75 }}>⌘K</Box>
        </Box>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        <List disablePadding>
          {items.map((it, i) => it.group
            ? <NavGroup key={'g' + i} label={it.group} />
            : <NavItem key={it.view} {...it} currentView={view} setView={setView} />
          )}
        </List>

        {role === 'mss_manager' && (
          <>
            <NavGroup label="Departments" />
            {tfDepartments.map(d => (
              <ListItem key={d.id} disablePadding sx={{ px: 1, mb: 0.25 }}>
                <ListItemButton sx={{ py: 0.7 }} onClick={() => setView('departments')}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: d.color, mr: 1.25, ml: 0.5 }} />
                  <ListItemText primary={d.name} primaryTypographyProps={{ fontSize: 13, color: '#c5d1e4', noWrap: true }} />
                  <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>
                    {tfDeptLoad.find(x => x.id === d.id)?.open}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(143,162,192,0.10)', display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <UserAvatar user={me} size={32} tip={false} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e6edf7', lineHeight: 1.2 }} noWrap>
            {me?.name.replace(' (You)', '')}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#8fa2c0' }} noWrap>{meta.label} · {meta.sub}</Typography>
        </Box>
        <IconButton size="small" sx={{ color: '#8fa2c0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
        </IconButton>
      </Box>
    </Drawer>
  );
}

export function RoleSwitcher({ role, setRole }) {
  const [anchor, setAnchor] = useState(null);
  const meta = ROLE_META[role];
  return (
    <>
      <Box onClick={(e) => setAnchor(e.currentTarget)} sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.6, mr: 1,
        border: '1px dashed rgba(143,162,192,0.35)', borderRadius: 1.25, cursor: 'pointer',
        background: 'rgba(10,22,40,0.6)',
        '&:hover': { borderColor: '#2ec8ff' },
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: meta.brand }}>switch_account</span>
        <Box sx={{ lineHeight: 1.1 }}>
          <Typography sx={{ fontSize: 9.5, color: '#5b6d8a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Viewing as</Typography>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: meta.brand }}>{meta.label}</Typography>
        </Box>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8fa2c0' }}>unfold_more</span>
      </Box>
      <Menu
        anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { background: '#0f2347', border: '1px solid rgba(143,162,192,0.15)', minWidth: 240 } }}
      >
        {Object.entries(ROLE_META).map(([key, m]) => (
          <MenuItem key={key} selected={key === role} onClick={() => { setRole(key); setAnchor(null); }} sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: m.brand }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e6edf7' }}>{m.label}</Typography>
                <Typography sx={{ fontSize: 11, color: '#8fa2c0' }}>{m.sub}</Typography>
              </Box>
              {key === role && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#2ec8ff' }}>check</span>}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function TopBar({ role, setRole, view, setView }) {
  const titlesByRole = {
    end_user:       { dashboard: 'Home', submit: 'Submit a ticket', tickets: 'My tickets', inbox: 'Notifications', profile: 'Profile' },
    tla:            { dashboard: 'Dashboard', tickets: 'My queue', board: 'Board', kb: 'Knowledge base', reports: 'My performance', inbox: 'Inbox', starred: 'Starred' },
    mss_manager:    { dashboard: 'MSS dashboard', tickets: 'All tickets', departments: 'Departments', reports: 'SLA & reports', rules: 'Routing rules', team: 'TLAs', inbox: 'Escalations' },
    helpdesk_admin: { tickets: 'Unrouted queue', all_tickets: 'All tickets', rules: 'Routing rules', access: 'User access', categories: 'Categories', audit: 'Audit log', system: 'System' },
  };
  const title = (titlesByRole[role] && titlesByRole[role][view]) || view;

  const primaryAction = role === 'end_user'
    ? { icon: 'add', label: 'Submit ticket', onClick: () => setView('submit') }
    : role === 'helpdesk_admin'
    ? { icon: 'rule', label: 'New routing rule', onClick: () => setView('rules') }
    : { icon: 'add', label: 'New ticket', onClick: () => {} };

  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: '#0a1628',
      borderBottom: '1px solid rgba(143,162,192,0.10)',
    }}>
      <Toolbar sx={{ minHeight: 60, gap: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: '#8fa2c0' }}>Workspace</Typography>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4f617f' }}>chevron_right</span>
          <Typography sx={{ fontSize: 13, color: '#e6edf7', fontWeight: 600 }}>{title}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <RoleSwitcher role={role} setRole={setRole} />

          <Tooltip title="Real-time: connected" arrow>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.5, mr: 1,
              border: '1px solid rgba(43,212,143,0.3)', borderRadius: 999, background: 'rgba(43,212,143,0.08)',
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#2bd48f', boxShadow: '0 0 0 3px rgba(43,212,143,0.2)' }} />
              <Typography sx={{ fontSize: 11, color: '#2bd48f', fontWeight: 600 }}>Live</Typography>
            </Box>
          </Tooltip>

          <Button
            onClick={primaryAction.onClick}
            variant="contained" size="small"
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>{primaryAction.icon}</span>}
          >
            {primaryAction.label}
          </Button>

          <IconButton size="small" sx={{ color: '#c5d1e4' }}>
            <Badge color="primary" variant="dot" overlap="circular">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
            </Badge>
          </IconButton>
          <IconButton size="small" sx={{ color: '#c5d1e4' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>help</span>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
