import { useEffect, useState } from 'react';
import { api, formatDate } from '../api.js';
import { ErrorBox, Pager, StatusBadge } from '../ui.jsx';

// HU-07 and HU-08: list loans by date range / status, see items and return one line at a time.
export default function Loans() {
  const [filters, setFilters] = useState({ from: '', to: '', status: '', page: 1 });
  const [data, setData] = useState({ items: [], page: 1, size: 10, total: 0 });
  const [error, setError] = useState(null);

  const load = () => api.loans({ ...filters, size: 10 }).then(setData).catch(setError);
  useEffect(() => { load(); }, [filters]);
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value, page: 1 });

  const giveBack = async (loanId, itemId) => {
    setError(null);
    try { await api.returnItem(loanId, itemId); load(); } catch (err) { setError(err); }
  };

  return (
    <section>
      <h2>Préstamos</h2>
      <div className="filters">
        <label>Desde<input type="date" value={filters.from} onChange={set('from')} /></label>
        <label>Hasta<input type="date" value={filters.to} onChange={set('to')} /></label>
        <label>Estado
          <select value={filters.status} onChange={set('status')}>
            <option value="">Todos</option>
            <option value="open">Abiertos</option>
            <option value="overdue">Vencidos</option>
            <option value="closed">Cerrados</option>
          </select>
        </label>
      </div>
      <ErrorBox error={error} />
      {data.items.map((loan) => (
        <article className="card" key={loan.id}>
          <div className="head">
            <span>Prestado el {formatDate(loan.loaned_at)}</span>
            <StatusBadge status={loan.status} />
          </div>
          <table>
            <thead><tr><th>Libro</th><th>Categoría</th><th>Vence</th><th>Devuelto</th><th></th></tr></thead>
            <tbody>
              {loan.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.book_title}</td>
                  <td>{it.category_name}</td>
                  <td>{formatDate(it.due_at)}</td>
                  <td>{formatDate(it.returned_at)}</td>
                  <td>{!it.returned_at && <button className="secondary" onClick={() => giveBack(loan.id, it.id)}>Devolver</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      ))}
      {data.items.length === 0 && <p className="muted">No hay préstamos con esos filtros.</p>}
      <Pager {...data} onPage={(page) => setFilters({ ...filters, page })} />
    </section>
  );
}
