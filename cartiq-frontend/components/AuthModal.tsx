"use client";

import { authApi } from "@/lib/api";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

export default function AuthModal() {
  const { isAuthModalOpen, authMode, dispatch, refreshCart, showToast } = useApp();
  console.log("Auth modal state:", isAuthModalOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const isLogin = authMode === 'login';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let data;
      if (isLogin) {
        data = await authApi.login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) { setError('Name is required'); setIsLoading(false); return; }
        data = await authApi.register({ name: form.name, email: form.email, password: form.password });
      }

      localStorage.setItem('cartiq_token', data.token);
      dispatch({ type: 'SET_USER', payload: data.user });
      dispatch({ type: 'CLOSE_AUTH_MODAL' });
      await refreshCart();
      showToast(`Welcome${isLogin ? ' back' : ''}, ${data.user.name.split(' ')[0]}!`, 'success');
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && dispatch({ type: 'CLOSE_AUTH_MODAL' })}>
      <div className="modal-card p-8">
        {/* Close */}
        <button
          onClick={() => dispatch({ type: 'CLOSE_AUTH_MODAL' })}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cartiq-bg-secondary transition-colors text-cartiq-muted"
          aria-label="Close"
        >
          <Icon name="XMarkIcon" size={18} />
        </button>

        {/* Logo + Title */}
        <div className="text-center mb-6">
          <AppLogo size={40} className="mx-auto mb-3" />
          <h2 className="text-xl font-bold font-heading text-cartiq-foreground">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-cartiq-muted mt-1">
            {isLogin ? 'Sign in to your CartIQ account' : 'Join CartIQ and start shopping'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-cartiq-muted mb-1.5 font-heading uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                required={!isLogin}
                className="search-input w-full px-4 py-2.5 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-cartiq-muted mb-1.5 font-heading uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="search-input w-full px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cartiq-muted mb-1.5 font-heading uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="search-input w-full px-4 py-2.5 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cartiq-subtle hover:text-cartiq-muted transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-cartiq-error text-sm px-3 py-2.5 rounded-lg">
              <Icon name="ExclamationCircleIcon" size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isLogin ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              <>
                <Icon name={isLogin ? 'ArrowRightOnRectangleIcon' : 'UserPlusIcon'} size={16} />
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center text-sm text-cartiq-muted mt-5">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => dispatch({ type: 'OPEN_AUTH_MODAL', payload: isLogin ? 'register' : 'login' })}
            className="text-cartiq-accent font-semibold hover:underline"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}