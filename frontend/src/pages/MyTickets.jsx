import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, CircularProgress,
  Alert, Button,
} from '@mui/material';
import api from '../helpers/api';
import { getUserTickets, statusMeta, timeAgo } from '../helpers/ticketHelpers';

const ACCENT = '#6fdcff';
const PAPER  = '#0f1f3a';
const BORDER = 'rgba(143,162,192,0.12)';

// ─── Table row ────────────────────────────────────────────────────────────────

function TicketTableRow({ ticket, onClick }) {
  const { label: sLabel, color: sColor } = statusMeta(ticket.ticket_status);

  return (
    <Box onClick={onClick} sx={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr 180px 160px 100px',
      alignItems: 'center',
      gap: 2, px: 2.5, py: 1.75,
      borderBottom: `1px solid ${BORDER}`,
      cursor: 'pointer',
      '&:hover': { bgcolor: 'rgba(111,220,255,0.04)' },
    }}>
      {/* ID */}
      <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#5b8ec2', fontWeight: 600 }}>
        {ticket.ticket_id}
      </Typography>

      {/* Subject */}
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#e6edf7' }} noWrap>
        {ticket.ticket_title}
      </Typography>

      {/* Department */}
      <Box>
        {ticket.department_name ? (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75,
            px: 1, py: 0.3, borderRadius: 999,
            bgcolor: 'rgba(46,200,255,0.10)', border: '1px solid rgba(46,200,255,0.2)' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT }} />
            <Typography sx={{ fontSize: 11.5, color: ACCENT, fontWeight: 600 }}>
              {ticket.department_name}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75,
            px: 1, py: 0.3, borderRadius: 999,
            bgcolor: 'rgba(255,155,208,0.10)', border: '1px solid rgba(255,155,208,0.2)' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ff9bd0' }} />
            <Typography sx={{ fontSize: 11.5, color: '#ff9bd0', fontWeight: 600 }}>Routing…</Typography>
          </Box>
        )}
      </Box>

      {/* Status */}
      <Box>
        <Box sx={{ display: 'inline-block', px: 1, py: 0.35, borderRadius: 0.75,
          fontSize: 11, fontWeight: 700,
          bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}44` }}>
          {sLabel.toUpperCase()}
        </Box>
      </Box>

      {/* Updated */}
      <Typography sx={{ fontSize: 12, color: '#5b6d8a' }}>
        {timeAgo(ticket.updated_at)}
      </Typography>
    </Box>
  );
}

// ─── Table header ─────────────────────────────────────────────────────────────

function TableHeader() {
  const col = { fontSize: 11, fontWeight: 700, color: '#3a4f6a', textTransform: 'uppercase', letterSpacing: '0.1em' };
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr 180px 160px 100px',
      gap: 2, px: 2.5, py: 1.25,
      borderBottom: `1px solid ${BORDER}`,
      bgcolor: 'rgba(10,22,40,0.4)',
    }}>
      <Typography sx={col}>ID</Typography>
      <Typography sx={col}>Subject</Typography>
      <Typography sx={col}>Department</Typography>
      <Typography sx={col}>Status</Typography>
      <Typography sx={col}>Updated</Typography>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyTickets() {
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 11, color: '#5b6d8a', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
          {tickets.length} total
        </Typography>
        <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif', fontWeight: 700 }}>
          My tickets
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
        <TableHeader />

        {loading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={28} sx={{ color: ACCENT }} />
          </Box>
        )}

        {!loading && tickets.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography sx={{ color: '#8fa2c0', mb: 1.5 }}>No tickets yet.</Typography>
            <Button variant="contained" onClick={() => navigate('/submit')}>
              Submit your first ticket
            </Button>
          </Box>
        )}

        {!loading && tickets.map(t => (
          <TicketTableRow
            key={t.ticket_id}
            ticket={t}
            onClick={() => navigate(`/tickets/${t.ticket_id}`)}
          />
        ))}
      </Card>
    </Box>
  );
}