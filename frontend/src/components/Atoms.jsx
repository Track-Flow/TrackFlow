import { Avatar, AvatarGroup, Box, Typography, Tooltip } from '@mui/material';
import { tfUsers, tfPriorities, tfStatuses, tfDepartments } from '../data/mockData';

export function UserAvatar({ user, size = 28, tip = true }) {
  if (!user) return null;
  const el = (
    <Avatar sx={{
      width: size, height: size, fontSize: size * 0.42, fontWeight: 700,
      bgcolor: user.color, color: '#061224',
      border: '2px solid #0f1f3a',
    }}>{user.initials}</Avatar>
  );
  return tip ? <Tooltip title={user.name} arrow>{el}</Tooltip> : el;
}

export function UserStack({ ids = [], size = 26, max = 4 }) {
  const users = ids.map(id => tfUsers.find(u => u.id === id)).filter(Boolean);
  return (
    <AvatarGroup max={max} sx={{
      '& .MuiAvatar-root': { width: size, height: size, fontSize: size * 0.42, border: '2px solid #0f1f3a' }
    }}>
      {users.map(u => <UserAvatar key={u.id} user={u} size={size} />)}
    </AvatarGroup>
  );
}

export function PriorityPill({ priority }) {
  const p = tfPriorities.find(x => x.key === priority);
  if (!p) return null;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: 1, py: 0.25, borderRadius: 999,
      border: `1px solid ${p.color}55`,
      background: `${p.color}15`,
      color: p.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
      {p.label}
    </Box>
  );
}

export function StatusPill({ status }) {
  const s = tfStatuses.find(x => x.key === status);
  if (!s) return null;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: 1, py: 0.25, borderRadius: 999,
      border: `1px solid ${s.color}55`,
      background: `${s.color}15`,
      color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>{s.label}</Box>
  );
}

export function DeptPill({ deptId }) {
  const d = tfDepartments.find(x => x.id === deptId);
  if (!d) return null;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 0.85, py: 0.2, borderRadius: 0.75,
      border: `1px solid ${d.color}44`, background: `${d.color}14`,
      color: d.color, fontSize: 11, fontWeight: 600,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: d.color }} />
      {d.name}
    </Box>
  );
}

export function SlaBadge({ sla }) {
  if (!sla) return null;
  if (sla.breach) return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.75, py: 0.15, borderRadius: 0.75,
      background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.35)', color: '#ff6b6b', fontSize: 11, fontWeight: 700,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
      SLA breached
    </Box>
  );
  if (sla.hoursLeft <= 2) return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.75, py: 0.15, borderRadius: 0.75,
      background: 'rgba(255,181,71,0.12)', border: '1px solid rgba(255,181,71,0.35)', color: '#ffb547', fontSize: 11, fontWeight: 700,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
      {sla.hoursLeft}h left
    </Box>
  );
  return null;
}

export function SectionHeader({ eyebrow, title, actions }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
      <Box>
        {eyebrow && <Typography variant="overline" sx={{ color: '#2ec8ff', display: 'block' }}>{eyebrow}</Typography>}
        <Typography variant="h4" sx={{ color: 'text.primary' }}>{title}</Typography>
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
    </Box>
  );
}

export function FlowLine({ height = 1, opacity = 1 }) {
  return (
    <div style={{
      height, width: '100%', opacity,
      background: 'rgba(143,162,192,0.12)',
    }} />
  );
}
