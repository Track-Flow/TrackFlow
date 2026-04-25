import { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import tfTheme from './theme/tftheme.js';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Later: import MainApp from './MainApp';

export default function App() {
  const [page, setPage] = useState('login'); // 'login' | 'register'

  return (
    <ThemeProvider theme={tfTheme}>
      <CssBaseline />
      {page === 'login'    && <LoginPage    onRegister={() => setPage('register')} />}
      {page === 'register' && <RegisterPage onLogin={()    => setPage('login')}    />}
    </ThemeProvider>
  );
}