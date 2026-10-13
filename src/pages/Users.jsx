import { useState } from 'react';
import { api } from '../api.js';
import { ErrorBox } from '../ui.jsx';

// HU-02: the admin creates librarians. The role is always "librarian"; admin is never granted at runtime.
export default function Users() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setCreated(await api.createUser(form));
      setForm({ username: '', password: '' });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section>
      <h2>Bibliotecarios</h2>
      <form className="card form" onSubmit={submit}>
        <label>Usuario<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} maxLength={120} required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        <ErrorBox error={error} />
        <button>Crear bibliotecario</button>
      </form>
      {created && <p className="ok">Se creó el usuario <strong>{created.username}</strong> con rol bibliotecario.</p>}
    </section>
  );
}
