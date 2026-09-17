import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/layout/Navigation';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between pt-24 pb-12 px-6">
      <Navigation />

      <div className="max-w-md w-full mx-auto my-auto p-8 sm:p-12 rounded-card-lg sm:rounded-container-xl bg-olive/30 border border-forest/15 shadow-deep text-forest">
        <div className="text-center mb-8">
          <span className="editorial-label text-forest/70 block mb-2">Member Portal</span>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight">WELCOME BACK</h1>
          <p className="text-sm text-forest/80 mt-2">
            Access your spaces, active meetings and synchronized boards.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-organic-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="editorial-label text-[11px] block mb-2 text-forest/80">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-forest/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@studio.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-cream border border-forest/20 text-forest text-sm placeholder:text-forest/30 focus:outline-none focus:border-forest font-medium"
              />
            </div>
          </div>

          <div>
            <label className="editorial-label text-[11px] block mb-2 text-forest/80">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-forest/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-cream border border-forest/20 text-forest text-sm placeholder:text-forest/30 focus:outline-none focus:border-forest font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center space-x-2 hover:bg-forest-light transition-all shadow-deep disabled:opacity-50"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'ENTER SPACE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-forest/15 text-center text-xs text-forest/80">
          New to ConnectSphere?{' '}
          <Link to="/register" className="font-bold underline hover:text-forest">
            Create an Account
          </Link>
        </div>
      </div>

      <div className="text-center text-xs tracking-widest uppercase text-forest/40">
        © 2026 ConnectSphere · Private Communication
      </div>
    </div>
  );
};
