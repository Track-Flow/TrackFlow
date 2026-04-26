import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Button, CircularProgress, Alert } from '@mui/material';
import api from '../helpers/api';
import { getUserTickets, statusMeta, timeAgo } from '../helpers/ticketHelpers';

const ACCENT = '#6fdcff';
const PAPER  = '#0f1f3a';
const PAPER2 = '#0d1b33';
const BORDER = 'rgba(143,162,192,0.12)';

// ─── Recent ticket mini-row ───────────────────────────────────────────────────

function MiniTicketRow({ ticket, onClick }) {
  const { label: sLabel, color: sColor } = statusMeta(ticket.ticket_status);
  return (
    <Box onClick={onClick} sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      p: 1.75, borderBottom: `1px solid ${BORDER}`,
      cursor: 'pointer',
      '&:hover': { bgcolor: 'rgba(111,220,255,0.04)' },
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 10.5, color: '#5b8ec2' }}>
            {ticket.ticket_id}
          </Typography>
          {ticket.department_id && (
            <Box sx={{ px: 0.75, py: 0.1, borderRadius: 0.75, fontSize: 10, fontWeight: 700,
              bgcolor: 'rgba(46,200,255,0.12)', color: '#6fdcff', border: '1px solid rgba(46,200,255,0.2)' }}>
              {ticket.department_id}
            </Box>
          )}
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e6edf7' }} noWrap>
          {ticket.ticket_title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#5b6d8a', mt: 0.25 }}>
          Updated {timeAgo(ticket.updated_at)}
        </Typography>
      </Box>
      <Box sx={{ px: 0.9, py: 0.25, borderRadius: 0.75, fontSize: 10, fontWeight: 700, flexShrink: 0,
        bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}44` }}>
        {sLabel.toUpperCase()}
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

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
  const recent   = tickets.slice(0, 3); // show 3 most recent

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 11, color: '#5b6d8a', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
          WELCOME BACK, {user?.name?.split(' ')[0]?.toUpperCase()}
        </Typography>
        <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif', fontWeight: 700 }}>
          How can we help you today?
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Two column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, alignItems: 'start' }}>

        {/* Left — Quick actions */}
        <Card sx={{ p: 3, bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
            Quick actions
          </Typography>
          <Typography variant="h6" sx={{ color: '#e6edf7', mb: 2.5 }}>Need something?</Typography>

          {/* Submit button */}
          <Button
            fullWidth variant="contained"
            onClick={() => navigate('/submit')}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>}
            sx={{ py: 1.4, fontSize: 14, fontWeight: 700, mb: 1.5, justifyContent: 'center' }}
          >
            Submit a new ticket
          </Button>

          {/* View history button */}
          <Button
            fullWidth variant="outlined"
            onClick={() => navigate('/home/tickets')}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>}
            sx={{ py: 1.2, fontSize: 14, color: '#8fa2c0', borderColor: BORDER, justifyContent: 'center' }}
          >
            View ticket history ({tickets.length})
          </Button>

          {/* Tip */}
          <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: 'rgba(46,200,255,0.05)', border: '1px solid rgba(46,200,255,0.12)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Typography sx={{ fontSize: 12 }}>💡</Typography>
              <Typography sx={{ fontSize: 11.5, color: ACCENT, fontWeight: 700 }}>Tip</Typography>
            </Box>
            <Typography sx={{ fontSize: 12.5, color: '#8fa2c0', lineHeight: 1.6 }}>
              Choose <span style={{ color: '#ff9bd0', fontWeight: 700 }}>Other</span> if no category fits — Help-desk admin will route it for you.
            </Typography>
          </Box>
        </Card>

        {/* Right — My tickets preview */}
        <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.25 }}>
                {open.length} active
              </Typography>
              <Typography variant="h6" sx={{ color: '#e6edf7' }}>My tickets</Typography>
            </Box>
            <Typography onClick={() => navigate('/home/tickets')} sx={{
              fontSize: 12.5, color: ACCENT, cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 0.5,
              '&:hover': { textDecoration: 'underline' },
            }}>
              See all
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </Typography>
          </Box>

          {loading && (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ color: ACCENT }} />
            </Box>
          )}

          {!loading && tickets.length === 0 && (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Typography sx={{ color: '#8fa2c0', fontSize: 13, mb: 1.5 }}>No tickets yet.</Typography>
              <Button variant="contained" size="small" onClick={() => navigate('/submit')}>
                Submit your first ticket
              </Button>
            </Box>
          )}

          {!loading && recent.map(t => (
            <MiniTicketRow
              key={t.ticket_id}
              ticket={t}
              onClick={() => navigate(`/tickets/${t.ticket_id}`)}
            />
          ))}
        </Card>
      </Box>
    </Box>
  );
}