import { createTheme } from '@mui/material';

const tfTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#2ec8ff', light: '#6fdcff', dark: '#1e6fd9', contrastText: '#0a1628' },
    secondary: { main: '#4bd5ff', light: '#8fe7ff', dark: '#2ec8ff' },
    background: {
      default: '#0a1628',
      paper:   '#0f1f3a',
    },
    text: {
      primary:   '#e6edf7',
      secondary: '#8fa2c0',
      disabled:  '#4f617f',
    },
    divider: 'rgba(143, 162, 192, 0.14)',
    success: { main: '#2bd48f' },
    warning: { main: '#ffb547' },
    error:   { main: '#ff6b6b' },
    info:    { main: '#6fdcff' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", system-ui, sans-serif',
    h1: { fontFamily: '"Rubik", "Helvetica Neue", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Rubik", "Helvetica Neue", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Rubik", "Helvetica Neue", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Rubik", "Helvetica Neue", sans-serif', fontWeight: 600, letterSpacing: '-0.01em', fontSize: 22 },
    h5: { fontFamily: '"Rubik", "Helvetica Neue", sans-serif', fontWeight: 600, fontSize: 18 },
    h6: { fontFamily: '"Rubik", "Helvetica Neue", sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '0.02em' },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: { letterSpacing: '0.14em', fontWeight: 600, fontSize: 11 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { background: '#0a1628' },
        '::selection': { background: 'rgba(46,200,255,0.28)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(143,162,192,0.10)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0f1f3a',
          border: '1px solid rgba(143,162,192,0.10)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 14 },
        containedPrimary: {
          background: '#2ec8ff',
          color: '#061224',
          boxShadow: 'none',
          '&:hover': { background: '#4bd5ff', boxShadow: 'none' },
        },
        outlined: {
          borderColor: 'rgba(143,162,192,0.25)',
          color: '#e6edf7',
          '&:hover': { borderColor: '#2ec8ff', background: 'rgba(46,200,255,0.06)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: 0.2 },
        outlined: { borderColor: 'rgba(143,162,192,0.25)' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10,22,40,0.6)',
          '& fieldset': { borderColor: 'rgba(143,162,192,0.20)' },
          '&:hover fieldset': { borderColor: 'rgba(46,200,255,0.4)' },
          '&.Mui-focused fieldset': { borderColor: '#2ec8ff' },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.Mui-selected': {
            background: 'rgba(46,200,255,0.10)',
            boxShadow: 'inset 2px 0 0 #2ec8ff',
            '&:hover': { background: 'rgba(46,200,255,0.14)' },
          },
          '&:hover': { background: 'rgba(143,162,192,0.06)' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(143,162,192,0.10)' },
        head: { color: '#8fa2c0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { background: '#0a1628', border: '1px solid rgba(143,162,192,0.18)', fontSize: 12 },
        arrow: { color: '#0a1628' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 3, backgroundColor: 'rgba(143,162,192,0.15)' },
        bar: { borderRadius: 3, backgroundColor: '#2ec8ff' },
      },
    },
  },
});

export default tfTheme;
