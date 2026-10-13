import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ErrorBox, Pager } from '../ui.jsx';

export default function Members() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], page: 1, size: 20, total: 0 });
  const [form, setForm] = useState({ full_name: '', document_number: '' });
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const load = () => api.members({ q, page }).then(setData).catch(setError);
  useEffect(() => { load(); }, [q, page]);

  const create = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createMember(form);
      setForm({ full_name: '', document_number: '' });
      load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section>
      <h2>Socios</h2>
      <form className="card form inline" onSubmit={create}>
        <label>Nombre completo<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={200} required /></label>
        <label>Documento<input value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} maxLength={30} required /></label>
        <button>Registrar socio</button>
      </form>
      <ErrorBox error={error} />
      <input className="search" placeholder="Buscar por nombre o documento" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <table>
        <thead><tr><th>Nombre</th><th>Documento</th><th></th></tr></thead>
        <tbody>
          {data.items.map((m) => (
            <tr key={m.id}>
              <td>{m.full_name}</td>
              <td>{m.document_number}</td>
              <td><button className="secondary" onClick={() => api.member(m.id).then(setSelected).catch(setError)}>Ver</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager {...data} onPage={setPage} />
      {selected && (
        <div className="card">
          <h3>{selected.full_name}</h3>
          <p>Documento {selected.document_number}</p>
          <p>Libros sin devolver: <strong>{selected.active_loans}</strong> de 3</p>
          <button className="secondary" onClick={() => setSelected(null)}>Cerrar</button>
        </div>
      )}
    </section>
  );
}
