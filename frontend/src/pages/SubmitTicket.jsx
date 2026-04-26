import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, TextField, Button,
  CircularProgress, Alert, Dialog, DialogContent,
} from '@mui/material';
import api from '../helpers/api';

const ACCENT = '#6fdcff';
const PAPER  = '#0f1f3a';
const BORDER = 'rgba(143,162,192,0.12)';

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICON = {
  'it support':       { icon: 'computer',       color: '#2ec8ff', bg: 'rgba(46,200,255,0.12)'  },
  'facilities':       { icon: 'build',           color: '#ffb547', bg: 'rgba(255,181,71,0.12)'  },
  'administration':   { icon: 'business_center', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  'library services': { icon: 'menu_book',       color: '#2bd48f', bg: 'rgba(43,212,143,0.12)'  },
  'hardware':         { icon: 'memory',          color: '#2ec8ff', bg: 'rgba(46,200,255,0.12)'  },
  'software':         { icon: 'code',            color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  'physical':         { icon: 'apartment',       color: '#ffb547', bg: 'rgba(255,181,71,0.12)'  },
  'other':            { icon: 'help',            color: '#ff9bd0', bg: 'rgba(255,155,208,0.12)' },
};

function getCategoryMeta(name = '') {
  return CATEGORY_ICON[name.toLowerCase()] ?? { icon: 'category', color: ACCENT, bg: 'rgba(111,220,255,0.12)' };
}

// ─── Success dialog ───────────────────────────────────────────────────────────

function SuccessDialog({ open }) {
  const navigate = useNavigate();
  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          bgcolor: PAPER, border: `1px solid ${BORDER}`,
          borderRadius: 3, p: 1, minWidth: 400,
          boxShadow: '0 32px 80px -12px rgba(0,0,0,0.8)',
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
        {/* Check circle */}
        <Box sx={{
          width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
          display: 'grid', placeItems: 'center',
          bgcolor: 'rgba(43,212,143,0.12)',
          border: '2px solid #2bd48f',
          boxShadow: '0 0 0 8px rgba(43,212,143,0.06)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#2bd48f' }}>check</span>
        </Box>

        <Typography variant="h5" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif', fontWeight: 700, mb: 1 }}>
          Ticket submitted!
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: '#8fa2c0', lineHeight: 1.7, mb: 3.5 }}>
          Your request has been received.<br />
          We'll get back to you shortly.
        </Typography>

        <Button
          variant="contained" fullWidth
          onClick={() => navigate('/home')}
          sx={{ py: 1.3, fontWeight: 700, fontSize: 14 }}
        >
          Back to home
        </Button>
        <Button
          fullWidth
          onClick={() => navigate('/home/tickets')}
          sx={{ mt: 1, py: 1, color: '#8fa2c0', fontSize: 13 }}
        >
          View my tickets
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ step }) {
  const steps = ['Category', 'Details', 'Review & submit'];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3.5 }}>
      {steps.map((label, i) => {
        const idx    = i + 1;
        const done   = step > idx;
        const active = step === idx;
        const color  = done ? '#2bd48f' : active ? ACCENT : '#3a4f6a';
        const bg     = done ? 'rgba(43,212,143,0.15)' : active ? 'rgba(111,220,255,0.15)' : 'rgba(58,79,106,0.2)';

        return (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
              <Box sx={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                bgcolor: bg, border: `1.5px solid ${color}`,
                fontSize: 11, fontWeight: 700, color, flexShrink: 0,
              }}>
                {done
                  ? <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check</span>
                  : idx}
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: active || done ? 600 : 400, color, whiteSpace: 'nowrap' }}>
                {label}
              </Typography>
            </Box>
            {i < steps.length - 1 && (
              <Box sx={{ flex: 1, height: 1.5, mx: 1.5, bgcolor: done ? '#2bd48f' : BORDER, borderRadius: 1, minWidth: 20 }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Step 1: Category ─────────────────────────────────────────────────────────

function StepCategory({ categories, selected, onSelect }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#e6edf7', mb: 0.5 }}>What is this about?</Typography>
      <Typography sx={{ fontSize: 13, color: '#8fa2c0', mb: 2.5 }}>
        Pick the closest category. If none fits, choose{' '}
        <span style={{ color: '#ff9bd0', fontWeight: 700 }}>Other</span>
        {' '}— a help-desk admin will route your ticket within 1 business hour.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {categories.map(cat => {
          const meta   = getCategoryMeta(cat.category_name);
          const active = selected?.category_id === cat.category_id;

          return (
            <Box
              key={cat.category_id}
              onClick={() => onSelect(cat)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                p: 2, borderRadius: 2, cursor: 'pointer',
                border: `1.5px solid ${active ? meta.color : BORDER}`,
                bgcolor: active ? meta.bg : 'rgba(10,22,40,0.3)',
                transition: 'all .15s',
                '&:hover': { border: `1.5px solid ${meta.color}`, bgcolor: meta.bg },
              }}
            >
              <Box sx={{
                width: 44, height: 44, borderRadius: 1.5, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                bgcolor: meta.bg, color: meta.color,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{meta.icon}</span>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e6edf7' }}>
                  {cat.category_name}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: '#8fa2c0' }}>
                  {cat.category_name.toLowerCase() === 'other'
                    ? 'Help-desk admin will route'
                    : `→ ${cat.category_name} dept`}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Step 2: Details ──────────────────────────────────────────────────────────

function StepDetails({ form, onChange, files, onFiles }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#e6edf7', mb: 2 }}>Tell us more</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          placeholder="Subject"
          value={form.ticket_title}
          onChange={e => onChange('ticket_title', e.target.value)}
          fullWidth
          inputProps={{ maxLength: 150 }}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: 14 } }}
        />

        <TextField
          placeholder="Describe the problem"
          value={form.ticket_description}
          onChange={e => onChange('ticket_description', e.target.value)}
          fullWidth multiline rows={5}
          inputProps={{ maxLength: 1000 }}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: 14 } }}
        />

        {/* Attach files */}
        <Box>
          <input
            type="file" multiple
            id="tf-attach"
            style={{ display: 'none' }}
            onChange={e => onFiles(Array.from(e.target.files))}
          />
          <Button
            component="label" htmlFor="tf-attach"
            variant="outlined" size="small"
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>attach_file</span>}
            sx={{ color: '#8fa2c0', borderColor: BORDER, fontSize: 13 }}
          >
            Attach files
          </Button>

          {files.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {files.map((f, i) => (
                <Box key={i} sx={{
                  px: 1.25, py: 0.4, borderRadius: 1, fontSize: 11.5,
                  bgcolor: 'rgba(46,200,255,0.08)', color: '#6fdcff',
                  border: '1px solid rgba(46,200,255,0.2)',
                }}>
                  {f.name}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────

function StepReview({ form, category, files }) {
  const labelSx = {
    fontSize: 11, fontWeight: 700, color: '#5b6d8a',
    letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5,
  };
  const valueSx = { fontSize: 14, color: '#e6edf7', fontWeight: 500 };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#e6edf7', mb: 2.5 }}>Review</Typography>
      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(10,22,40,0.5)', border: `1px solid ${BORDER}` }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>Category</Typography>
          <Typography sx={valueSx}>{category?.category_name}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>Subject</Typography>
          <Typography sx={valueSx}>{form.ticket_title}</Typography>
        </Box>
        <Box sx={{ mb: files.length > 0 ? 2 : 0 }}>
          <Typography sx={labelSx}>Description</Typography>
          <Typography sx={{ ...valueSx, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {form.ticket_description}
          </Typography>
        </Box>
        {files.length > 0 && (
          <Box>
            <Typography sx={labelSx}>Attachments</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
              {files.map((f, i) => (
                <Box key={i} sx={{
                  px: 1.25, py: 0.4, borderRadius: 1, fontSize: 11.5,
                  bgcolor: 'rgba(46,200,255,0.08)', color: '#6fdcff',
                  border: '1px solid rgba(46,200,255,0.2)',
                }}>
                  {f.name}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubmitTicket() {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(1);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState({ ticket_title: '', ticket_description: '' });
  const [files,      setFiles]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setCatLoading(false));
  }, []);

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const canContinue = () => {
    if (step === 1) return !!selected;
    if (step === 2) return form.ticket_title.trim() && form.ticket_description.trim();
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step < 3) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/tickets', {
        ticket_title:       form.ticket_title.trim(),
        ticket_description: form.ticket_description.trim(),
        category_id:        selected.category_id,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <SuccessDialog open={success} />

      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
          New request
        </Typography>
        <Typography variant="h4" sx={{ color: '#e6edf7', fontFamily: '"Rubik", sans-serif', fontWeight: 700 }}>
          Submit a ticket
        </Typography>
      </Box>

      <Box sx={{ height: 1, bgcolor: BORDER, mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2, maxWidth: 860, mx: 'auto' }}>{error}</Alert>}

      <Card sx={{ p: 3.5, bgcolor: PAPER, border: `1px solid ${BORDER}`, maxWidth: 860, mx: 'auto' }}>
        <Stepper step={step} />

        {catLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={28} sx={{ color: ACCENT }} />
          </Box>
        ) : (
          <>
            {step === 1 && <StepCategory categories={categories} selected={selected} onSelect={setSelected} />}
            {step === 2 && <StepDetails form={form} onChange={handleChange} files={files} onFiles={setFiles} />}
            {step === 3 && <StepReview form={form} category={selected} files={files} />}
          </>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3.5 }}>
          {step > 1 ? (
            <Typography onClick={() => setStep(s => s - 1)} sx={{
              fontSize: 13.5, color: ACCENT, cursor: 'pointer', fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}>
              Back
            </Typography>
          ) : <Box />}

          <Button
            variant="contained"
            disabled={!canContinue() || loading}
            onClick={handleNext}
            startIcon={step === 3
              ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
              : null}
            sx={{ px: 3.5, py: 1, fontWeight: 700, fontSize: 14 }}
          >
            {loading ? 'Submitting…' : step === 3 ? 'Submit ticket' : 'Continue'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}