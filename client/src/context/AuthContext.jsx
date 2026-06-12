import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.getMe();
        dispatch({ type: 'SET_USER', payload: res.data.data || res.data.user || res.data });
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.login(credentials);
      const res = await api.getMe();
      dispatch({ type: 'SET_USER', payload: res.data.data || res.data.user || res.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
