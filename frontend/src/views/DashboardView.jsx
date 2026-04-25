import { useState, useMemo, useEffect } from 'react';
import { Grid, Card, Box, Typography, Button } from '@mui/material';
import { UserAvatar, PriorityPill, StatusPill, DeptPill, SlaBadge, SectionHeader, FlowLine } from '../components/Atoms';
import { tfTickets, tfUsers, tfDepartments, tfActivity, tfTrend } from '../data/mockData';

function KpiCard({ label, value, delta, deltaDir = 'up', icon, accent = '#2ec8ff' }) {
  return (
    <Card sx={{ p: 2.25, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
        <Typography sx={{ fontSize: 12, color: '#8fa2c0', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{label}</Typography>
        <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', background: `${accent}18`, color: accent }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
        </Box>
      </Box>
      <Typography sx={{ fontFamily: '"Rubik", sans-serif', fontSize: 34, fontWeight: 600, color: '#e6edf7', lineHeight: 1, mb: 0.75 }}>{value}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: deltaDir === 'up' ? '#2bd48f' : '#ff6b6b' }}>
          {deltaDir === 'up' ? 'trending_up' : 'trending_down'}
        </span>
        <Typography sx={{ fontSize: 12, color: deltaDir === 'up' ? '#2bd48f' : '#ff6b6b', fontWeight: 600 }}>{delta}</Typography>
        <Typography sx={{ fontSize: 12, color: '#5b6d8a' }}>vs last week</Typography>
      </Box>
    </Card>
  );
}

function TrendChart() {
  const w = 600, h = 180, pad = 24;
  const max = Math.max(...tfTrend.flatMap(t => [t.open, t.resolved])) + 4;
  const x = i => pad + i * ((w - pad * 2) / (tfTrend.length - 1));
  const y = v => h - pad - (v / max) * (h - pad * 2);
  const line = key => tfTrend.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(t[key])}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200, display: 'block' }}>
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)}
          stroke="rgba(143,162,192,0.10)" strokeDasharray="2 4" />
      ))}
      <path d={line('resolved')} stroke="#2bd48f" strokeWidth="1.75" fill="none" />
      <path d={line('open')} stroke="#2ec8ff" strokeWidth="1.75" fill="none" />
      {tfTrend.map((t, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(t.open)} r="3" fill="#2ec8ff" />
          <circle cx={x(i)} cy={y(t.resolved)} r="3" fill="#2bd48f" />
        </g>
      ))}
      {tfTrend.filter((_, i) => i % 3 === 0).map((t, i) => (
        <text key={i} x={x(i * 3)} y={h - 6} textAnchor="middle" fill="#5b6d8a" fontSize="10" fontFamily="Inter">{t.d}</text>
      ))}
    </svg>
  );
}

function ActivityFeed() {
  const iconFor = k => ({ assigned: 'person_add', status: 'swap_horiz', comment: 'mode_comment', resolved: 'check_circle', link: 'link', created: 'add_circle', route: 'alt_route' })[k] || 'circle';
  const colorFor = k => ({ assigned: '#2ec8ff', status: '#ffb547', comment: '#c084fc', resolved: '#2bd48f', link: '#6fdcff', created: '#8fa2c0', route: '#ff9bd0' })[k] || '#8fa2c0';

  return (
    <Box>
      {tfActivity.map((a, i) => {
        const user = tfUsers.find(u => u.id === a.who);
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, py: 1.25, borderBottom: i < tfActivity.length - 1 ? '1px solid rgba(143,162,192,0.08)' : 'none' }}>
            <Box sx={{ position: 'relative' }}>
              <UserAvatar user={user} size={28} />
              <Box sx={{
                position: 'absolute', bottom: -2, right: -4, width: 16, height: 16, borderRadius: '50%',
                background: '#0f1f3a', display: 'grid', placeItems: 'center',
                border: `1.5px solid ${colorFor(a.kind)}`,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 10, color: colorFor(a.kind) }}>{iconFor(a.kind)}</span>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, color: '#c5d1e4', lineHeight: 1.4 }}>
                <span style={{ color: '#e6edf7', fontWeight: 600 }}>{user?.name}</span> {a.text}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#5b6d8a', mt: 0.25 }}>{a.when}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function LiveTicketStream({ setView }) {
  const myId = 1;
  const [filter, setFilter] = useState('all');
  const [pulseId, setPulseId] = useState(null);

  useEffect(() => {
    const ids = tfTickets.map(t => t.id);
    const t = setInterval(() => setPulseId(ids[Math.floor(Math.random() * ids.length)]), 2800);
    return () => clearInterval(t);
  }, []);

  const stream = useMemo(() => {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    let list = [...tfTickets].sort((a, b) => order[a.priority] - order[b.priority]);
    if (filter === 'mine')       list = list.filter(t => t.assignee === myId);
    if (filter === 'unassigned') list = list.filter(t => !t.assignee);
    if (filter === 'breach')     list = list.filter(t => t.sla?.breach);
    if (filter === 'urgent')     list = list.filter(t => ['urgent', 'high'].includes(t.priority));
    return list.filter(t => !['resolved', 'closed'].includes(t.status));
  }, [filter]);

  const FilterTab = ({ label, value, count, color }) => (
    <Box onClick={() => setFilter(value)} sx={{
      cursor: 'pointer', px: 1.5, py: 0.75, borderRadius: 1.25,
      display: 'inline-flex', alignItems: 'center', gap: 0.85,
      border: `1px solid ${filter === value ? (color || '#2ec8ff') : 'rgba(143,162,192,0.18)'}`,
      background: filter === value ? `${color || '#2ec8ff'}14` : 'transparent',
      color: filter === value ? (color || '#2ec8ff') : '#c5d1e4',
      fontSize: 12.5, fontWeight: 600, transition: 'all .12s',
    }}>
      {label}
      <Box sx={{ fontSize: 10.5, fontWeight: 700, px: 0.6, borderRadius: 0.75, background: filter === value ? `${color || '#2ec8ff'}26` : 'rgba(143,162,192,0.12)' }}>{count}</Box>
    </Box>
  );

  return (
    <Card sx={{ p: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid rgba(143,162,192,0.10)', background: 'linear-gradient(180deg, rgba(46,200,255,0.04), transparent)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.5, border: '1px solid rgba(43,212,143,0.3)', borderRadius: 999, background: 'rgba(43,212,143,0.08)' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#2bd48f', animation: 'tfpulse 1.4s ease-in-out infinite' }} />
              <Typography sx={{ fontSize: 11, color: '#2bd48f', fontWeight: 700, letterSpacing: '0.08em' }}>LIVE</Typography>
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: '#2ec8ff', display: 'block', lineHeight: 1 }}>Real-time stream</Typography>
              <Typography variant="h4" sx={{ color: '#e6edf7' }}>Ticket feed</Typography>
            </Box>
          </Box>
          <Button size="small" variant="outlined" onClick={() => setView('tickets')}
            endIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>}>
            Open queue
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <FilterTab label="All active" value="all" count={tfTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length} />
          <FilterTab label="Assigned to me" value="mine" count={tfTickets.filter(t => t.assignee === myId && !['resolved', 'closed'].includes(t.status)).length} color="#2ec8ff" />
          <FilterTab label="Unassigned" value="unassigned" count={tfTickets.filter(t => !t.assignee).length} color="#ffb547" />
          <FilterTab label="SLA breach" value="breach" count={tfTickets.filter(t => t.sla?.breach).length} color="#ff6b6b" />
          <FilterTab label="Urgent + high" value="urgent" count={tfTickets.filter(t => ['urgent', 'high'].includes(t.priority) && !['resolved', 'closed'].includes(t.status)).length} color="#c084fc" />
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {stream.map((t, i) => {
          const requester = tfUsers.find(u => u.id === t.requesterId);
          const assignee  = tfUsers.find(u => u.id === t.assignee);
          const dept      = tfDepartments.find(d => d.id === t.dept);
          const isPulsing = pulseId === t.id;
          const accent    = t.priority === 'urgent' ? '#ff6b6b' : t.priority === 'high' ? '#ffb547' : t.priority === 'medium' ? '#6fdcff' : '#8fa2c0';

          return (
            <Box key={t.id} onClick={() => setView('tickets')} sx={{
              position: 'relative', display: 'flex', gap: 2, p: 2.25, cursor: 'pointer',
              borderBottom: i < stream.length - 1 ? '1px solid rgba(143,162,192,0.08)' : 'none',
              transition: 'background .18s',
              '&:hover': { background: 'rgba(46,200,255,0.04)' },
              ...(isPulsing && { background: 'rgba(46,200,255,0.06)' }),
            }}>
              <Box sx={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: 2, background: accent }} />
              <Box sx={{ pl: 1 }}>
                <UserAvatar user={requester} size={36} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, color: '#5b8ec2' }}>{t.id}</Typography>
                  <PriorityPill priority={t.priority} />
                  <StatusPill status={t.status} />
                  {dept && <DeptPill deptId={dept.id} />}
                  <SlaBadge sla={t.sla} />
                  <Box sx={{ flex: 1 }} />
                  <Typography sx={{ fontSize: 11, color: '#5b6d8a', whiteSpace: 'nowrap' }}>{t.updated}</Typography>
                </Box>
                <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: '#e6edf7', mb: 0.5, lineHeight: 1.35 }}>{t.subject}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#8fa2c0', fontSize: 12 }}>
                  <Typography sx={{ fontSize: 12, color: '#c5d1e4' }}>
                    <span style={{ color: '#e6edf7', fontWeight: 600 }}>{requester?.name?.replace(' (You)', '') || 'Unknown'}</span>
                    {requester?.sub && <span style={{ color: '#5b6d8a' }}> · {requester.sub}</span>}
                  </Typography>
                  {assignee
                    ? <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <UserAvatar user={assignee} size={18} tip={false} />
                        <Typography sx={{ fontSize: 12, color: '#c5d1e4' }}>{assignee.name.split(' ')[0]}</Typography>
                      </Box>
                    : <Typography sx={{ fontSize: 12, color: '#ffb547', fontWeight: 600 }}>Unassigned</Typography>}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end', justifyContent: 'center' }}
                onClick={e => e.stopPropagation()}>
                {!t.assignee && (
                  <Button size="small" variant="contained" sx={{ fontSize: 11, py: 0.4, px: 1.25 }}
                    startIcon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>}>Claim</Button>
                )}
                {t.assignee === myId && t.status !== 'in_progress' && (
                  <Button size="small" variant="outlined" sx={{ fontSize: 11, py: 0.4, px: 1.25 }}>Start</Button>
                )}
                {t.assignee === myId && t.status === 'in_progress' && (
                  <Button size="small" variant="outlined" color="success" sx={{ fontSize: 11, py: 0.4, px: 1.25 }}
                    startIcon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>}>Resolve</Button>
                )}
              </Box>
            </Box>
          );
        })}
        {stream.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography sx={{ color: '#2bd48f', fontSize: 16, fontWeight: 600 }}>✓ All clear</Typography>
            <Typography sx={{ color: '#8fa2c0', fontSize: 13 }}>No tickets match this filter.</Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}

export default function DashboardView({ setView }) {
  return (
    <Box sx={{ p: 3.5, pb: 2, height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader
        eyebrow="Good morning, Lerato"
        title="Live operations"
        actions={<>
          <Button variant="outlined" size="small" onClick={() => setView('board')}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_kanban</span>}>Board</Button>
          <Button variant="contained" size="small"
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}>New ticket</Button>
        </>}
      />
      <Box sx={{ mb: 2.5 }}><FlowLine height={3} /></Box>

      <Grid container spacing={1.75} sx={{ mb: 2.5 }}>
        <Grid item xs={6} sm={3}><KpiCard label="Open" value="23" delta="+4" icon="confirmation_number" accent="#2ec8ff" /></Grid>
        <Grid item xs={6} sm={3}><KpiCard label="Resolved today" value="12" delta="+18%" icon="check_circle" accent="#2bd48f" /></Grid>
        <Grid item xs={6} sm={3}><KpiCard label="Avg. resolution" value="4h 32m" delta="−12m" deltaDir="down" icon="timer" accent="#ffb547" /></Grid>
        <Grid item xs={6} sm={3}><KpiCard label="Overdue" value="6" delta="+2" icon="priority_high" accent="#ff6b6b" /></Grid>
      </Grid>

      <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 320px' } }}>
        <LiveTicketStream setView={setView} />

        <Card sx={{ p: 2.25, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#c084fc' }}>Activity</Typography>
              <Typography variant="h5" sx={{ color: '#e6edf7' }}>Team pulse</Typography>
            </Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#c084fc', animation: 'tfpulse 1.4s ease-in-out infinite' }} />
              <Typography sx={{ fontSize: 10, color: '#c084fc', fontWeight: 700 }}>LIVE</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', mx: -1, px: 1 }}>
            <ActivityFeed />
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
