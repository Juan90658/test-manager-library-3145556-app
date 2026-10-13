// HTTP client for the Manager Library contract (/api/v1). Every error comes back as {code, message, details}.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
const KEY = 'ml.session';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? 'Error de comunicación con el servidor.');
    this.status = status;
    this.code = body?.code ?? 'NETWORK_ERROR';
    this.details = body?.details ?? [];
  }
}

export const session = {
  get() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY));
    } catch {
      return null;
    }
  },
  set(value) {
    try {
      value ? sessionStorage.setItem(KEY, JSON.stringify(value)) : sessionStorage.removeItem(KEY);
    } catch {
      // storage unavailable: the session lives only in memory
    }
  },
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, { body, raw } = {}) {
  const token = session.get()?.token;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, { code: 'NETWORK_ERROR', message: 'No se pudo conectar con la API.' });
  }
  if (res.status === 401 && path !== '/auth/login') onUnauthorized();
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  if (raw) return res;
  return res.status === 204 ? null : res.json();
}

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  login: (username, password) => request('POST', '/auth/login', { body: { username, password } }),
  categories: () => request('GET', '/categories'),
  books: (params) => request('GET', `/books${qs(params)}`),
  book: (id) => request('GET', `/books/${id}`),
  createBook: (data) => request('POST', '/books', { body: data }),
  updateBook: (id, data) => request('PUT', `/books/${id}`, { body: data }),
  deleteBook: (id) => request('DELETE', `/books/${id}`),
  uploadCover: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('PUT', `/books/${id}/cover`, { body: fd });
  },
  deleteCover: (id) => request('DELETE', `/books/${id}/cover`),
  coverUrl: async (id) => URL.createObjectURL(await (await request('GET', `/books/${id}/cover`, { raw: true })).blob()),
  members: (params) => request('GET', `/members${qs(params)}`),
  member: (id) => request('GET', `/members/${id}`),
  createMember: (data) => request('POST', '/members', { body: data }),
  createLoan: (memberId, bookIds) => request('POST', '/loans', { body: { member_id: memberId, items: bookIds.map((book_id) => ({ book_id })) } }),
  loans: (params) => request('GET', `/loans${qs(params)}`),
  loan: (id) => request('GET', `/loans/${id}`),
  returnItem: (loanId, itemId) => request('POST', `/loans/${loanId}/items/${itemId}/return`),
  overdue: (params) => request('GET', `/loans/overdue${qs(params)}`),
  mostBorrowed: (from, to) => request('GET', `/reports/most-borrowed${qs({ from, to })}`),
  createUser: (data) => request('POST', '/users', { body: { ...data, role: 'librarian' } }),
};

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
export const STATUS_LABEL = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' };
