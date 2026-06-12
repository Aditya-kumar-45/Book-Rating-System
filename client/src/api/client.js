import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — redirect to login on 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* =====================
   Auth API
   ===================== */

export const login = (data) => client.post('/auth/login', data);

export const register = (data) => client.post('/auth/register', data);

export const logout = () => client.post('/auth/logout');

export const getMe = () => client.get('/auth/me');

/* =====================
   Books API
   ===================== */

export const getBooks = (params) => client.get('/books', { params });

export const getBook = (id) => client.get(`/books/${id}`);

export const createBook = (data) => client.post('/books', data);

export const updateBook = (id, data) => client.put(`/books/${id}`, data);

export const deleteBook = (id) => client.delete(`/books/${id}`);

/* =====================
   Ratings API
   ===================== */

export const getBookRatings = (bookId) =>
  client.get(`/books/${bookId}/ratings`);

export const createRating = (bookId, data) =>
  client.post(`/books/${bookId}/ratings`, data);

export const updateRating = (bookId, id, data) =>
  client.put(`/books/${bookId}/ratings/${id}`, data);

export const deleteRating = (bookId, id) =>
  client.delete(`/books/${bookId}/ratings/${id}`);

export default client;
