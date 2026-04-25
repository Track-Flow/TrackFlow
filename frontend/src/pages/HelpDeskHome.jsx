import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, CircularProgress, Alert,
  Select, MenuItem, FormControl,
} from '@mui/material';
import api from '../helpers/api';
import { getUnrouted, priorityMeta, timeAgo } from '../helpers/ticketHelpers';

const BG     = '#0a1628';
const PAPER  = '#0f1f3a';
const ACCENT = '#2ec8ff';
const BORDER = 'rgba(143,162,192,0.12)';

// Match your departments table — update IDs to match your DB
const DEPARTMENTS = [
  { id: 1, name: 'IT Support'       },
  { id: 2, name: 'Facilities'       },
  { id: 3, name: 'Administration'   },
  { id: 4, name: 'Library Services' },
];

function TicketRow({ ticket, onRoute }) {
  const [deptId,   setDeptId]   = useState('');
  const [routing,  setRouting]  = useState(false);
  const { color: pColor } = priorityMeta(ticket.ticket_priority ?? 'low');

  const handleRoute = async () => {
    if (!deptId) return;
    setRouting(true);
    await onRoute(ticket.ticket_id, deptId);
    setRouting(false);
  };

  return (
    <Box sx={{
      position: 'relative', display: 'flex', alignItems: 'center',
      gap: 2, p: 2, borderBottom: `1px solid ${BORDER}`,
      '&:hover': { bgcolor: 'rgba(255,155,208,0.03)' },
    }}>
      <Box sx={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, bgcolor: pColor }} />

      <Box sx={{ flex: 1, minWidth: 0, pl: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#5b8ec2' }}>{ticket.ticket_id}</Typography>
          <Box sx={{ px: 0.75, py: 0.15, borderRadius: 0.75, fontSize: 10, fontWeight: 700,
            bgcolor: 'rgba(255,155,208,0.15)', color: '#ff9bd0', border: '1px solid rgba(255,155,208,0.3)' }}>
            Unrouted
          </Box>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>{timeAgo(ticket.updated_at)}</Typography>
        </Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#e6edf7', mb: 0.25 }} noWrap>
          {ticket.ticket_title}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#8fa2c0' }} noWrap>
          {ticket.ticket_description}
        </Typography>
      </Box>

      {/* Route action */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={deptId}
            onChange={e => setDeptId(e.target.value)}
            displayEmpty
            sx={{ fontSize: 12, color: '#e6edf7' }}
          >
            <MenuItem value="" disabled><em style={{ color: '#5b6d8a' }}>Select dept…</em></MenuItem>
            {DEPARTMENTS.map(d => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          size="small" variant="contained"
          disabled={!deptId || routing}
          onClick={handleRoute}
          sx={{ fontSize: 11, py: 0.5, whiteSpace: 'nowrap' }}
        >
          {routing ? 'Routing…' : 'Route →'}
        </Button>
      </Box>
    </Box>
  );
}

export default function HelpdeskHome() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('tf_user') ?? 'null');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/tickets');
      setTickets(getUnrouted(res.data));
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleRoute = async (ticketId, departmentId) => {
    try {
      await api.patch(`/api/tickets/${ticketId}`, { department_id: departmentId });
      fetchTickets(); // refresh after routing
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to route ticket.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: '#ff9bd0', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
            Help Desk Admin
          </Typography>
          <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif' }}>
            Unrouted queue
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: '#8fa2c0', mt: 0.5 }}>
            {tickets.length > 0
              ? `${tickets.length} ticket${tickets.length > 1 ? 's' : ''} need routing.`
              : 'All tickets have been routed.'}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={handleLogout}
          sx={{ color: '#8fa2c0', borderColor: BORDER }}>
          Sign out
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: 11, color: '#ff9bd0', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Pending routing
            </Typography>
            <Typography variant="h6" sx={{ color: '#e6edf7' }}>Assign each ticket to a department</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: '#5b6d8a' }}>{tickets.length} unrouted</Typography>
        </Box>

        {loading && <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress size={28} sx={{ color: '#ff9bd0' }} /></Box>}

        {!loading && tickets.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography sx={{ color: '#2bd48f', fontWeight: 600, fontSize: 16 }}>✓ Queue clear</Typography>
            <Typography sx={{ color: '#8fa2c0', fontSize: 13, mt: 0.5 }}>All tickets have been assigned a department.</Typography>
          </Box>
        )}

        {!loading && tickets.map(t => (
          <TicketRow key={t.ticket_id} ticket={t} onRoute={handleRoute} />
        ))}
      </Card>
    </Box>
  );
}