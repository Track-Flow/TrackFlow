import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, CircularProgress, Alert,
  Select, MenuItem, FormControl, Chip, Avatar, Tooltip,
  Button, TextField, InputAdornment,
} from '@mui/material';
import api from '../helpers/api';

const ACCENT = '#ffb547';
const PAPER  = '#0f1f3a';
const BORDER = 'rgba(143,162,192,0.12)';

const ROLES = ['admin', 'mss_manager', 'tla', 'end_user'];

const ROLE_META = {
  admin:       { label: 'Admin',       color: '#ffb547' },
  mss_manager: { label: 'MSS Manager', color: '#ff9bd0' },
  tla:         { label: 'TLA',         color: '#2ec8ff' },
  end_user:    { label: 'End User',    color: '#6fdcff' },
};

const STATUS_META = {
  active:   { label: 'Active',   color: '#2bd48f' },
  inactive: { label: 'Inactive', color: '#ff6b6b' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByRole(users) {
  return ROLES.reduce((acc, role) => {
    const group = users.filter(u => u.user_role === role);
    if (group.length > 0) acc[role] = group;
    return acc;
  }, {});
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({ user, onUpdate }) {
  const [role,    setRole]    = useState(user.user_role);
  const [status,  setStatus]  = useState(user.user_status);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const roleColor   = ROLE_META[role]?.color   ?? '#8fa2c0';
  const statusColor = STATUS_META[status]?.color ?? '#8fa2c0';
  const initials    = getInitials(user.user_name);

  const isDirty = role !== user.user_role || status !== user.user_status;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/api/admin/users/${user.user_id}`, {
        user_role:   role,
        user_status: status,
      });
      setSaved(true);
      onUpdate(user.user_id, { user_role: role, user_status: status });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      p: 1.75, borderBottom: `1px solid ${BORDER}`,
      '&:hover': { bgcolor: 'rgba(255,181,71,0.03)' },
    }}>
      {/* Avatar */}
      <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700,
        bgcolor: `${roleColor}20`, color: roleColor, flexShrink: 0 }}>
        {initials}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#e6edf7' }} noWrap>
          {user.user_name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: '#8fa2c0' }} noWrap>
          {user.user_email} · <span style={{ fontFamily: 'monospace' }}>{user.user_id}</span>
        </Typography>
        {error && <Typography sx={{ fontSize: 11, color: '#ff6b6b', mt: 0.25 }}>{error}</Typography>}
      </Box>

      {/* Role selector */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select value={role} onChange={e => setRole(e.target.value)}
          sx={{ fontSize: 12, color: roleColor }}>
          {ROLES.map(r => (
            <MenuItem key={r} value={r}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ROLE_META[r]?.color ?? '#8fa2c0', flexShrink: 0 }} />
                {ROLE_META[r]?.label ?? r}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status toggle */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select value={status} onChange={e => setStatus(e.target.value)}
          sx={{ fontSize: 12, color: statusColor }}>
          <MenuItem value="active">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#2bd48f' }} /> Active
            </Box>
          </MenuItem>
          <MenuItem value="inactive">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#ff6b6b' }} /> Inactive
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Save button */}
      <Button
        size="small" variant={isDirty ? 'contained' : 'outlined'}
        disabled={!isDirty || saving}
        onClick={handleSave}
        sx={{
          fontSize: 11, py: 0.5, px: 1.5, minWidth: 70,
          ...(!isDirty && { color: '#3a4f6a', borderColor: 'transparent' }),
          ...(saved && { bgcolor: '#2bd48f', '&:hover': { bgcolor: '#2bd48f' } }),
        }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
      </Button>
    </Box>
  );
}

// ─── Role group ───────────────────────────────────────────────────────────────

function RoleGroup({ role, users, onUpdate }) {
  const { label, color } = ROLE_META[role] ?? { label: role, color: '#8fa2c0' };
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
        <Typography sx={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#3a4f6a' }}>· {users.length}</Typography>
      </Box>
      <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
        {users.map(u => (
          <UserRow key={u.user_id} user={u} onUpdate={onUpdate} />
        ))}
      </Card>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AccessManagement() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    api.get('/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => setError(err.response?.data?.error ?? 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  // Patch local state after a save so UI updates without refetch
  const handleUpdate = (userId, changes) => {
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, ...changes } : u));
  };

  const filtered = users.filter(u =>
    u.user_name.toLowerCase().includes(search.toLowerCase()) ||
    u.user_email.toLowerCase().includes(search.toLowerCase()) ||
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = groupByRole(filtered);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
          Help Desk Admin
        </Typography>
        <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif' }}>
          User access
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: '#8fa2c0', mt: 0.5 }}>
          Manage roles and account status for all users.
        </Typography>
      </Box>

      {/* Search + stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Search by name, email or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 340 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#5b6d8a' }}>search</span>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ flex: 1 }} />
        {/* Role counts */}
        {ROLES.map(r => {
          const count = users.filter(u => u.user_role === r).length;
          if (!count) return null;
          return (
            <Box key={r} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ROLE_META[r]?.color }} />
              <Typography sx={{ fontSize: 12, color: '#8fa2c0' }}>
                {ROLE_META[r]?.label} <span style={{ color: '#e6edf7', fontWeight: 600 }}>{count}</span>
              </Typography>
            </Box>
          );
        })}
      </Box>

      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ textAlign: 'center', pt: 6 }}><CircularProgress size={28} sx={{ color: ACCENT }} /></Box>}

      {!loading && filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', pt: 6 }}>
          <Typography sx={{ color: '#8fa2c0' }}>No users match your search.</Typography>
        </Box>
      )}

      {!loading && Object.entries(grouped).map(([role, users]) => (
        <RoleGroup key={role} role={role} users={users} onUpdate={handleUpdate} />
      ))}
    </Box>
  );
}