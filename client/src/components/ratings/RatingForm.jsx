import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { useToast } from '../Toast';
import * as api from '../../api/client';

export default function RatingForm({ bookId, existingRating, onSubmit }) {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [review, setReview] = useState(existingRating?.review || '');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const isEditing = !!existingRating;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      addToast('Please select a star rating', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = { rating, review: review.trim() };

      if (isEditing) {
        await api.updateRating(bookId, existingRating.id, data);
        addToast('Rating updated successfully!', 'success');
      } else {
        await api.createRating(bookId, data);
        addToast('Rating submitted successfully!', 'success');
      }
      if (onSubmit) onSubmit();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to submit rating';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="form-group">
        <label style={{ marginBottom: '10px', display: 'block' }}>
          {isEditing ? 'Update your rating' : 'Rate this book'}
        </label>
        <RatingStars
          value={rating}
          interactive
          onChange={setRating}
          size="1.6rem"
        />
        {rating > 0 && (
          <span className="rating-value" style={{ marginLeft: '10px' }}>
            {rating}/5
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="rating-review">
          Review <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          id="rating-review"
          className="input-field"
          placeholder="Share your thoughts about this book…"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || rating === 0}
      >
        {loading ? <span className="spinner"></span> : null}
        {isEditing ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  );
}
