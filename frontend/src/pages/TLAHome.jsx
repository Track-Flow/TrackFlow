import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, Chip, CircularProgress, Alert, Divider,
} from '@mui/material';
import api from '../helpers/api';
import {
  getMyTickets, getUnassigned, statusMeta, priorityMeta, timeAgo,
} from '../helpers/ticketHelpers';

const BG     = '#0a1628';
const PAPER  = '#0f1f3a';
const ACCENT = '#2ec8ff';
const BORDER = 'rgba(143,162,192,0.12)';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const { label, color } = statusMeta(status);
  return (
    <Chip label={label} size="small" sx={{
      fontSize: 10, fontWeight: 700, height: 20,
      bgcolor: `${color}18`, color, border: `1px solid ${color}44`,
    }} />
  );
}

function PriorityChip({ priority }) {
  const { label, color } = priorityMeta(priority);
  return (
    <Chip label={label} size="small" sx={{
      fontSize: 10, fontWeight: 700, height: 20,
      bgcolor: `${color}18`, color, border: `1px solid ${color}44`,
    }} />
  );
}

function TicketRow({ ticket, onClaim, onUpdateStatus, myId }) {
  const isAssignedToMe = ticket.assignee_id === myId;
  const accent = priorityMeta(ticket.ticket_priority ?? 'low').color;

  return (
    <Box sx={{
      position: 'relative', display: 'flex', alignItems: 'center',
      gap: 2, p: 2, borderBottom: `1px solid ${BORDER}`,
      '&:hover': { bgcolor: 'rgba(46,200,255,0.03)' },
    }}>
      {/* Priority accent bar */}
      <Box sx={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, bgcolor: accent }} />

      <Box sx={{ flex: 1, minWidth: 0, pl: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#5b8ec2' }}>
            {ticket.ticket_id}
          </Typography>
          <PriorityChip priority={ticket.ticket_priority} />
          <StatusChip   status={ticket.ticket_status} />
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>{timeAgo(ticket.updated_at)}</Typography>
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e6edf7', mb: 0.25 }} noWrap>
          {ticket.ticket_title}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#8fa2c0' }}>
          {ticket.user_id ?? 'Unknown user'}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        {!ticket.assignee_id && (
          <Button size="small" variant="contained" onClick={() => onClaim(ticket.ticket_id)}
            sx={{ fontSize: 11, py: 0.4 }}>
            Claim
          </Button>
        )}
        {isAssignedToMe && ticket.ticket_status === 'open' && (
          <Button size="small" variant="outlined" onClick={() => onUpdateStatus(ticket.ticket_id, 'in_progress')}
            sx={{ fontSize: 11, py: 0.4 }}>
            Start
          </Button>
        )}
        {isAssignedToMe && ticket.ticket_status === 'in_progress' && (
          <Button size="small" variant="outlined" color="success" onClick={() => onUpdateStatus(ticket.ticket_id, 'resolved')}
            sx={{ fontSize: 11, py: 0.4 }}>
            Resolve
          </Button>
        )}
      </Box>
    </Box>
  );
}

function KpiCard({ label, value, color = ACCENT }) {
  return (
    <Card sx={{ p: 2, flex: 1, bgcolor: PAPER, border: `1px solid ${BORDER}`, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: color }} />
      <Typography sx={{ fontSize: 11, color: '#8fa2c0', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: '"Rubik", sans-serif', fontSize: 30, fontWeight: 700, color: '#e6edf7', lineHeight: 1 }}>
        {value}
      </Typography>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TLAHome() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('tf_user') ?? 'null');

  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState('mine'); // 'mine' | 'unassigned'

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/tickets');
      setTickets(res.data);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleClaim = async (ticketId) => {
    try {
      await api.patch(`/api/tickets/${ticketId}`, { assignee_id: user.id });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to claim ticket.');
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await api.patch(`/api/tickets/${ticketId}`, { ticket_status: status });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to update ticket.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    navigate('/login');
  };

  const myTickets         = getMyTickets(tickets, user?.id);
  const unassignedTickets = getUnassigned(tickets);
  const displayed         = tab === 'mine' ? myTickets : unassignedTickets;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
            TLA Workspace
          </Typography>
          <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif' }}>
            Good morning, {user?.name?.split(' ')[0]}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={handleLogout}
          sx={{ color: '#8fa2c0', borderColor: BORDER }}>
          Sign out
        </Button>
      </Box>

      {/* KPI row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <KpiCard label="Assigned to me"  value={myTickets.length}                                           color={ACCENT}    />
        <KpiCard label="Unassigned"      value={unassignedTickets.length}                                   color="#ffb547"   />
        <KpiCard label="In progress"     value={myTickets.filter(t => t.ticket_status === 'in_progress').length} color="#c084fc"   />
        <KpiCard label="Resolved today"  value={myTickets.filter(t => t.ticket_status === 'resolved').length}    color="#2bd48f"   />
      </Box>

      {/* Ticket queue */}
      <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 0, borderBottom: `1px solid ${BORDER}` }}>
          {[
            { key: 'mine',       label: `My queue (${myTickets.length})` },
            { key: 'unassigned', label: `Unassigned (${unassignedTickets.length})` },
          ].map(t => (
            <Box key={t.key} onClick={() => setTab(t.key)} sx={{
              px: 2.5, py: 1.5, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: tab === t.key ? ACCENT : '#8fa2c0',
              borderBottom: tab === t.key ? `2px solid ${ACCENT}` : '2px solid transparent',
              transition: 'all .15s',
              '&:hover': { color: '#e6edf7' },
            }}>
              {t.label}
            </Box>
          ))}
        </Box>

        {/* Content */}
        {loading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={28} sx={{ color: ACCENT }} />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
        {!loading && !error && displayed.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography sx={{ color: '#2bd48f', fontWeight: 600 }}>✓ All clear</Typography>
            <Typography sx={{ color: '#8fa2c0', fontSize: 13, mt: 0.5 }}>No tickets in this queue.</Typography>
          </Box>
        )}
        {!loading && displayed.map(t => (
          <TicketRow
            key={t.ticket_id}
            ticket={t}
            myId={user?.id}
            onClaim={handleClaim}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </Card>
    </Box>
  );
}