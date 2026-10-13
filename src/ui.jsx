// Small shared UI pieces.
export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="error" role="alert">
      {error.message}
      {error.details?.length > 0 && (
        <ul>{error.details.map((d, i) => <li key={i}><code>{d.field}</code>: {d.issue}</li>)}</ul>
      )}
    </div>
  );
}

export function Pager({ page, size, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pager">
      <button className="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</button>
      <span>Página {page} de {pages} · {total} resultados</span>
      <button className="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>Siguiente</button>
    </div>
  );
}

export function StatusBadge({ status }) {
  const label = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' }[status] ?? status;
  return <span className={`badge ${status}`}>{label}</span>;
}
