import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, CircularProgress,
  Alert, Button, Divider,
} from '@mui/material';
import api from '../helpers/api';
import { statusMeta, priorityMeta, timeAgo } from '../helpers/ticketHelpers';

const PAPER  = '#0f1f3a';
const BORDER = 'rgba(143,162,192,0.12)';

function InfoRow({ label, value, valueColor }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.25, borderBottom: `1px solid ${BORDER}` }}>
      <Typography sx={{ fontSize: 12, color: '#5b6d8a', minWidth: 130, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13.5, color: valueColor ?? '#e6edf7', fontWeight: 500 }}>{value ?? '—'}</Typography>
    </Box>
  );
}

export default function TicketDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem('tf_user') ?? 'null');

  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/api/tickets/${id}`)
      .then(res => setTicket(res.data))
      .catch(err => setError(err.response?.data?.error ?? 'Failed to load ticket.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Back path based on role
  const backPath = {
    tla:         '/tla',
    mss_manager: '/manager',
    end_user:    '/home',
    admin:       '/helpdesk',
  }[user?.role] ?? '/';

  if (loading) return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <CircularProgress size={28} sx={{ color: '#2ec8ff' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error}</Alert>
      <Button sx={{ mt: 2 }} onClick={() => navigate(backPath)}>← Back</Button>
    </Box>
  );

  if (!ticket) return null;

  const { label: sLabel, color: sColor } = statusMeta(ticket.ticket_status);
  const { label: pLabel, color: pColor } = priorityMeta(ticket.ticket_priority ?? 'low');

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      {/* Back */}
      <Button size="small" onClick={() => navigate(backPath)}
        startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>}
        sx={{ color: '#8fa2c0', mb: 2, pl: 0 }}>
        Back
      </Button>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#5b8ec2' }}>
            {ticket.ticket_id}
          </Typography>
          <Box sx={{ px: 0.9, py: 0.2, borderRadius: 0.75, fontSize: 11, fontWeight: 700,
            bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}44` }}>
            {sLabel}
          </Box>
          <Box sx={{ px: 0.9, py: 0.2, borderRadius: 0.75, fontSize: 11, fontWeight: 700,
            bgcolor: `${pColor}18`, color: pColor, border: `1px solid ${pColor}44` }}>
            {pLabel}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif' }}>
          {ticket.ticket_title}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: '#5b6d8a', mt: 0.5 }}>
          Submitted {timeAgo(ticket.created_at)}
        </Typography>
      </Box>

      {/* Details card */}
      <Card sx={{ p: 3, bgcolor: PAPER, border: `1px solid ${BORDER}`, mb: 2 }}>
        <Typography sx={{ fontSize: 11, color: '#2ec8ff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
          Ticket details
        </Typography>
        <InfoRow label="Submitted by"  value={ticket.user_id} />
        <InfoRow label="Category"      value={ticket.category_id} />
        <InfoRow label="Department"    value={ticket.department_id ?? 'Unrouted'} valueColor={!ticket.department_id ? '#ff9bd0' : undefined} />
        <InfoRow label="Assigned to"   value={ticket.assignee_id ?? 'Unassigned'} valueColor={!ticket.assignee_id ? '#5b6d8a' : undefined} />
        <InfoRow label="Escalated"     value={ticket.ticket_escalated ? 'Yes' : 'No'} valueColor={ticket.ticket_escalated ? '#ff6b6b' : undefined} />
        <InfoRow label="Last updated"  value={timeAgo(ticket.updated_at)} />
      </Card>

      {/* Description card */}
      <Card sx={{ p: 3, bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
        <Typography sx={{ fontSize: 11, color: '#2ec8ff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
          Description
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#c8d8ee', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {ticket.ticket_description}
        </Typography>
      </Card>
    </Box>
  );
}