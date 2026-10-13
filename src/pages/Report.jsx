import { useState } from 'react';
import { api } from '../api.js';
import { ErrorBox } from '../ui.jsx';

const today = new Date().toISOString().slice(0, 10);
const monthStart = `${today.slice(0, 8)}01`;

// HU-10: most borrowed books in a date range (both inclusive). Uses the frozen title and category; no members.
export default function Report() {
  const [range, setRange] = useState({ from: monthStart, to: today });
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    setError(null);
    try { setRows((await api.mostBorrowed(range.from, range.to)).rows); } catch (err) { setError(err); setRows(null); }
  };
  const max = Math.max(1, ...(rows ?? []).map((r) => r.times_borrowed));

  return (
    <section>
      <h2>Libros más prestados</h2>
      <form className="filters" onSubmit={run}>
        <label>Desde<input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} required /></label>
        <label>Hasta<input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} required /></label>
        <button>Consultar</button>
      </form>
      <ErrorBox error={error} />
      {rows && rows.length === 0 && <p className="muted">No hubo préstamos en ese periodo.</p>}
      {rows && rows.length > 0 && (
        <table>
          <thead><tr><th>Libro</th><th>Categoría</th><th>Veces prestado</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.book_id}-${r.book_title}-${r.category_name}`}>
                <td>{r.book_title}</td>
                <td>{r.category_name}</td>
                <td><span className="bar" style={{ width: `${(r.times_borrowed / max) * 100}%` }} /> {r.times_borrowed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
