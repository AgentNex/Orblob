'use client';

import React, { useState } from 'react';
import { useStudioStore } from '../lib/store';
import { signIn, signUp, signOut } from '../lib/insforge';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, currentUser, refreshAuth } = useStudioStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      if (tab === 'signin') {
        const { data, error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Failed to sign in');
        } else {
          setSuccessMsg('Signed in successfully!');
          await refreshAuth();
          setTimeout(() => {
            setAuthModalOpen(false);
          }, 600);
        }
      } else {
        const { data, error } = await signUp(email, password, name || undefined);
        if (error) {
          setErrorMsg(error.message || 'Failed to create account');
        } else {
          setSuccessMsg('Account created successfully! Please sign in.');
          await refreshAuth();
          setTab('signin');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    await refreshAuth();
    setLoading(false);
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-surface-primary dark:bg-surface-elevated rounded-2xl border border-border-subtle shadow-2xl p-6 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {currentUser ? (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-accent-glow text-accent flex items-center justify-center font-bold text-xl">
              {currentUser.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-xl font-semibold text-text-primary">
                Signed In
              </h2>
              <p className="text-sm text-text-secondary mt-1">{currentUser.email}</p>
            </div>
            <div className="p-3 bg-surface-secondary rounded-xl text-xs text-text-tertiary text-left">
              <span className="font-medium text-text-secondary">InsForge BaaS User ID:</span>
              <p className="font-mono mt-0.5 truncate">{currentUser.id}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-glow text-accent text-xs font-semibold mb-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                InsForge Cloud Sync
              </div>
              <h2 id="auth-modal-title" className="text-xl font-semibold text-text-primary">
                {tab === 'signin' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Save custom globes, sync across devices, and share public links.
              </p>
            </div>

            {/* Tab selection */}
            <div className="flex bg-surface-secondary p-1 rounded-xl mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => { setTab('signin'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  tab === 'signin'
                    ? 'bg-surface-primary text-text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  tab === 'signup'
                    ? 'bg-surface-primary text-text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-subtle bg-surface-secondary text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@domain.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border-subtle bg-surface-secondary text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border-subtle bg-surface-secondary text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 mt-2 rounded-xl text-sm font-semibold bg-accent text-white shadow-md hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {tab === 'signin' ? 'Sign In' : 'Create Free Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
