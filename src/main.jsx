import { StrictMode, useState } from 'react';
import { AuthProvider, useAuth } from './auth.jsx';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Books from './pages/Books.jsx';
import Members from './pages/Members.jsx';
import Loans from './pages/Loans.jsx';
import NewLoan from './pages/NewLoan.jsx';
import Overdue from './pages/Overdue.jsx';
import Report from './pages/Report.jsx';
import Users from './pages/Users.jsx';
import './styles.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/libros');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="login">
      <form className="card" onSubmit={submit}>
        <h1>Manager Library</h1>
        <p className="muted">Ingresa con tu usuario de administrador o bibliotecario.</p>
        <label>Usuario<input autoFocus value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </main>
  );
}

function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  return (
    <>
      <header className="topbar">
        <strong>Manager Library</strong>
        <nav>
          <NavLink to="/libros">Catálogo</NavLink>
          <NavLink to="/socios">Socios</NavLink>
          <NavLink to="/prestar">Prestar</NavLink>
          <NavLink to="/prestamos">Préstamos</NavLink>
          <NavLink to="/vencidos">Vencidos</NavLink>
          {isAdmin && <NavLink to="/reporte">Reporte</NavLink>}
          {isAdmin && <NavLink to="/usuarios">Bibliotecarios</NavLink>}
        </nav>
        <span className="who">{user.username} · {user.role === 'admin' ? 'Administrador' : 'Bibliotecario'}</span>
        <button className="link" onClick={logout}>Salir</button>
      </header>
      <main className="page">{children}</main>
    </>
  );
}

function Protected({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/ingresar" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/libros" replace />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/ingresar" element={<Login />} />
          <Route path="/libros" element={<Protected><Books /></Protected>} />
          <Route path="/socios" element={<Protected><Members /></Protected>} />
          <Route path="/prestar" element={<Protected><NewLoan /></Protected>} />
          <Route path="/prestamos" element={<Protected><Loans /></Protected>} />
          <Route path="/vencidos" element={<Protected><Overdue /></Protected>} />
          <Route path="/reporte" element={<Protected adminOnly><Report /></Protected>} />
          <Route path="/usuarios" element={<Protected adminOnly><Users /></Protected>} />
          <Route path="*" element={<Navigate to="/libros" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
