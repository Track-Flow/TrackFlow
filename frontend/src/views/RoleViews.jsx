import { useState } from 'react';
import {
  Grid, Card, Box, Typography, LinearProgress, Button,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Stepper, Step, StepLabel,
} from '@mui/material';
import {
  UserAvatar, PriorityPill, StatusPill, DeptPill, SlaBadge,
  SectionHeader, FlowLine,
} from '../components/Atoms';
import {
  tfTickets, tfUsers, tfDepartments, tfCategories, tfPriorities,
  tfSlaCompliance, tfTlaWorkload, tfAccessRequests,
} from '../data/mockData';
import { ROLE_META } from '../components/Shell';

/* ─── Shared KpiCard (also used by ManagerDashboard) ──────────────────── */
export function KpiCard({ label, value, delta, deltaDir = 'up', icon, accent = '#2ec8ff' }) {
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

/* ─── TrendChart (used by ManagerDashboard) ───────────────────────────── */
import { tfTrend } from '../data/mockData';

function TrendChart() {
  const w = 600, h = 180, pad = 24;
  const max = Math.max(...tfTrend.flatMap(t => [t.open, t.resolved])) + 4;
  const x = i => pad + i * ((w - pad * 2) / (tfTrend.length - 1));
  const y = v => h - pad - (v / max) * (h - pad * 2);
  const line = key => tfTrend.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(t[key])}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200, display: 'block' }}>
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="rgba(143,162,192,0.10)" strokeDasharray="2 4" />
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

/* ══════════════════════════════════════════════════════════════════════════
   END USER
   ══════════════════════════════════════════════════════════════════════════ */

export function EndUserHome({ setView }) {
  const me = 9;
  const myTix = tfTickets.filter(t => t.requesterId === me);
  const open = myTix.filter(t => !['resolved', 'closed'].includes(t.status));

  return (
    <Box sx={{ p: 3.5 }}>
      <SectionHeader eyebrow="Welcome back, Thando" title="How can we help you today?" />
      <Box sx={{ mb: 3 }}><FlowLine height={3} /></Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="overline" sx={{ color: '#2ec8ff' }}>Quick actions</Typography>
            <Typography variant="h5" sx={{ color: '#e6edf7', mb: 2 }}>Need something?</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Button variant="contained" size="large" onClick={() => setView('submit')}
                startIcon={<span className="material-symbols-outlined">add_circle</span>}>
                Submit a new ticket
              </Button>
              <Button variant="outlined" onClick={() => setView('tickets')}
                startIcon={<span className="material-symbols-outlined">history</span>}>
                View ticket history ({myTix.length})
              </Button>
            </Box>
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(46,200,255,0.06)', border: '1px solid rgba(46,200,255,0.2)' }}>
              <Typography sx={{ fontSize: 12, color: '#2ec8ff', fontWeight: 600, mb: 0.5 }}>💡 Tip</Typography>
              <Typography sx={{ fontSize: 13, color: '#c5d1e4' }}>
                Choose <b>Other</b> if no category fits — Help-desk admin will route it for you.
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="overline" sx={{ color: '#2ec8ff' }}>{open.length} active</Typography>
                <Typography variant="h5" sx={{ color: '#e6edf7' }}>My tickets</Typography>
              </Box>
              <Button size="small" onClick={() => setView('tickets')}
                endIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>}>See all</Button>
            </Box>
            {myTix.slice(0, 5).map((t, i) => (
              <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: i < 4 ? '1px solid rgba(143,162,192,0.08)' : 'none' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#5b8ec2' }}>{t.id}</Typography>
                    {t.dept && <DeptPill deptId={t.dept} />}
                    {t.status === 'unrouted' && (
                      <Chip size="small" label="Awaiting routing" sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255,155,208,0.15)', color: '#ff9bd0' }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 13.5, color: '#e6edf7' }} noWrap>{t.subject}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#5b6d8a', mt: 0.25 }}>Updated {t.updated}</Typography>
                </Box>
                <StatusPill status={t.status} />
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export function SubmitTicketView({ setView }) {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState('');
  const [pri, setPri] = useState('medium');
  const [subj, setSubj] = useState('');
  const [desc, setDesc] = useState('');
  const steps = ['Category', 'Details', 'Review & submit'];

  return (
    <Box sx={{ p: 3.5, maxWidth: 920, mx: 'auto', width: '100%' }}>
      <SectionHeader eyebrow="New request" title="Submit a ticket" />
      <Box sx={{ mb: 3 }}><FlowLine height={3} /></Box>

      <Card sx={{ p: 3.5 }}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {step === 0 && (
          <Box>
            <Typography sx={{ color: '#e6edf7', fontSize: 16, mb: 0.5, fontWeight: 600 }}>What is this about?</Typography>
            <Typography sx={{ color: '#8fa2c0', fontSize: 13, mb: 2.5 }}>
              Pick the closest category. If none fits, choose <b style={{ color: '#ff9bd0' }}>Other</b> — a help-desk admin will route your ticket within 1 business hour.
            </Typography>
            <Grid container spacing={1.5}>
              {tfCategories.map(c => {
                const dept = tfDepartments.find(d => d.name === c);
                const color = dept?.color || '#ff9bd0';
                const selected = cat === c;
                return (
                  <Grid item xs={12} sm={6} key={c}>
                    <Card onClick={() => setCat(c)} sx={{
                      p: 2, cursor: 'pointer',
                      border: selected ? `1px solid ${color}` : '1px solid rgba(143,162,192,0.14)',
                      background: selected ? `${color}10` : 'transparent',
                      '&:hover': { borderColor: color },
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'grid', placeItems: 'center', background: `${color}20`, color }}>
                          <span className="material-symbols-outlined">
                            {c.startsWith('IT') ? 'computer' : c === 'Facilities' ? 'build' : c === 'Administration' ? 'business_center' : c === 'Library Services' ? 'menu_book' : 'help_center'}
                          </span>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e6edf7' }}>{c}</Typography>
                          <Typography sx={{ fontSize: 11, color: '#8fa2c0' }}>
                            {dept ? `→ ${dept.name} dept` : 'Help-desk admin will route'}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" disabled={!cat} onClick={() => setStep(1)}>Continue</Button>
            </Box>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <Typography sx={{ color: '#e6edf7', fontSize: 16, mb: 2, fontWeight: 600 }}>Tell us more</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Subject" value={subj} onChange={e => setSubj(e.target.value)} fullWidth
                placeholder="e.g. Cannot connect to eduroam in CMD building" />
              <TextField label="Describe the problem" value={desc} onChange={e => setDesc(e.target.value)}
                multiline rows={5} fullWidth
                placeholder="When did it start? What have you tried? Any error messages?" />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={pri} label="Priority" onChange={e => setPri(e.target.value)}>
                  {tfPriorities.map(p => (
                    <MenuItem key={p.key} value={p.key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                        {p.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<span className="material-symbols-outlined">attach_file</span>} sx={{ alignSelf: 'flex-start' }}>
                Attach files
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button variant="contained" disabled={!subj} onClick={() => setStep(2)}>Continue</Button>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography sx={{ color: '#e6edf7', fontSize: 16, mb: 2, fontWeight: 600 }}>Review</Typography>
            <Box sx={{ p: 2.5, borderRadius: 2, background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(143,162,192,0.12)' }}>
              {[['Category', cat], ['Subject', subj]].map(([lbl, val]) => (
                <Box key={lbl} sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: 11, color: '#8fa2c0', textTransform: 'uppercase' }}>{lbl}</Typography>
                  <Typography sx={{ fontSize: 14, color: '#e6edf7' }}>{val}</Typography>
                </Box>
              ))}
              <Typography sx={{ fontSize: 11, color: '#8fa2c0', textTransform: 'uppercase' }}>Priority</Typography>
              <Box sx={{ mt: 0.5, mb: 1.5 }}><PriorityPill priority={pri} /></Box>
              <Typography sx={{ fontSize: 11, color: '#8fa2c0', textTransform: 'uppercase' }}>Description</Typography>
              <Typography sx={{ fontSize: 13, color: '#c5d1e4', whiteSpace: 'pre-wrap', mt: 0.5 }}>{desc || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button variant="contained" onClick={() => { alert('Ticket submitted! ID: TF-1043'); setView('tickets'); }}
                startIcon={<span className="material-symbols-outlined">send</span>}>
                Submit ticket
              </Button>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}

export function EndUserTicketsView() {
  const me = 9;
  const myTix = tfTickets.filter(t => t.requesterId === me);
  return (
    <Box sx={{ p: 3.5 }}>
      <SectionHeader eyebrow={`${myTix.length} total`} title="My tickets" />
      <Box sx={{ mb: 3 }}><FlowLine height={3} /></Box>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myTix.map(t => (
              <TableRow key={t.id} hover sx={{ cursor: 'pointer' }}>
                <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#5b8ec2' }}>{t.id}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 13.5, color: '#e6edf7' }}>{t.subject}</Typography></TableCell>
                <TableCell>{t.dept ? <DeptPill deptId={t.dept} /> : <Chip size="small" label="Routing…" sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255,155,208,0.15)', color: '#ff9bd0' }} />}</TableCell>
                <TableCell><StatusPill status={t.status} /></TableCell>
                <TableCell><Typography sx={{ fontSize: 12, color: '#8fa2c0' }}>{t.updated}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MSS MANAGER
   ══════════════════════════════════════════════════════════════════════════ */

export function ManagerDashboard({ setView }) {
  const totalOpen = tfTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;
  const breaches  = tfTickets.filter(t => t.sla?.breach).length;
  const avgSla    = Math.round(tfSlaCompliance.reduce((a, b) => a + b.actual, 0) / tfSlaCompliance.length);

  return (
    <Box sx={{ p: 3.5 }}>
      <SectionHeader
        eyebrow="MSS Operations"
        title="University-wide service overview"
        actions={<Button variant="outlined" size="small" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>}>Export weekly report</Button>}
      />
      <Box sx={{ mb: 3 }}><FlowLine height={3} /></Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><KpiCard label="Open tickets"    value={totalOpen}    delta="+4"    icon="confirmation_number" accent="#2ec8ff" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KpiCard label="SLA compliance"  value={`${avgSla}%`} delta="+1.2%" icon="verified"            accent="#2bd48f" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KpiCard label="SLA breaches"    value={breaches}     delta="−1"    deltaDir="down" icon="error"  accent="#ff6b6b" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KpiCard label="Active TLAs"     value={tfUsers.filter(u => u.role === 'tla').length} delta="0" icon="badge" accent="#c084fc" /></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="overline" sx={{ color: '#2ec8ff' }}>By department</Typography>
            <Typography variant="h5" sx={{ color: '#e6edf7', mb: 2 }}>SLA compliance</Typography>
            {tfSlaCompliance.map(s => {
              const dept = tfDepartments.find(d => d.id === s.dept);
              const ok   = s.actual >= s.target;
              return (
                <Box key={s.dept} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: dept.color }} />
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#e6edf7' }}>{dept.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>target {s.target}%</Typography>
                      <Typography sx={{ fontFamily: '"Rubik"', fontSize: 18, fontWeight: 600, color: ok ? '#2bd48f' : '#ff6b6b', minWidth: 56, textAlign: 'right' }}>{s.actual}%</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: 999, background: 'rgba(143,162,192,0.1)', overflow: 'hidden', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: `${s.target}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.4)' }} />
                    <Box sx={{ height: '100%', width: `${s.actual}%`, background: ok ? '#2bd48f' : '#ff6b6b' }} />
                  </Box>
                </Box>
              );
            })}
          </Card>

          <Card sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="overline" sx={{ color: '#2ec8ff' }}>Last 14 days</Typography>
                <Typography variant="h5" sx={{ color: '#e6edf7' }}>Ticket flow</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[['#2ec8ff', 'Opened'], ['#2bd48f', 'Resolved']].map(([c, l]) => (
                  <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                    <Typography sx={{ fontSize: 12, color: '#c5d1e4' }}>{l}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <TrendChart />
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="overline" sx={{ color: '#2ec8ff' }}>Workload</Typography>
            <Typography variant="h5" sx={{ color: '#e6edf7', mb: 1.5 }}>TLA leaderboard</Typography>
            {tfTlaWorkload.map((w, i) => {
              const u    = tfUsers.find(x => x.id === w.userId);
              const dept = tfDepartments.find(d => d.id === u.dept);
              return (
                <Box key={w.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderBottom: i < tfTlaWorkload.length - 1 ? '1px solid rgba(143,162,192,0.08)' : 'none' }}>
                  <UserAvatar user={u} size={32} tip={false} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#e6edf7' }} noWrap>{u.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <Typography sx={{ fontSize: 11, color: dept.color }}>{dept.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>· {w.active} active · {w.resolvedWk} closed/wk</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontFamily: '"Rubik"', fontSize: 14, fontWeight: 600, color: w.sla >= 90 ? '#2bd48f' : w.sla >= 80 ? '#ffb547' : '#ff6b6b' }}>{w.sla}%</Typography>
                </Box>
              );
            })}
          </Card>

          <Card sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="overline" sx={{ color: '#ff6b6b' }}>Needs attention</Typography>
                <Typography variant="h5" sx={{ color: '#e6edf7' }}>Escalations</Typography>
              </Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b6b', animation: 'tfpulse 1.4s ease-in-out infinite' }} />
                <Typography sx={{ fontSize: 11, color: '#ff6b6b', fontWeight: 600 }}>3 OPEN</Typography>
              </Box>
            </Box>
            {tfTickets.filter(t => t.sla?.breach || t.priority === 'urgent').slice(0, 3).map((t, i) => (
              <Box key={t.id} sx={{ py: 1.25, borderBottom: i < 2 ? '1px solid rgba(143,162,192,0.08)' : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#5b8ec2' }}>{t.id}</Typography>
                  <PriorityPill priority={t.priority} />
                  <SlaBadge sla={t.sla} />
                </Box>
                <Typography sx={{ fontSize: 13, color: '#e6edf7' }} noWrap>{t.subject}</Typography>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HELP-DESK ADMIN
   ══════════════════════════════════════════════════════════════════════════ */

export function HelpdeskRoutingView() {
  const unrouted = tfTickets.filter(t => t.needsRouting);
  const [picks, setPicks] = useState({});

  return (
    <Box sx={{ p: 3.5 }}>
      <SectionHeader eyebrow="Triage queue" title={`${unrouted.length} unrouted ticket${unrouted.length !== 1 ? 's' : ''}`} />
      <Box sx={{ mb: 3 }}><FlowLine height={3} /></Box>

      <Card sx={{ p: 0 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(143,162,192,0.08)' }}>
          <span className="material-symbols-outlined" style={{ color: '#ff9bd0' }}>inbox</span>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e6edf7' }}>"Other" category</Typography>
          <Typography sx={{ fontSize: 12, color: '#8fa2c0', ml: 'auto' }}>SLA: route within 1 business hour</Typography>
        </Box>

        {unrouted.length === 0 && (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography sx={{ color: '#2bd48f', fontSize: 16, fontWeight: 600 }}>✓ Inbox zero</Typography>
            <Typography sx={{ color: '#8fa2c0', fontSize: 13 }}>All tickets are routed.</Typography>
          </Box>
        )}

        {unrouted.map((t, i) => {
          const requester = tfUsers.find(u => u.id === t.requesterId);
          const pickDept  = picks[t.id];
          return (
            <Box key={t.id} sx={{ p: 2.5, borderBottom: i < unrouted.length - 1 ? '1px solid rgba(143,162,192,0.08)' : 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <UserAvatar user={requester} size={36} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#5b8ec2' }}>{t.id}</Typography>
                    <PriorityPill priority={t.priority} />
                    <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>· {requester?.name} · {requester?.sub}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: '#e6edf7', mb: 0.5 }}>{t.subject}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#8fa2c0' }}>Submitted {t.updated} · waiting on routing</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 12, color: '#8fa2c0', mr: 0.5 }}>Route to:</Typography>
                {tfDepartments.map(d => (
                  <Box key={d.id} onClick={() => setPicks({ ...picks, [t.id]: d.id })} sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: 1.25, cursor: 'pointer',
                    border: `1px solid ${pickDept === d.id ? d.color : 'rgba(143,162,192,0.2)'}`,
                    background: pickDept === d.id ? `${d.color}18` : 'transparent',
                    color: pickDept === d.id ? d.color : '#c5d1e4', fontSize: 12, fontWeight: 600,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
                    {d.name}
                  </Box>
                ))}
                <Box sx={{ flex: 1 }} />
                <Button variant="contained" size="small" disabled={!pickDept}
                  onClick={() => alert(`Routed ${t.id} to ${tfDepartments.find(d => d.id === pickDept).name}`)}
                  startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>}>
                  Route ticket
                </Button>
              </Box>
            </Box>
          );
        })}
      </Card>

      <Card sx={{ p: 2.5, mt: 2.5, display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(46,200,255,0.06)', border: '1px solid rgba(46,200,255,0.2)' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'grid', placeItems: 'center', background: 'rgba(46,200,255,0.15)', color: '#2ec8ff' }}>
          <span className="material-symbols-outlined">auto_awesome</span>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#e6edf7' }}>Pattern detected: 4 "Lost student card" tickets this week</Typography>
          <Typography sx={{ fontSize: 12, color: '#8fa2c0' }}>Add a routing rule to send these straight to Administration?</Typography>
        </Box>
        <Button variant="outlined" size="small">Create rule</Button>
      </Card>
    </Box>
  );
}

export function AccessManagementView() {
  return (
    <Box sx={{ p: 3.5 }}>
      <SectionHeader
        eyebrow="Administration"
        title="User access management"
        actions={<Button variant="contained" size="small" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>}>Add user</Button>}
      />
      <Box sx={{ mb: 3 }}><FlowLine height={3} /></Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="overline" sx={{ color: '#ffb547' }}>Pending</Typography>
            <Typography variant="h5" sx={{ color: '#e6edf7', mb: 1.5 }}>Access requests</Typography>
            {tfAccessRequests.map((r, i) => (
              <Box key={r.id} sx={{ py: 1.5, borderBottom: i < tfAccessRequests.length - 1 ? '1px solid rgba(143,162,192,0.08)' : 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e6edf7' }}>{r.user}</Typography>
                  <Chip size="small" label={r.status} sx={{
                    height: 18, fontSize: 10, textTransform: 'uppercase', fontWeight: 700,
                    bgcolor: r.status === 'pending' ? 'rgba(255,181,71,0.15)' : 'rgba(43,212,143,0.15)',
                    color:   r.status === 'pending' ? '#ffb547' : '#2bd48f',
                  }} />
                </Box>
                <Typography sx={{ fontSize: 12.5, color: '#c5d1e4', mb: 0.5 }}>{r.request}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 11, color: '#5b6d8a' }}>{r.dept} · {r.when}</Typography>
                  {r.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" variant="outlined" color="error">Deny</Button>
                      <Button size="small" variant="contained">Approve</Button>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(143,162,192,0.08)' }}>
              <Typography variant="overline" sx={{ color: '#2ec8ff' }}>Active accounts</Typography>
              <Typography variant="h5" sx={{ color: '#e6edf7' }}>Users & roles</Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tfUsers.filter(u => u.role !== 'end_user').map(u => {
                  const dept      = u.dept ? tfDepartments.find(d => d.id === u.dept) : null;
                  const roleLabel = ROLE_META[u.role]?.label || u.role;
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <UserAvatar user={u} size={26} tip={false} />
                          <Typography sx={{ fontSize: 13.5, color: '#e6edf7' }}>{u.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip size="small" label={roleLabel} sx={{ height: 20, fontSize: 11 }} /></TableCell>
                      <TableCell>{dept ? <DeptPill deptId={dept.id} /> : <Typography sx={{ fontSize: 12, color: '#5b6d8a' }}>—</Typography>}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: '#8fa2c0' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   GENERIC STUB — for views not yet built
   ══════════════════════════════════════════════════════════════════════════ */

export function RoleStub({ icon = 'construction', title, blurb }) {
  return (
    <Box sx={{ p: 6, display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 60px)' }}>
      <Card sx={{ p: 5, textAlign: 'center', maxWidth: 520 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: 2, mx: 'auto', mb: 2, display: 'grid', placeItems: 'center', background: 'rgba(46,200,255,0.1)', color: '#2ec8ff' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>{icon}</span>
        </Box>
        <Typography variant="h4" sx={{ color: '#e6edf7', mb: 1 }}>{title}</Typography>
        <Typography sx={{ color: '#8fa2c0', fontSize: 13.5 }}>{blurb}</Typography>
      </Card>
    </Box>
  );
}
