import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import * as api from '../../api/client';

const GENRES = [
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

export default function BookForm({ book, onClose, onSuccess }) {
  const isEditing = !!book;
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    genre: '',
    published_year: '',
  });

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        genre: book.genre || '',
        published_year: book.published_year || book.publishedYear || '',
      });
    }
  }, [book]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.author.trim()) newErrors.author = 'Author is required';
    if (form.isbn && !/^[\d\-X]{10,17}$/.test(form.isbn.replace(/\s/g, ''))) {
      newErrors.isbn = 'Enter a valid ISBN';
    }
    if (form.published_year) {
      const year = parseInt(form.published_year, 10);
      if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
        newErrors.published_year = 'Enter a valid year';
      }
    }
    if (!form.genre) newErrors.genre = 'Please select a genre';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        published_year: form.published_year ? parseInt(form.published_year, 10) : undefined,
      };

      if (isEditing) {
        await api.updateBook(book.id, payload);
        addToast('Book updated successfully!', 'success');
      } else {
        await api.createBook(payload);
        addToast('Book created successfully!', 'success');
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to save book';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="book-title">Title</label>
              <input
                id="book-title"
                type="text"
                name="title"
                className={`input-field ${errors.title ? 'error' : ''}`}
                placeholder="Book title"
                value={form.title}
                onChange={handleChange}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="book-author">Author</label>
              <input
                id="book-author"
                type="text"
                name="author"
                className={`input-field ${errors.author ? 'error' : ''}`}
                placeholder="Author name"
                value={form.author}
                onChange={handleChange}
              />
              {errors.author && <span className="form-error">{errors.author}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="book-isbn">ISBN</label>
              <input
                id="book-isbn"
                type="text"
                name="isbn"
                className={`input-field ${errors.isbn ? 'error' : ''}`}
                placeholder="978-3-16-148410-0"
                value={form.isbn}
                onChange={handleChange}
              />
              {errors.isbn && <span className="form-error">{errors.isbn}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="book-genre">Genre</label>
              <select
                id="book-genre"
                name="genre"
                className={`input-field ${errors.genre ? 'error' : ''}`}
                value={form.genre}
                onChange={handleChange}
              >
                <option value="">Select a genre</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.genre && <span className="form-error">{errors.genre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="book-year">Published Year</label>
              <input
                id="book-year"
                type="number"
                name="published_year"
                className={`input-field ${errors.published_year ? 'error' : ''}`}
                placeholder="2024"
                value={form.published_year}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear() + 1}
              />
              {errors.published_year && (
                <span className="form-error">{errors.published_year}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="book-description">Description</label>
              <textarea
                id="book-description"
                name="description"
                className="input-field"
                placeholder="Brief description of the book…"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"></span> : null}
              {isEditing ? 'Update Book' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
