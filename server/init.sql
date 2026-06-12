-- ============================================
-- Book Rating System — Database Initialization
-- ============================================

-- 1. Custom ENUM for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'reader');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username   VARCHAR(50) NOT NULL UNIQUE,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       user_role   NOT NULL DEFAULT 'reader',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Books table
CREATE TABLE IF NOT EXISTS books (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(255) NOT NULL,
  author         VARCHAR(255) NOT NULL,
  isbn           VARCHAR(13)  UNIQUE,
  description    TEXT,
  genre          VARCHAR(100),
  published_year INTEGER,
  created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 4. Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id    UUID    NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  review     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (book_id, user_id)
);

-- 5. Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_books_genre     ON books(genre);

-- ============================================
-- Seed Data
-- ============================================

-- Admin user  (password: Admin@123)
INSERT INTO users (id, username, email, password, role)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin',
  'admin@bookrating.com',
  '$2b$12$LJ3m4ys3GZ4kMRXnBLmMxuBJSMVSmEfNjVyAzON7sVrqECqVzCXSe',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Sample books
INSERT INTO books (title, author, isbn, description, genre, published_year, created_by)
VALUES
  (
    'The Pragmatic Programmer',
    'David Thomas & Andrew Hunt',
    '9780135957059',
    'A timeless guide to software craftsmanship covering topics from personal responsibility to architectural techniques.',
    'Technology',
    2019,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'Clean Code',
    'Robert C. Martin',
    '9780132350884',
    'A handbook of agile software craftsmanship that teaches you to write code that is easy to read, understand, and maintain.',
    'Technology',
    2008,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'Dune',
    'Frank Herbert',
    '9780441013593',
    'Set in the distant future, this science-fiction masterpiece tells the story of Paul Atreides on the desert planet Arrakis.',
    'Science Fiction',
    1965,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'To Kill a Mockingbird',
    'Harper Lee',
    '9780061120084',
    'A classic novel about racial injustice in the Deep South, seen through the eyes of young Scout Finch.',
    'Fiction',
    1960,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'Sapiens: A Brief History of Humankind',
    'Yuval Noah Harari',
    '9780062316097',
    'An exploration of the history of the human species from the Stone Age to the twenty-first century.',
    'Non-Fiction',
    2011,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  )
ON CONFLICT (isbn) DO NOTHING;
