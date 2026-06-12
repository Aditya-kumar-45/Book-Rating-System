import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/ratings/RatingStars';
import * as api from '../api/client';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getBooks({ limit: 6, page: 1 });
        const data = res.data;
        const books = data.data || data.books || data || [];
        setFeaturedBooks(Array.isArray(books) ? books.slice(0, 6) : []);
      } catch {
        setFeaturedBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero container">
        <h1 className="hero-title animate-fade-in-up">
          Discover &amp; Rate Your{' '}
          <span className="gradient-text">Favorite Books</span>
        </h1>
        <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Join a community of readers. Share ratings, write reviews, and explore
          curated collections of literature that inspire and delight.
        </p>
        <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                Browse Books
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container" style={{ padding: '40px 24px 60px' }}>
        <div className="grid-stats stagger-children animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="stat-card glass-card-static">
            <div className="stat-card-value gradient-text">📚</div>
            <div className="stat-card-label">Curated Books</div>
          </div>
          <div className="stat-card glass-card-static">
            <div className="stat-card-value gradient-text">⭐</div>
            <div className="stat-card-label">Community Ratings</div>
          </div>
          <div className="stat-card glass-card-static">
            <div className="stat-card-value gradient-text">👥</div>
            <div className="stat-card-label">Active Readers</div>
          </div>
          <div className="stat-card glass-card-static">
            <div className="stat-card-value gradient-text">🎯</div>
            <div className="stat-card-label">Genres Covered</div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <h2
          style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '12px' }}
          className="animate-fade-in-up"
        >
          Latest <span className="gradient-text">Books</span>
        </h2>
        <div className="section-divider"></div>

        {loadingBooks ? (
          <div className="grid-books">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : featuredBooks.length > 0 ? (
          <div className="grid-books stagger-children">
            {featuredBooks.map((book) => (
              <article key={book.id} className="glass-card book-card animate-fade-in">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">by {book.author}</p>
                <div className="book-card-meta">
                  {book.genre && <span className="badge badge-genre">{book.genre}</span>}
                </div>
                {book.description && (
                  <p className="book-card-description">{book.description}</p>
                )}
                <div className="book-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RatingStars
                      value={Math.round((book.averageRating || book.average_rating || 0) * 2) / 2}
                    />
                    <span className="rating-value">
                      {Number(book.averageRating || book.average_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📖</div>
            <h3 className="empty-state-title">Books coming soon</h3>
            <p className="empty-state-text">
              Our library is being populated. Check back soon!
            </p>
          </div>
        )}

        {featuredBooks.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-secondary">
              View All Books →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
