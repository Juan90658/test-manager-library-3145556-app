import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorBox } from '../ui.jsx';

// HU-06: one member, 1 to 3 different books. The server enforces every rule; the UI only guides.
export default function NewLoan() {
  const navigate = useNavigate();
  const [memberQ, setMemberQ] = useState('');
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState(null);
  const [bookQ, setBookQ] = useState('');
  const [books, setBooks] = useState([]);
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.members({ q: memberQ, size: 8 }).then((r) => setMembers(r.items)).catch(setError); }, [memberQ]);
  useEffect(() => { api.books({ q: bookQ, size: 8 }).then((r) => setBooks(r.items)).catch(setError); }, [bookQ]);

  const toggle = (b) => setPicked((p) => (p.some((x) => x.id === b.id) ? p.filter((x) => x.id !== b.id) : p.length < 3 ? [...p, b] : p));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.createLoan(member.id, picked.map((b) => b.id));
      navigate('/prestamos');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h2>Registrar préstamo</h2>
      <div className="columns">
        <div className="card">
          <h3>1. Socio</h3>
          {member ? (
            <p><strong>{member.full_name}</strong> ({member.document_number}) <button className="link" onClick={() => setMember(null)}>cambiar</button></p>
          ) : (
            <>
              <input placeholder="Buscar socio" value={memberQ} onChange={(e) => setMemberQ(e.target.value)} />
              <ul className="pick">{members.map((m) => <li key={m.id}><button className="link" onClick={() => setMember(m)}>{m.full_name} · {m.document_number}</button></li>)}</ul>
            </>
          )}
        </div>
        <div className="card">
          <h3>2. Libros ({picked.length}/3)</h3>
          <input placeholder="Buscar libro" value={bookQ} onChange={(e) => setBookQ(e.target.value)} />
          <ul className="pick">
            {books.map((b) => {
              const on = picked.some((x) => x.id === b.id);
              return (
                <li key={b.id}>
                  <label>
                    <input type="checkbox" checked={on} disabled={!on && (picked.length >= 3 || b.available_copies < 1)} onChange={() => toggle(b)} />
                    {b.title} <span className="muted">({b.available_copies} disp.)</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className="muted">Plazo: 14 días. Máximo 3 libros sin devolver por socio; un socio con libros vencidos no puede pedir más.</p>
      <ErrorBox error={error} />
      <button disabled={!member || picked.length === 0 || busy} onClick={submit}>{busy ? 'Registrando…' : 'Registrar préstamo'}</button>
    </section>
  );
}
