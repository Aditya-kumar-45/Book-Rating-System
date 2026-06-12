import React, { useState, useCallback } from 'react';
import BookList from '../components/books/BookList';
import RatingStars from '../components/ratings/RatingStars';
import RatingForm from '../components/ratings/RatingForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import * as api from '../api/client';

export default function ReaderView() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [selectedBook, setSelectedBook] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openBookDetail = useCallback(async (book) => {
    setSelectedBook(book);
    setLoadingRatings(true);
    try {
      const res = await api.getBookRatings(book.id);
      const data = res.data;
      const ratingList = data.data || data.ratings || data || [];
      setRatings(Array.isArray(ratingList) ? ratingList : []);
    } catch {
      setRatings([]);
    } finally {
      setLoadingRatings(false);
    }
  }, []);

  const handleRatingSubmit = () => {
    // Refresh the book detail and list
    if (selectedBook) {
      openBookDetail(selectedBook);
    }
    setRefreshKey((k) => k + 1);
  };

  const closeDetail = () => {
    setSelectedBook(null);
    setRatings([]);
  };

  const myRating = ratings.find(
    (r) => r.userId === user?.id || r.user_id === user?.id || r.user?.id === user?.id
  );

  return (
    <>
      {selectedBook ? (
        <div className="animate-fade-in">
          <button
            className="btn btn-ghost"
            onClick={closeDetail}
            style={{ marginBottom: '20px' }}
          >
            ← Back to Books
          </button>

          <div className="glass-card-static book-detail">
            <h2 className="book-detail-title">{selectedBook.title}</h2>
            <p className="book-detail-author">by {selectedBook.author}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {selectedBook.genre && (
                <span className="badge badge-genre">{selectedBook.genre}</span>
              )}
              {(selectedBook.publishedYear || selectedBook.published_year) && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Published: {selectedBook.publishedYear || selectedBook.published_year}
                </span>
              )}
              {selectedBook.isbn && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  ISBN: {selectedBook.isbn}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <RatingStars
                value={Math.round((selectedBook.averageRating || selectedBook.average_rating || 0) * 2) / 2}
                size="1.3rem"
              />
              <span className="rating-value" style={{ fontSize: '1rem' }}>
                {Number(selectedBook.averageRating || selectedBook.average_rating || 0).toFixed(1)}
              </span>
              <span className="rating-count">
                ({selectedBook.ratingCount || selectedBook.rating_count || 0} ratings)
              </span>
            </div>

            {selectedBook.description && (
              <p className="book-detail-description">{selectedBook.description}</p>
            )}

            {/* Rating Form */}
            <div className="ratings-section">
              <h3 style={{ marginBottom: '16px' }}>
                {myRating ? 'Update Your Rating' : 'Rate This Book'}
              </h3>
              <div className="glass-card-static" style={{ padding: '20px', marginBottom: '28px', borderRadius: 'var(--radius-md)' }}>
                <RatingForm
                  bookId={selectedBook.id}
                  existingRating={myRating}
                  onSubmit={handleRatingSubmit}
                />
              </div>
            </div>

            {/* Other Ratings */}
            <div className="ratings-section">
              <h3>
                Community Reviews{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  ({ratings.length})
                </span>
              </h3>

              {loadingRatings ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-md)' }} />
                  ))}
                </div>
              ) : ratings.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <p className="empty-state-text">No reviews yet. Be the first to rate!</p>
                </div>
              ) : (
                <div className="stagger-children">
                  {ratings.map((r) => (
                    <div key={r.id} className="rating-item animate-fade-in">
                      <div className="rating-item-header">
                        <span className="rating-item-user">
                          {r.user?.username || r.username || 'Anonymous'}
                          {(r.userId === user?.id || r.user_id === user?.id || r.user?.id === user?.id) && (
                            <span className="badge badge-success" style={{ marginLeft: '8px' }}>You</span>
                          )}
                        </span>
                        <RatingStars value={r.rating} size="0.9rem" />
                      </div>
                      {r.review && <p className="rating-item-review">{r.review}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <BookList
          isAdmin={false}
          onSelect={openBookDetail}
          refreshKey={refreshKey}
        />
      )}
    </>
  );
}
