import React, { useState, useEffect, useCallback } from 'react';
import BookCard from './BookCard';
import * as api from '../../api/client';

const GENRES = [
  'All Genres',
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Self-Help',
  'Science',
  'Technology',
  'Poetry',
  'Drama',
  'Adventure',
  'Philosophy',
  'Other',
];

export default function BookList({ isAdmin, onEdit, onDelete, onSelect, refreshKey }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search.trim()) params.search = search.trim();
      if (genre) params.genre = genre;

      const res = await api.getBooks(params);
      const data = res.data;

      // Handle different API response shapes
      const bookList = data.data || data.books || data || [];
      setBooks(Array.isArray(bookList) ? bookList : []);

      const pagination = data.pagination || data.meta || {};
      setTotalPages(pagination.totalPages || pagination.total_pages || Math.ceil((pagination.total || bookList.length) / 9) || 1);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [search, genre, page, refreshKey]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, genre]);

  const renderSkeletons = () => (
    <div className="grid-books">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <nav className="pagination" aria-label="Book list pagination">
        <button
          className="pagination-btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        {start > 1 && (
          <>
            <button className="pagination-btn" onClick={() => setPage(1)}>1</button>
            {start > 2 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn ${p === page ? 'active' : ''}`}
            onClick={() => setPage(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
            <button className="pagination-btn" onClick={() => setPage(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
        <button
          className="pagination-btn"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </nav>
    );
  };

  return (
    <section>
      {/* Search & Filter Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="book-search"
            type="text"
            className="input-field"
            placeholder="Search books by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="genre-filter"
          className="input-field filter-select"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          aria-label="Filter by genre"
        >
          {GENRES.map((g) => (
            <option key={g} value={g === 'All Genres' ? '' : g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Book Grid */}
      {loading ? (
        renderSkeletons()
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No books found</h3>
          <p className="empty-state-text">
            {search || genre
              ? 'Try adjusting your search or filters.'
              : 'No books have been added yet. Check back later!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid-books stagger-children">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAdmin={isAdmin}
                onClick={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </section>
  );
}
