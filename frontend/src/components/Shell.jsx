import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Avatar, Divider, Tooltip,
} from '@mui/material';

export const DRAWER_W  = 248;
export const TOPBAR_H  = 60;

const BG_SIDEBAR = '#070f1c';
const BG_MAIN    = '#0a1628';
const ACCENT     = '#2ec8ff';
const BORDER     = 'rgba(143,162,192,0.10)';
const TEXT_DIM   = '#8fa2c0';
const TEXT_BRIGHT= '#e6edf7';

// ─── Nav config per role ──────────────────────────────────────────────────────

const NAV = {
  tla: [
    { group: 'Workspace' },
    { icon: 'dashboard',           label: 'Dashboard',   path: '/tla'      },
    { icon: 'view_kanban',         label: 'Board',        path: '/tla/board' },
    { icon: 'confirmation_number', label: 'My queue',     path: '/tla/queue' },
    { group: 'Account' },
    { icon: 'inbox',               label: 'Inbox',        path: '/tla/inbox' },
  ],
  mss_manager: [
    { group: 'Operations' },
    { icon: 'dashboard',           label: 'Overview',     path: '/manager'          },
    { icon: 'confirmation_number', label: 'All tickets',  path: '/manager/tickets'  },
    { icon: 'groups',              label: 'Departments',  path: '/manager/depts'    },
    { icon: 'analytics',           label: 'Reports',      path: '/manager/reports'  },
    { group: 'Team' },
    { icon: 'badge',               label: 'TLAs',         path: '/manager/tlas'     },
  ],
  end_user: [
    { group: 'Support' },
    { icon: 'home',                label: 'Home',         path: '/home'      },
    { icon: 'add_circle',          label: 'New ticket',   path: '/submit'    },
    { icon: 'confirmation_number', label: 'My tickets',   path: '/home/tickets' },
    { group: 'Account' },
    { icon: 'notifications',       label: 'Notifications',path: '/home/inbox'},
  ],
  admin: [
    { group: 'Help Desk' },
    { icon: 'alt_route',           label: 'Unrouted queue',path: '/helpdesk'         },
    { icon: 'confirmation_number', label: 'All tickets',   path: '/helpdesk/tickets' },
    { icon: 'manage_accounts',     label: 'User access',   path: '/helpdesk/users'   },
    { group: 'Config' },
    { icon: 'category',            label: 'Categories',    path: '/helpdesk/cats'    },
    { icon: 'shield',              label: 'Audit log',     path: '/helpdesk/audit'   },
  ],
};

const ROLE_ACCENT = {
  tla:         '#2ec8ff',
  mss_manager: '#ff9bd0',
  end_user:    '#6fdcff',
  admin:       '#ffb547',
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

function TFLogo({ role }) {
  const color = ROLE_ACCENT[role] ?? ACCENT;
  return (
    <Box sx={{ px: 2.5, py: 2.25, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{
        fontFamily: '"Rubik", sans-serif', fontWeight: 700, fontSize: 20,
        letterSpacing: '-0.03em', color: TEXT_BRIGHT, lineHeight: 1,
      }}>
        <span style={{ color }}>TRACK</span>FLOW
      </Typography>
      <Typography sx={{ fontSize: 10, color: TEXT_DIM, letterSpacing: '0.16em', textTransform: 'uppercase', mt: 0.4 }}>
        Wits · MSS
      </Typography>
    </Box>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({ item, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active   = location.pathname === item.path;
  const color    = ROLE_ACCENT[role] ?? ACCENT;

  return (
    <ListItem disablePadding sx={{ px: 1, mb: 0.25 }}>
      <ListItemButton
        onClick={() => navigate(item.path)}
        selected={active}
        sx={{
          borderRadius: 1.5, py: 0.9, px: 1.5, gap: 1.25,
          color: active ? color : TEXT_DIM,
          background: active ? `${color}12` : 'transparent',
          boxShadow: active ? `inset 2px 0 0 ${color}` : 'none',
          '&:hover': { background: `${color}08`, color: TEXT_BRIGHT },
          transition: 'all .15s',
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 19 }}>{item.icon}</span>
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 600 : 500 }}
        />
      </ListItemButton>
    </ListItem>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ role, user }) {
  const navigate = useNavigate();
  const navItems = NAV[role] ?? [];
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';
  const color    = ROLE_ACCENT[role] ?? ACCENT;

  const handleLogout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_W, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_W, boxSizing: 'border-box',
          background: BG_SIDEBAR,
          borderRight: `1px solid ${BORDER}`,
          display: 'flex', flexDirection: 'column',
        },
      }}
    >
      <TFLogo role={role} />
      <Divider sx={{ borderColor: BORDER, mx: 2 }} />

      {/* Nav */}
      <List sx={{ flex: 1, pt: 1.5, overflowY: 'auto' }}>
        {navItems.map((item, i) => {
          if (item.group) {
            return (
              <Typography key={i} sx={{
                fontSize: 10, fontWeight: 700, color: '#3a4f6a',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                px: 2.5, pt: i === 0 ? 0.5 : 2, pb: 0.75,
              }}>
                {item.group}
              </Typography>
            );
          }
          return <NavItem key={item.path} item={item} role={role} />;
        })}
      </List>

      {/* User footer */}
      <Divider sx={{ borderColor: BORDER, mx: 2 }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: `${color}22`, color }}>
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT_BRIGHT }} noWrap>{user?.name}</Typography>
          <Typography sx={{ fontSize: 11, color: TEXT_DIM, textTransform: 'capitalize' }}>{role?.replace('_', ' ')}</Typography>
        </Box>
        <Tooltip title="Sign out" arrow>
          <IconButton size="small" onClick={handleLogout} sx={{ color: TEXT_DIM, '&:hover': { color: '#ff6b6b' } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar({ title, role }) {
  const color = ROLE_ACCENT[role] ?? ACCENT;
  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: '#080f1e',
      borderBottom: `1px solid ${BORDER}`,
      height: TOPBAR_H,
    }}>
      <Toolbar sx={{ minHeight: `${TOPBAR_H}px !important`, gap: 2 }}>
        {/* Breadcrumb */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 12.5, color: TEXT_DIM }}>Workspace</Typography>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#3a4f6a' }}>chevron_right</span>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: TEXT_BRIGHT }}>{title}</Typography>
        </Box>

        {/* Live indicator */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75,
          px: 1.25, py: 0.4, borderRadius: 999,
          border: '1px solid rgba(43,212,143,0.3)',
          background: 'rgba(43,212,143,0.07)',
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2bd48f',
            boxShadow: '0 0 0 3px rgba(43,212,143,0.2)',
            animation: 'tfpulse 2s ease-in-out infinite',
            '@keyframes tfpulse': {
              '0%, 100%': { boxShadow: '0 0 0 0px rgba(43,212,143,0.4)' },
              '50%':       { boxShadow: '0 0 0 5px rgba(43,212,143,0)' },
            },
          }} />
          <Typography sx={{ fontSize: 10.5, color: '#2bd48f', fontWeight: 700 }}>LIVE</Typography>
        </Box>

        {/* Notifications */}
        <IconButton size="small" sx={{ color: TEXT_DIM, '&:hover': { color: TEXT_BRIGHT } }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

// ─── Shell wrapper ────────────────────────────────────────────────────────────

const PAGE_TITLES = {
  '/tla':              'Dashboard',
  '/tla/board':        'Board',
  '/tla/queue':        'My queue',
  '/tla/inbox':        'Inbox',
  '/manager':          'Overview',
  '/manager/tickets':  'All tickets',
  '/manager/depts':    'Departments',
  '/manager/reports':  'Reports',
  '/manager/tlas':     'TLAs',
  '/home':             'Home',
  '/submit':           'Submit ticket',
  '/home/tickets':     'My tickets',
  '/home/inbox':       'Notifications',
  '/helpdesk':         'Unrouted queue',
  '/helpdesk/tickets': 'All tickets',
  '/helpdesk/users':   'User access',
  '/helpdesk/cats':    'Categories',
  '/helpdesk/audit':   'Audit log',
};

export default function Shell({ children }) {
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem('tf_user') ?? 'null');
  const role     = user?.role ?? 'end_user';
  const title    = PAGE_TITLES[location.pathname] ?? 'TrackFlow';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: BG_MAIN }}>
      <Sidebar role={role} user={user} />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={title} role={role} />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}