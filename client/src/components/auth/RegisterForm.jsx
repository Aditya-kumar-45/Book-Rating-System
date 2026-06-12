import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Must include uppercase, lowercase, and number';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await register({
      username: form.username,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      addToast('Account created successfully! Please sign in.', 'success');
      navigate('/login');
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="auth-card glass-card-static animate-fade-in">
      <div className="auth-card-header">
        <h1>Create Account</h1>
        <p>Join BookShelf and start rating books</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            name="username"
            className={`input-field ${errors.username ? 'error' : ''}`}
            placeholder="Your display name"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
          {errors.username && <span className="form-error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            name="email"
            className={`input-field ${errors.email ? 'error' : ''}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            name="password"
            className={`input-field ${errors.password ? 'error' : ''}`}
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
          <span className="form-hint">
            Min 8 chars with uppercase, lowercase & number
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="register-confirm-password">Confirm Password</label>
          <input
            id="register-confirm-password"
            type="password"
            name="confirmPassword"
            className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className="form-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '8px' }}
          disabled={loading}
        >
          {loading ? <span className="spinner"></span> : null}
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
