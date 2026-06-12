import React, { useState, useEffect, useCallback } from 'react';
import RatingStars from '../components/ratings/RatingStars';
import BookForm from '../components/books/BookForm';
import { useToast } from '../components/Toast';
import * as api from '../api/client';

export default function AdminPanel() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stats, setStats] = useState({ totalBooks: 0, totalRatings: 0 });
  const { addToast } = useToast();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getBooks({ limit: 100 });
      const data = res.data;
      const bookList = data.data || data.books || data || [];
      const arr = Array.isArray(bookList) ? bookList : [];
      setBooks(arr);

      // Calculate stats
      const totalRatings = arr.reduce(
        (sum, b) => sum + (b.ratingCount || b.rating_count || 0),
        0
      );
      setStats({ totalBooks: arr.length, totalRatings });
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteBook(deleteTarget.id);
      addToast(`"${deleteTarget.title}" deleted successfully`, 'success');
      setDeleteTarget(null);
      fetchBooks();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to delete book';
      addToast(msg, 'error');
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.genre || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Stats Cards */}
      <div className="grid-stats stagger-children" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-card-static animate-fade-in">
          <div className="stat-card-value gradient-text">{stats.totalBooks}</div>
          <div className="stat-card-label">Total Books</div>
        </div>
        <div className="stat-card glass-card-static animate-fade-in">
          <div className="stat-card-value gradient-text">{stats.totalRatings}</div>
          <div className="stat-card-label">Total Ratings</div>
        </div>
      </div>

      {/* Header */}
      <div className="admin-header">
        <h2 style={{ fontSize: '1.3rem' }}>Book Management</h2>
        <button className="btn btn-primary" onClick={() => { setEditingBook(null); setShowForm(true); }}>
          + Add Book
        </button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ maxWidth: '400px' }}>
          <span className="search-icon">🔍</span>
          <input
            id="admin-search"
            type="text"
            className="input-field"
            placeholder="Search books…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: '52px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No books found</h3>
          <p className="empty-state-text">
            {search ? 'Try a different search term.' : 'Add your first book to get started!'}
          </p>
        </div>
      ) : (
        <div className="glass-card-static data-table-wrapper animate-fade-in">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Avg Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => {
                const avgRating = book.averageRating || book.average_rating || 0;
                return (
                  <tr key={book.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {book.title}
                    </td>
                    <td>{book.author}</td>
                    <td>
                      {book.genre && <span className="badge badge-genre">{book.genre}</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RatingStars value={Math.round(avgRating * 2) / 2} size="0.9rem" />
                        <span style={{ fontSize: '0.82rem' }}>{Number(avgRating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setEditingBook(book); setShowForm(true); }}
                          aria-label={`Edit ${book.title}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(book)}
                          aria-label={`Delete ${book.title}`}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Form Modal */}
      {showForm && (
        <BookForm
          book={editingBook}
          onClose={() => { setShowForm(false); setEditingBook(null); }}
          onSuccess={fetchBooks}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="confirm-dialog">
              <div className="confirm-dialog-icon">⚠️</div>
              <h3>Delete Book</h3>
              <p>
                Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?
                This action cannot be undone.
              </p>
              <div className="confirm-dialog-actions">
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
