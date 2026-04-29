import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, CircularProgress,
  Alert, Button, Divider, Chip,
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
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('tf_user') ?? 'null');

  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchTicket = () => {
    api.get(`/api/tickets/${id}`)
      .then(res => setTicket(res.data))
      .catch(err => setError(err.response?.data?.error ?? 'Failed to load ticket.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id]);

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

  // Resolve assignee display — use joined name from GET /api/tickets/:id if available
  const assignedUserId  = ticket.assigned_user_id ?? ticket.assignee_id;
  const assigneeName    = ticket.assignee_name;
  const assigneeFirst   = assigneeName ? assigneeName.split(' ')[0] : null;
  const assigneeDisplay = assigneeName ?? assignedUserId ?? null;

  const isResolved    = ticket.ticket_status === 'resolved';
  const isAssignedToMe = assignedUserId === user?.id;
  const isTLA         = user?.role === 'tla';

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      {/* Back */}
      <Button
        size="small"
        onClick={() => navigate(backPath)}
        startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>}
        sx={{ color: '#8fa2c0', mb: 2, pl: 0 }}
      >
        Back
      </Button>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#5b8ec2' }}>
            #{ticket.ticket_id}
          </Typography>
          {/* Status badge */}
          <Box sx={{ px: 0.9, py: 0.2, borderRadius: 0.75, fontSize: 11, fontWeight: 700, bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}44` }}>
            {sLabel}
          </Box>
          {/* Priority badge */}
          <Box sx={{ px: 0.9, py: 0.2, borderRadius: 0.75, fontSize: 11, fontWeight: 700, bgcolor: `${pColor}18`, color: pColor, border: `1px solid ${pColor}44` }}>
            {pLabel}
          </Box>
          {/* Resolved lock */}
          {isResolved && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: 1, bgcolor: 'rgba(43,212,143,0.08)', border: '1px solid rgba(43,212,143,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#2bd48f' }}>lock</span>
              <Typography sx={{ fontSize: 11, color: '#2bd48f', fontWeight: 700 }}>Locked</Typography>
            </Box>
          )}
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

        {/* Submitted by — use user_name if available */}
        <InfoRow
          label="Submitted by"
          value={ticket.user_name ?? ticket.user_id}
        />

        {/* Category — use category_name if joined, else ID */}
        <InfoRow
          label="Category"
          value={ticket.category_name ?? ticket.category_id ?? '—'}
        />

        {/* Department — use department_name if joined */}
        <InfoRow
          label="Department"
          value={ticket.department_name ?? (ticket.department_id ? String(ticket.department_id) : 'Unrouted')}
          valueColor={!ticket.department_id ? '#ff9bd0' : undefined}
        />

        {/* Assigned to — first name + full name on hover via title */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.25, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: 12, color: '#5b6d8a', minWidth: 130, flexShrink: 0 }}>Assigned to</Typography>
          {assigneeDisplay ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(46,200,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#2ec8ff' }}>
                  {assigneeName ? assigneeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 13.5, color: '#6fdcff', fontWeight: 600 }} title={assigneeDisplay}>
                {assigneeFirst ?? assigneeDisplay}
                {isAssignedToMe && <span style={{ color: '#5b6d8a', fontSize: 11, marginLeft: 6 }}>(you)</span>}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: 13.5, color: '#5b6d8a', fontWeight: 500 }}>Unassigned</Typography>
          )}
        </Box>

        <InfoRow
          label="Escalated"
          value={ticket.ticket_escalated ? 'Yes' : 'No'}
          valueColor={ticket.ticket_escalated ? '#ff6b6b' : undefined}
        />
        <InfoRow label="Last updated" value={timeAgo(ticket.updated_at)} />

        {/* Resolution notes — show if resolved */}
        {isResolved && ticket.resolution_notes && (
          <Box sx={{ pt: 1.25 }}>
            <Typography sx={{ fontSize: 12, color: '#5b6d8a', mb: 0.5 }}>Resolution notes</Typography>
            <Typography sx={{ fontSize: 13.5, color: '#2bd48f', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {ticket.resolution_notes}
            </Typography>
          </Box>
        )}
      </Card>

      {/* Description card */}
      <Card sx={{ p: 3, bgcolor: PAPER, border: `1px solid ${BORDER}`, mb: 2 }}>
        <Typography sx={{ fontSize: 11, color: '#2ec8ff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
          Description
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#c8d8ee', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {ticket.ticket_description}
        </Typography>
      </Card>

      {/* TLA actions — only if assigned to me and not resolved */}
      {isTLA && isAssignedToMe && !isResolved && (
        <Card sx={{ p: 2.5, bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: 11, color: '#5b6d8a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
            Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {ticket.ticket_status === 'open' && (
              <Button
                variant="outlined"
                size="small"
                onClick={async () => {
                  await api.patch(`/api/tickets/${id}`, { ticket_status: 'in_progress' });
                  fetchTicket();
                }}
                startIcon={<span className="material-symbols-outlined" style={{ fontSize: 15 }}>play_arrow</span>}
                sx={{ fontSize: 12 }}
              >
                Start
              </Button>
            )}
            {ticket.ticket_status === 'open' || ticket.ticket_status === 'in_progress' ? (
              <Button
                variant="outlined"
                size="small"
                onClick={async () => {
                  await api.patch(`/api/tickets/${id}`, { ticket_status: 'pending' });
                  fetchTicket();
                }}
                startIcon={<span className="material-symbols-outlined" style={{ fontSize: 15 }}>hourglass_top</span>}
                sx={{ fontSize: 12, color: '#c084fc', borderColor: 'rgba(192,132,252,0.4)' }}
              >
                Set Pending
              </Button>
            ) : null}
            {ticket.ticket_status === 'pending' && (
              <Button
                variant="outlined"
                size="small"
                onClick={async () => {
                  await api.patch(`/api/tickets/${id}`, { ticket_status: 'in_progress' });
                  fetchTicket();
                }}
                startIcon={<span className="material-symbols-outlined" style={{ fontSize: 15 }}>play_arrow</span>}
                sx={{ fontSize: 12 }}
              >
                Resume
              </Button>
            )}
          </Box>
        </Card>
      )}

      {/* Resolved state footer */}
      {isResolved && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderRadius: 1.5, bgcolor: 'rgba(43,212,143,0.06)', border: '1px solid rgba(43,212,143,0.2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#2bd48f' }}>check_circle</span>
          <Typography sx={{ fontSize: 13, color: '#2bd48f', fontWeight: 600 }}>
            This ticket has been resolved and is now locked.
          </Typography>
        </Box>
      )}
    </Box>
  );
}