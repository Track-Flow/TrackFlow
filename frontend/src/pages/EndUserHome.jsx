import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Button, CircularProgress, Alert } from '@mui/material';
import api from '../helpers/api';
import { getUserTickets, statusMeta, priorityMeta, timeAgo } from '../helpers/ticketHelpers';

const ACCENT = '#6fdcff';
const PAPER  = '#0f1f3a';
const BORDER = 'rgba(143,162,192,0.12)';

function TicketRow({ ticket }) {
  const { label: sLabel, color: sColor } = statusMeta(ticket.ticket_status);
  const { color: pColor }                = priorityMeta(ticket.ticket_priority ?? 'low');
  return (
    <Box sx={{
      position: 'relative', display: 'flex', alignItems: 'center',
      gap: 2, p: 2, borderBottom: `1px solid ${BORDER}`,
      '&:hover': { bgcolor: 'rgba(111,220,255,0.03)' },
    }}>
      <Box sx={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, bgcolor: pColor }} />
      <Box sx={{ flex: 1, minWidth: 0, pl: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#5b8ec2' }}>{ticket.ticket_id}</Typography>
          <Box sx={{ px: 0.75, py: 0.15, borderRadius: 0.75, fontSize: 10, fontWeight: 700,
            bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}44` }}>{sLabel}</Box>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>{timeAgo(ticket.updated_at)}</Typography>
        </Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#e6edf7' }} noWrap>{ticket.ticket_title}</Typography>
        <Typography sx={{ fontSize: 12, color: '#8fa2c0', mt: 0.25 }} noWrap>{ticket.ticket_description}</Typography>
      </Box>
    </Box>
  );
}

export default function EndUserHome() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('tf_user') ?? 'null');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/api/tickets')
      .then(res => setTickets(getUserTickets(res.data, user?.id)))
      .catch(err => setError(err.response?.data?.error ?? 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const open     = tickets.filter(t => ['open', 'in_progress'].includes(t.ticket_status));
  const resolved = tickets.filter(t => ['resolved', 'closed'].includes(t.ticket_status));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
            MSS Support
          </Typography>
          <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif' }}>
            Welcome, {user?.name?.split(' ')[0]}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: '#8fa2c0', mt: 0.5 }}>
            {open.length > 0 ? `You have ${open.length} open ticket${open.length > 1 ? 's' : ''}.` : 'No open tickets right now.'}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/submit')}
          startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}>
          New ticket
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[
          { label: 'Open',     value: open.length,     color: ACCENT    },
          { label: 'Resolved', value: resolved.length, color: '#2bd48f' },
          { label: 'Total',    value: tickets.length,  color: '#8fa2c0' },
        ].map(k => (
          <Card key={k.label} sx={{ p: 2, flex: 1, bgcolor: PAPER, border: `1px solid ${BORDER}`, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: k.color }} />
            <Typography sx={{ fontSize: 11, color: '#8fa2c0', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, mb: 0.5 }}>
              {k.label}
            </Typography>
            <Typography sx={{ fontFamily: '"Rubik", sans-serif', fontSize: 30, fontWeight: 700, color: '#e6edf7' }}>{k.value}</Typography>
          </Card>
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>My tickets</Typography>
          <Typography variant="h6" sx={{ color: '#e6edf7' }}>Support history</Typography>
        </Box>
        {loading && <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress size={28} sx={{ color: ACCENT }} /></Box>}
        {!loading && tickets.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography sx={{ color: '#8fa2c0', mb: 1.5 }}>No tickets yet.</Typography>
            <Button variant="contained" onClick={() => navigate('/submit')}>Submit your first ticket</Button>
          </Box>
        )}
        {!loading && tickets.map(t => <TicketRow key={t.ticket_id} ticket={t} />)}
      </Card>
    </Box>
  );
}