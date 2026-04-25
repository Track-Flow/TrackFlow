import { useState } from 'react';
import {
  Card, Box, Typography, Button, TextField, IconButton, Table, TableHead, TableBody,
  TableRow, TableCell, Checkbox, Chip, Drawer, Tabs, Tab,
} from '@mui/material';
import { UserAvatar, PriorityPill, StatusPill, DeptPill, SlaBadge, SectionHeader, FlowLine } from '../components/Atoms';
import { tfTickets, tfUsers } from '../data/mockData';

function FilterChip({ label, active, onClick, count }) {
  return (
    <Box onClick={onClick} sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
      px: 1.25, py: 0.5, borderRadius: 999, fontSize: 12.5, fontWeight: 600,
      border: `1px solid ${active ? '#2ec8ff' : 'rgba(143,162,192,0.2)'}`,
      background: active ? 'rgba(46,200,255,0.12)' : 'transparent',
      color: active ? '#2ec8ff' : '#c5d1e4', transition: 'all .15s',
      '&:hover': { borderColor: '#2ec8ff55' },
    }}>
      {label}
      {count != null && (
        <Box sx={{ fontSize: 10, px: 0.6, borderRadius: 0.75, background: active ? 'rgba(46,200,255,0.2)' : 'rgba(143,162,192,0.12)', color: active ? '#2ec8ff' : '#8fa2c0' }}>{count}</Box>
      )}
    </Box>
  );
}

function TicketDetail({ ticket, onClose }) {
  if (!ticket) return null;
  const assignee  = tfUsers.find(u => u.id === ticket.assignee);
  const requester = tfUsers.find(u => u.id === ticket.requesterId);
  const thread = [
    { who: ticket.requesterId, time: ticket.created, text: 'VPN drops every 15 minutes even on a wired connection. Already tried reconnecting, rebooting, reinstalling the client. Logs attached.', isRequester: true, attachments: 2 },
    { who: 1, time: '1h ago', text: 'Thanks — I can see the pattern in the logs. It lines up with a gateway keep-alive timeout. Rolling out a config change to the staging gateway first, will ping you to retest.' },
    { who: 1, time: '32m ago', internal: true, text: 'Internal note: FYI team, we traced this back to the gateway we flagged last sprint (KB-32). Linking KB article.' },
    { who: 3, time: '18m ago', internal: true, text: 'Internal note: Great, going to use the same fix for TF-1035 once confirmed.' },
  ];

  return (
    <Drawer anchor="right" open={!!ticket} onClose={onClose} PaperProps={{
      sx: { width: 560, background: '#0b1a33', borderLeft: '1px solid rgba(143,162,192,0.12)' }
    }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(143,162,192,0.10)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#6fdcff' }}>{ticket.id}</Typography>
            <StatusPill status={ticket.status} />
            <PriorityPill priority={ticket.priority} />
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#8fa2c0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </IconButton>
        </Box>
        <Typography variant="h4" sx={{ color: '#e6edf7', fontSize: 20, mb: 1.25, lineHeight: 1.25 }}>{ticket.subject}</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
          <Typography sx={{ color: '#5b6d8a', fontSize: 12 }}>Requester</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {requester && <UserAvatar user={requester} size={18} tip={false} />}
            <Typography sx={{ color: '#e6edf7', fontSize: 12.5, fontWeight: 500 }}>{requester?.name || 'Unknown'}</Typography>
          </Box>

          <Typography sx={{ color: '#5b6d8a', fontSize: 12 }}>Assignee</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {assignee
              ? <><UserAvatar user={assignee} size={20} tip={false} /><Typography sx={{ color: '#e6edf7', fontSize: 12.5, fontWeight: 500 }}>{assignee.name}</Typography></>
              : <Typography sx={{ color: '#ffb547', fontSize: 12.5 }}>Unassigned</Typography>}
          </Box>

          <Typography sx={{ color: '#5b6d8a', fontSize: 12 }}>Category</Typography>
          <Typography sx={{ color: '#c5d1e4', fontSize: 12.5 }}>{ticket.category}</Typography>

          {ticket.dept && <>
            <Typography sx={{ color: '#5b6d8a', fontSize: 12 }}>Department</Typography>
            <Box><DeptPill deptId={ticket.dept} /></Box>
          </>}

          {ticket.linkedTask && <>
            <Typography sx={{ color: '#5b6d8a', fontSize: 12 }}>Linked task</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#c084fc', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
              {ticket.linkedTask}
            </Box>
          </>}

          <Typography sx={{ color: '#5b6d8a', fontSize: 12 }}>Created</Typography>
          <Typography sx={{ color: '#c5d1e4', fontSize: 12.5 }}>{ticket.created}</Typography>
        </Box>
      </Box>

      <Tabs value={0} sx={{
        px: 2.5, borderBottom: '1px solid rgba(143,162,192,0.10)', minHeight: 40,
        '& .MuiTab-root': { minHeight: 40, fontSize: 12.5, textTransform: 'none', color: '#8fa2c0' },
        '& .Mui-selected': { color: '#2ec8ff !important' },
        '& .MuiTabs-indicator': { background: '#2ec8ff' },
      }}>
        <Tab label={`Thread · ${thread.length}`} />
        <Tab label="Properties" />
        <Tab label="History" />
      </Tabs>

      <Box sx={{ p: 2.5, flex: 1, overflow: 'auto' }}>
        {thread.map((m, i) => {
          const u = tfUsers.find(x => x.id === m.who);
          return (
            <Box key={i} sx={{ mb: 2, display: 'flex', gap: 1.5 }}>
              {u && <UserAvatar user={u} size={32} />}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#e6edf7' }}>{u?.name || 'Unknown'}</Typography>
                  {m.isRequester && <Chip label="Requester" size="small" sx={{ height: 16, fontSize: 10, color: '#6fdcff', background: 'rgba(46,200,255,0.12)' }} />}
                  {m.internal && <Chip label="Internal" size="small" sx={{ height: 16, fontSize: 10, color: '#ffb547', background: 'rgba(255,181,71,0.14)' }} />}
                  <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>{m.time}</Typography>
                </Box>
                <Box sx={{
                  p: 1.5, borderRadius: 1.5,
                  background: m.internal ? 'rgba(255,181,71,0.06)' : 'rgba(10,22,40,0.55)',
                  border: `1px solid ${m.internal ? 'rgba(255,181,71,0.25)' : 'rgba(143,162,192,0.12)'}`,
                }}>
                  <Typography sx={{ fontSize: 13, color: '#c5d1e4', lineHeight: 1.55 }}>{m.text}</Typography>
                  {m.attachments && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.25 }}>
                      {Array.from({ length: m.attachments }).map((_, j) => (
                        <Box key={j} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, border: '1px solid rgba(143,162,192,0.18)', borderRadius: 1, background: 'rgba(10,22,40,0.8)', fontSize: 11, color: '#c5d1e4' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#2ec8ff' }}>description</span>
                          vpn-log-{j + 1}.txt · 12 KB
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(143,162,192,0.10)' }}>
          <TextField multiline rows={3} fullWidth placeholder="Write a reply… (Shift+Enter for new line)" sx={{ mb: 1.5 }} />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>attach_file</span>}>Attach</Button>
              <Button size="small" variant="outlined" sx={{ color: '#ffb547', borderColor: 'rgba(255,181,71,0.3)' }}>Internal note</Button>
            </Box>
            <Button size="small" variant="contained" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>}>Reply</Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export default function TicketsView() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [activeTicket, setActiveTicket] = useState(null);

  const filtered = tfTickets.filter(t => {
    if (filter === 'open')     return ['open', 'in_progress', 'pending'].includes(t.status);
    if (filter === 'resolved') return ['resolved', 'closed'].includes(t.status);
    if (filter === 'unrouted') return t.status === 'unrouted';
    return true;
  });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Box sx={{ p: 3.5 }}>
      <SectionHeader
        eyebrow={`${tfTickets.length} total`}
        title="Ticket queue"
        actions={<>
          <Button variant="outlined" size="small" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>}>Filter</Button>
          <Button variant="contained" size="small" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}>New ticket</Button>
        </>}
      />
      <Box sx={{ mb: 2 }}><FlowLine height={3} /></Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={tfTickets.length} />
        <FilterChip label="Open" active={filter === 'open'} onClick={() => setFilter('open')} count={tfTickets.filter(t => ['open', 'in_progress', 'pending'].includes(t.status)).length} />
        <FilterChip label="Resolved" active={filter === 'resolved'} onClick={() => setFilter('resolved')} count={tfTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length} />
        <FilterChip label="Unrouted" active={filter === 'unrouted'} onClick={() => setFilter('unrouted')} count={tfTickets.filter(t => t.status === 'unrouted').length} />
      </Box>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox size="small" sx={{ color: '#5b6d8a' }} /></TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Meta</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id} hover onClick={() => setActiveTicket(t)} sx={{
                cursor: 'pointer',
                '&:hover': { background: 'rgba(46,200,255,0.04)' },
                ...(selected.has(t.id) && { background: 'rgba(46,200,255,0.08)' }),
              }}>
                <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                  <Checkbox size="small" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)}
                    sx={{ color: '#5b6d8a', '&.Mui-checked': { color: '#2ec8ff' } }} />
                </TableCell>
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#6fdcff' }}>{t.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: 13.5, color: '#e6edf7', fontWeight: 500 }}>{t.subject}</Typography>
                    {t.linkedTask && (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.75, py: 0.2, borderRadius: 0.75, background: 'rgba(192,132,252,0.12)', color: '#c084fc', fontSize: 10.5, fontWeight: 600 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>link</span>linked
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: '#8fa2c0', mt: 0.25 }}>
                    by {tfUsers.find(u => u.id === t.requesterId)?.name || 'Unknown'} · {t.created}
                  </Typography>
                </TableCell>
                <TableCell><Chip size="small" label={t.category} sx={{ height: 22, fontSize: 11, background: 'rgba(143,162,192,0.1)', color: '#c5d1e4', border: '1px solid rgba(143,162,192,0.2)' }} /></TableCell>
                <TableCell><PriorityPill priority={t.priority} /></TableCell>
                <TableCell><StatusPill status={t.status} /></TableCell>
                <TableCell>
                  {t.assignee
                    ? <UserAvatar user={tfUsers.find(u => u.id === t.assignee)} size={26} />
                    : <Box sx={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px dashed rgba(143,162,192,0.3)', display: 'grid', placeItems: 'center', color: '#5b6d8a' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                      </Box>}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1.5, color: '#8fa2c0', fontSize: 12 }}>
                    {t.comments > 0 && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>mode_comment</span>{t.comments}</Box>}
                    {t.attachments > 0 && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>attach_file</span>{t.attachments}</Box>}
                    <SlaBadge sla={t.sla} />
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#8fa2c0', fontSize: 12 }}>{t.updated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <TicketDetail ticket={activeTicket} onClose={() => setActiveTicket(null)} />
    </Box>
  );
}
