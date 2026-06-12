import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
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
    const result = await login(form);
    setLoading(false);

    if (result.success) {
      addToast('Welcome back! Login successful.', 'success');
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="auth-card glass-card-static animate-fade-in">
      <div className="auth-card-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your BookShelf account</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
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
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            className={`input-field ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '8px' }}
          disabled={loading}
        >
          {loading ? <span className="spinner"></span> : null}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{' '}
        <Link to="/register">Create one</Link>
      </div>
    </div>
  );
}
