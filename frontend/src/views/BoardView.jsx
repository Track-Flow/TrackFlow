import { Card, Box, Typography, Button, IconButton, LinearProgress } from '@mui/material';
import { UserStack, FlowLine } from '../components/Atoms';
import { tfTasks, tfBoardColumns, tfPriorities } from '../data/mockData';

function LabelChip({ text }) {
  const colors = {
    Research: ['#6fdcff', 'rgba(111,220,255,0.15)'],
    Docs: ['#c084fc', 'rgba(192,132,252,0.15)'],
    IT: ['#ff6b6b', 'rgba(255,107,107,0.15)'],
    Platform: ['#2bd48f', 'rgba(43,212,143,0.15)'],
    Content: ['#2ec8ff', 'rgba(46,200,255,0.15)'],
  };
  const [c, bg] = colors[text] || ['#8fa2c0', 'rgba(143,162,192,0.15)'];
  return (
    <Box sx={{ display: 'inline-block', px: 0.9, py: 0.2, borderRadius: 0.75, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', color: c, background: bg, border: `1px solid ${c}33` }}>{text}</Box>
  );
}

function TaskCard({ task }) {
  const p = tfPriorities.find(x => x.key === task.priority);
  const isOverdue = task.due === 'Overdue';

  return (
    <Card sx={{
      p: 1.5, mb: 1.25, cursor: 'pointer',
      background: '#0f1f3a', border: '1px solid rgba(143,162,192,0.12)',
      transition: 'all .15s', position: 'relative',
      '&:hover': { borderColor: 'rgba(46,200,255,0.5)', transform: 'translateY(-1px)', boxShadow: '0 8px 22px -10px rgba(46,200,255,0.35)' },
    }}>
      {task.cover === 'band' && (
        <Box sx={{ height: 3, mx: -1.5, mt: -1.5, mb: 1.25, background: p?.color, borderTopLeftRadius: 11, borderTopRightRadius: 11 }} />
      )}

      <Typography sx={{ fontSize: 13.5, color: '#e6edf7', fontWeight: 500, lineHeight: 1.4, mb: 1 }}>{task.title}</Typography>

      {task.internal && (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 1, px: 0.85, py: 0.3, borderRadius: 0.75, background: 'rgba(255,181,71,0.10)', border: '1px solid rgba(255,181,71,0.3)', fontSize: 10.5, fontWeight: 600, color: '#ffb547' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>lock</span>
          Internal
        </Box>
      )}

      {task.checklistTotal > 0 && (
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, fontSize: 11, color: '#8fa2c0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>checklist</span>
              {task.checklistDone}/{task.checklistTotal}
            </Box>
            <Typography sx={{ fontSize: 10.5, color: '#5b6d8a', fontWeight: 600 }}>{Math.round((task.checklistDone / task.checklistTotal) * 100)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(task.checklistDone / task.checklistTotal) * 100} sx={{ height: 4, borderRadius: 2 }} />
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: 11.5, color: '#8fa2c0' }}>
          {task.due && task.due !== '—' && (
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.3,
              color: isOverdue ? '#ff6b6b' : '#8fa2c0',
              fontWeight: isOverdue ? 600 : 400,
              px: isOverdue ? 0.75 : 0, py: isOverdue ? 0.15 : 0, borderRadius: 0.75,
              background: isOverdue ? 'rgba(255,107,107,0.12)' : 'transparent',
              border: isOverdue ? '1px solid rgba(255,107,107,0.3)' : 'none',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
              {task.due}
            </Box>
          )}
          {task.comments > 0 && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}><span className="material-symbols-outlined" style={{ fontSize: 13 }}>mode_comment</span>{task.comments}</Box>}
          {task.attachments > 0 && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}><span className="material-symbols-outlined" style={{ fontSize: 13 }}>attach_file</span>{task.attachments}</Box>}
          {p && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, color: p.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 10 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
            {p.label}
          </Box>}
        </Box>
        <UserStack ids={task.assignees} size={22} />
      </Box>

      <Typography sx={{ position: 'absolute', top: 8, right: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#5b6d8a', fontWeight: 600 }}>{task.id}</Typography>
    </Card>
  );
}

function BoardColumn({ col }) {
  const items = tfTasks.filter(t => t.column === col.key);
  return (
    <Box sx={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 220px)' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 1.5, py: 1.25, mb: 1, borderRadius: 1.5,
        background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(143,162,192,0.12)',
        borderLeft: `3px solid ${col.color}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 12.5, color: '#e6edf7', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{col.title}</Typography>
          <Box sx={{ minWidth: 22, px: 0.75, borderRadius: 999, textAlign: 'center', background: `${col.color}20`, color: col.color, fontSize: 11, fontWeight: 700 }}>{items.length}</Box>
        </Box>
        <IconButton size="small" sx={{ color: '#8fa2c0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
        </IconButton>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1, pr: 0.5, mr: -0.5 }}>
        {items.map(t => <TaskCard key={t.id} task={t} />)}
        <Button fullWidth startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}
          sx={{ color: '#8fa2c0', justifyContent: 'flex-start', fontSize: 12.5, py: 1, border: '1px dashed rgba(143,162,192,0.2)', borderRadius: 1.25, '&:hover': { color: '#2ec8ff', borderColor: '#2ec8ff55', background: 'rgba(46,200,255,0.04)' } }}>
          Add card
        </Button>
      </Box>
    </Box>
  );
}

export default function BoardView() {
  return (
    <Box sx={{ p: 3.5, pt: 3, height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: '#2ec8ff' }}>IT Support · Tier-Level Agent board</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ color: '#e6edf7' }}>My team's tasks</Typography>
            <Box sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#6fdcff', px: 1, py: 0.25, border: '1px solid rgba(46,200,255,0.3)', borderRadius: 0.75, background: 'rgba(46,200,255,0.08)' }}>
              IT-DEPT
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.75, fontSize: 12.5, color: '#8fa2c0' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>task_alt</span>
              {tfTasks.filter(t => t.column === 'done').length}/{tfTasks.length} done
            </Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>confirmation_number</span>
              {tfTasks.filter(t => !t.internal).length} linked tickets
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <UserStack ids={[1, 3, 6]} size={28} />
          <Button variant="outlined" size="small" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>}>Filter</Button>
          <Button variant="contained" size="small" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}>Add task</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}><FlowLine height={3} /></Box>

      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', pb: 1, flex: 1, alignItems: 'flex-start' }}>
        {tfBoardColumns.map(c => <BoardColumn key={c.key} col={c} />)}
        <Box sx={{ width: 280, flexShrink: 0 }}>
          <Button fullWidth startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}
            sx={{ color: '#8fa2c0', border: '1px dashed rgba(143,162,192,0.2)', py: 1.25, justifyContent: 'flex-start', '&:hover': { color: '#2ec8ff', borderColor: '#2ec8ff55', background: 'rgba(46,200,255,0.04)' } }}>
            Add column
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
