import { useEffect, useState } from 'react';
import { api, formatDate } from '../api.js';
import { ErrorBox, Pager } from '../ui.jsx';

// HU-09: unreturned lines past due, most days late first (sorted by the API).
export default function Overdue() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], page: 1, size: 20, total: 0 });
  const [error, setError] = useState(null);
  const load = () => api.overdue({ page }).then(setData).catch(setError);
  useEffect(() => { load(); }, [page]);

  const giveBack = async (row) => {
    setError(null);
    try { await api.returnItem(row.loan_id, row.item_id); load(); } catch (err) { setError(err); }
  };

  return (
    <section>
      <h2>Libros vencidos</h2>
      <ErrorBox error={error} />
      <table>
        <thead><tr><th>Libro</th><th>Socio</th><th>Venció</th><th>Días de retraso</th><th></th></tr></thead>
        <tbody>
          {data.items.map((r) => (
            <tr key={r.item_id}>
              <td>{r.book_title}</td>
              <td>{r.member_name}</td>
              <td>{formatDate(r.due_at)}</td>
              <td><strong>{r.days_late}</strong></td>
              <td><button className="secondary" onClick={() => giveBack(r)}>Devolver</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.items.length === 0 && <p className="muted">No hay libros vencidos.</p>}
      <Pager {...data} onPage={setPage} />
    </section>
  );
}
