import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ErrorBox, Pager } from '../ui.jsx';

const EMPTY = { title: '', author: '', isbn: '', category_id: '', total_copies: 1 };

function Cover({ book }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    let objectUrl = null;
    setUrl(null);
    if (book.cover_key) {
      api.coverUrl(book.id).then((u) => { objectUrl = u; if (alive) setUrl(u); }).catch(() => {});
    }
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [book.id, book.cover_key]);
  return url ? <img className="cover" src={url} alt={`Portada de ${book.title}`} /> : <div className="cover placeholder">Sin portada</div>;
}

function BookForm({ initial, categories, onSaved, onCancel }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(editing
    ? { title: initial.title, author: initial.author, isbn: initial.isbn, category_id: initial.category.id, total_copies: initial.total_copies }
    : { ...EMPTY, category_id: categories[0]?.id ?? '' });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form, total_copies: Number(form.total_copies) };
      if (editing) {
        delete payload.isbn; // the ISBN is not editable (api-contract §3.4)
        await api.updateBook(initial.id, payload);
      } else {
        await api.createBook(payload);
      }
      onSaved();
    } catch (err) {
      setError(err);
    }
  };
  return (
    <form className="card form" onSubmit={submit}>
      <h3>{editing ? 'Editar libro' : 'Nuevo libro'}</h3>
      <label>Título<input value={form.title} onChange={set('title')} maxLength={250} required /></label>
      <label>Autor<input value={form.author} onChange={set('author')} maxLength={200} required /></label>
      <label>ISBN (13 dígitos)<input value={form.isbn} onChange={set('isbn')} pattern="\d{13}" disabled={editing} required /></label>
      <label>Categoría
        <select value={form.category_id} onChange={set('category_id')}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label>Total de ejemplares<input type="number" min="1" value={form.total_copies} onChange={set('total_copies')} required /></label>
      <ErrorBox error={error} />
      <div className="row">
        <button>{editing ? 'Guardar cambios' : 'Crear libro'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Books() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: '', category_id: '', page: 1 });
  const [data, setData] = useState({ items: [], page: 1, size: 12, total: 0 });
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => api.books({ ...filters, size: 12 }).then(setData).catch(setError);
  useEffect(() => { api.categories().then((r) => setCategories(r.items)).catch(setError); }, []);
  useEffect(() => { load(); }, [filters]);

  const act = async (fn) => {
    setError(null);
    try { await fn(); await load(); } catch (err) { setError(err); }
  };

  return (
    <section>
      <div className="head">
        <h2>Catálogo</h2>
        {isAdmin && !editing && <button onClick={() => setEditing({})}>Nuevo libro</button>}
      </div>
      {editing && (
        <BookForm initial={editing} categories={categories}
          onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
      )}
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <input placeholder="Buscar por título o autor" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
        <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </form>
      <ErrorBox error={error} />
      <div className="grid">
        {data.items.map((b) => (
          <article className="card book" key={b.id}>
            <Cover book={b} />
            <div>
              <h3>{b.title}</h3>
              <p className="muted">{b.author} · {b.category.name}</p>
              <p className="muted">ISBN {b.isbn}</p>
              <p><strong>{b.available_copies}</strong> de {b.total_copies} disponibles</p>
              {isAdmin && (
                <div className="row wrap">
                  <button className="secondary" onClick={() => setEditing(b)}>Editar</button>
                  <label className="button secondary">
                    Portada
                    <input type="file" accept="image/jpeg,image/png" hidden
                      onChange={(e) => e.target.files[0] && act(() => api.uploadCover(b.id, e.target.files[0]))} />
                  </label>
                  {b.cover_key && <button className="secondary" onClick={() => act(() => api.deleteCover(b.id))}>Quitar portada</button>}
                  <button className="danger" onClick={() => confirm(`¿Dar de baja «${b.title}»?`) && act(() => api.deleteBook(b.id))}>Dar de baja</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {data.items.length === 0 && <p className="muted">No hay libros que coincidan.</p>}
      <Pager {...data} onPage={(page) => setFilters({ ...filters, page })} />
    </section>
  );
}
