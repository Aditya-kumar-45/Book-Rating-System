import React from 'react';
import RatingStars from '../ratings/RatingStars';

export default function BookCard({ book, onClick, isAdmin, onEdit, onDelete }) {
  const avgRating = book.averageRating || book.average_rating || 0;
  const ratingCount = book.ratingCount || book.rating_count || 0;

  return (
    <article
      className="book-card glass-card animate-fade-in"
      onClick={() => onClick && onClick(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(book);
        }
      }}
      aria-label={`${book.title} by ${book.author}`}
    >
      <div className="book-card-header">
        <div>
          <h3 className="book-card-title">{book.title}</h3>
          <p className="book-card-author">by {book.author}</p>
        </div>
      </div>

      <div className="book-card-meta">
        {book.genre && <span className="badge badge-genre">{book.genre}</span>}
        {(book.publishedYear || book.published_year) && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {book.publishedYear || book.published_year}
          </span>
        )}
      </div>

      {book.description && (
        <p className="book-card-description">{book.description}</p>
      )}

      <div className="book-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RatingStars value={Math.round(avgRating * 2) / 2} />
          <span className="rating-value">{Number(avgRating).toFixed(1)}</span>
          <span className="rating-count">({ratingCount})</span>
        </div>

        {isAdmin && (
          <div className="book-card-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(book);
              }}
              aria-label={`Edit ${book.title}`}
            >
              ✏️
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(book);
              }}
              aria-label={`Delete ${book.title}`}
              style={{ color: 'var(--error)' }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
