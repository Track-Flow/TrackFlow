import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Avatar,
  Button, Chip, Tooltip,
} from '@mui/material';
import api from '../helpers/api';
import { priorityMeta, timeAgo } from '../helpers/ticketHelpers';

// ─── Theme tokens (consistent with TLAHome) ──────────────────────────────────
const ACCENT  = '#2ec8ff';
const PAPER   = '#0f1f3a';
const PAPER2  = '#0a1628';
const BORDER  = 'rgba(143,162,192,0.12)';
const BG      = '#0a1628';

// ─── Kanban columns map to ticket_status ─────────────────────────────────────
const COLUMNS = [
  { key: 'open',        label: 'Open',        color: '#2ec8ff', icon: 'inbox'         },
  { key: 'in_progress', label: 'In Progress', color: '#ffb547', icon: 'pending_actions'},
  { key: 'pending',     label: 'Pending',     color: '#c084fc', icon: 'hourglass_top' },
  { key: 'resolved',    label: 'Resolved',    color: '#2bd48f', icon: 'check_circle'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getPriorityColor(priority) {
  const map = { urgent: '#ff6b6b', high: '#ffb547', medium: '#6fdcff', low: '#8fa2c0' };
  return map[priority] ?? '#8fa2c0';
}

// ─── Ticket Card ─────────────────────────────────────────────────────────────
function TicketCard({ ticket, onDragStart, onClick, isDragging }) {
  const { color: pColor } = priorityMeta(ticket.ticket_priority ?? 'low');
  const initials = getInitials(ticket.user_name ?? ticket.user_id ?? '??');
  const priorityColor = getPriorityColor(ticket.ticket_priority);

  return (
    <Box
      draggable
      onDragStart={e => onDragStart(e, ticket)}
      onClick={onClick}
      sx={{
        p: 1.75,
        mb: 1,
        borderRadius: 1.5,
        bgcolor: isDragging ? 'rgba(46,200,255,0.08)' : '#0d1e38',
        border: `1px solid ${isDragging ? ACCENT : BORDER}`,
        cursor: 'grab',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all .15s',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          border: `1px solid rgba(46,200,255,0.35)`,
          bgcolor: '#0f2240',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      {/* Priority left bar */}
      <Box sx={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, bgcolor: priorityColor, borderRadius: '2px 0 0 2px',
      }} />

      {/* ID + Priority chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pl: 0.5 }}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 10.5, color: '#5b8ec2', fontWeight: 600 }}>
          #{ticket.ticket_id}
        </Typography>
        {ticket.ticket_priority && (
          <Box sx={{
            px: 0.75, py: 0.1, borderRadius: 0.75, fontSize: 9.5, fontWeight: 700,
            bgcolor: `${priorityColor}20`, color: priorityColor,
            border: `1px solid ${priorityColor}44`,
          }}>
            {ticket.ticket_priority.toUpperCase()}
          </Box>
        )}
      </Box>

      {/* Title */}
      <Typography sx={{
        fontSize: 13, fontWeight: 600, color: '#e6edf7',
        lineHeight: 1.4, mb: 1.25, pl: 0.5,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {ticket.ticket_title}
      </Typography>

      {/* Department chip */}
      {ticket.department_name && (
        <Box sx={{ pl: 0.5, mb: 1.25 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 0.75, py: 0.2, borderRadius: 0.75, fontSize: 10, fontWeight: 600,
            bgcolor: 'rgba(46,200,255,0.08)', color: '#6fdcff',
            border: '1px solid rgba(46,200,255,0.18)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 10 }}>corporate_fare</span>
            {ticket.department_name}
          </Box>
        </Box>
      )}

      {/* Footer — avatar + time */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 0.5 }}>
        <Tooltip title={ticket.user_name ?? ticket.user_id ?? 'Unknown'} arrow>
          <Avatar sx={{ width: 22, height: 22, fontSize: 9, fontWeight: 700, bgcolor: `${pColor}25`, color: pColor }}>
            {initials}
          </Avatar>
        </Tooltip>
        <Typography sx={{ fontSize: 10.5, color: '#3a4f6a' }}>
          {timeAgo(ticket.updated_at ?? ticket.created_at)}
        </Typography>
      </Box>

      {/* Escalated badge */}
      {ticket.ticket_escalated === 1 && (
        <Box sx={{
          position: 'absolute', top: 6, right: 6,
          width: 6, height: 6, borderRadius: '50%', bgcolor: '#ff6b6b',
          boxShadow: '0 0 0 2px rgba(255,107,107,0.3)',
        }} />
      )}
    </Box>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function KanbanColumn({ col, tickets, draggingId, onDragStart, onDrop, onDragOver, onCardClick }) {
  const [isOver, setIsOver] = useState(false);

  return (
    <Box
      onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { setIsOver(false); onDrop(e, col.key); }}
      sx={{
        flex: 1,
        minWidth: 240,
        maxWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${isOver ? col.color + '55' : BORDER}`,
        bgcolor: isOver ? `${col.color}06` : '#080f1e',
        transition: 'all .15s',
        overflow: 'hidden',
      }}
    >
      {/* Column header */}
      <Box sx={{
        p: 1.75,
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 1,
        borderTop: `3px solid ${col.color}`,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: col.color }}>
          {col.icon}
        </span>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#e6edf7', flex: 1 }}>
          {col.label}
        </Typography>
        <Box sx={{
          px: 0.9, py: 0.15, borderRadius: 999, fontSize: 11, fontWeight: 700,
          bgcolor: `${col.color}18`, color: col.color,
          border: `1px solid ${col.color}33`,
        }}>
          {tickets.length}
        </Box>
      </Box>

      {/* Cards */}
      <Box sx={{ p: 1.25, flex: 1, overflowY: 'auto', minHeight: 80,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(143,162,192,0.2)', borderRadius: 2 },
      }}>
        {tickets.length === 0 && (
          <Box sx={{
            p: 2, textAlign: 'center', borderRadius: 1.5,
            border: `1px dashed ${BORDER}`, mt: 0.5,
          }}>
            <Typography sx={{ fontSize: 12, color: '#3a4f6a' }}>No tickets</Typography>
          </Box>
        )}
        {tickets.map(t => (
          <TicketCard
            key={t.ticket_id}
            ticket={t}
            isDragging={draggingId === t.ticket_id}
            onDragStart={onDragStart}
            onClick={() => onCardClick(t.ticket_id)}
          />
        ))}
      </Box>
    </Box>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function TLABoard() {
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('tf_user') ?? 'null');
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const dragTicket  = useRef(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/tickets');
      // TLA sees only their department's tickets (filter by assignee dept or dept match)
      // If user has a department_id, filter; otherwise show all assigned/open
      const all = res.data;
      // Show tickets in TLA's department + unresolved tickets assigned to this TLA
      const filtered = all.filter(t =>
        !['closed'].includes(t.ticket_status) &&
        t.department_id != null
      );
      setTickets(filtered);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  // Status transition map — what moves to what
  const STATUS_NEXT = {
    open:        ['in_progress', 'pending', 'resolved'],
    in_progress: ['open', 'pending', 'resolved'],
    pending:     ['open', 'in_progress', 'resolved'],
    resolved:    ['open', 'in_progress'],
  };

  const handleDragStart = (e, ticket) => {
    dragTicket.current = ticket;
    setDraggingId(ticket.ticket_id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const ticket = dragTicket.current;
    if (!ticket || ticket.ticket_status === targetStatus) {
      setDraggingId(null);
      return;
    }
    // Optimistic update
    setTickets(prev =>
      prev.map(t => t.ticket_id === ticket.ticket_id ? { ...t, ticket_status: targetStatus } : t)
    );
    setDraggingId(null);
    try {
      await api.patch(`/api/tickets/${ticket.ticket_id}`, { ticket_status: targetStatus });
    } catch {
      // Rollback
      setTickets(prev =>
        prev.map(t => t.ticket_id === ticket.ticket_id ? { ...t, ticket_status: ticket.ticket_status } : t)
      );
      setError('Failed to update ticket status.');
    }
  };

  const ticketsByCol = col => tickets.filter(t => t.ticket_status === col);

  const totalActive = tickets.filter(t => !['resolved'].includes(t.ticket_status)).length;

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexShrink: 0 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: '#5b6d8a', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.25 }}>
            {user?.name?.split(' ')[0]} · {user?.department_name ?? 'Your department'}
          </Typography>
          <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif', fontWeight: 700 }}>
            Kanban board
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Live dot */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.6,
            px: 1.25, py: 0.5, borderRadius: 999,
            border: '1px solid rgba(43,212,143,0.3)', bgcolor: 'rgba(43,212,143,0.07)',
          }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: '#2bd48f',
              '@keyframes pulse': {
                '0%,100%': { boxShadow: '0 0 0 0 rgba(43,212,143,0.4)' },
                '50%':     { boxShadow: '0 0 0 5px rgba(43,212,143,0)' },
              },
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#2bd48f' }}>LIVE</Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/tla')}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>}
            sx={{ color: '#8fa2c0', borderColor: BORDER, fontSize: 13 }}
          >
            Dashboard
          </Button>
        </Box>
      </Box>

      {/* Stats strip */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexShrink: 0 }}>
        {COLUMNS.map(col => (
          <Box key={col.key} sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.75, borderRadius: 1.5,
            bgcolor: '#080f1e', border: `1px solid ${BORDER}`,
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color }} />
            <Typography sx={{ fontSize: 12, color: '#8fa2c0' }}>{col.label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: col.color }}>
              {loading ? '–' : ticketsByCol(col.key).length}
            </Typography>
          </Box>
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>{error}</Alert>}

      {/* Board columns */}
      {loading ? (
        <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={32} sx={{ color: ACCENT }} />
        </Box>
      ) : (
        <Box sx={{
          display: 'flex', gap: 1.5, flex: 1,
          overflowX: 'auto', overflowY: 'hidden',
          pb: 1,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(143,162,192,0.2)', borderRadius: 3 },
        }}>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.key}
              col={col}
              tickets={ticketsByCol(col.key)}
              draggingId={draggingId}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onCardClick={id => navigate(`/tickets/${id}`)}
            />
          ))}
        </Box>
      )}

      {/* Drag hint */}
      {!loading && tickets.length > 0 && (
        <Typography sx={{ fontSize: 11, color: '#3a4f6a', textAlign: 'center', mt: 1.5, flexShrink: 0 }}>
          Drag cards between columns to update ticket status
        </Typography>
      )}
    </Box>
  );
}