import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [quickJoinOpen, setQuickJoinOpen] = useState(false);
  const [quickMeetingCode, setQuickMeetingCode] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMeetingCode.trim()) return;
    const cleanId = quickMeetingCode.trim().replace(/^.*\/meeting\//, '');
    navigate(`/meeting/${cleanId}`);
    setQuickJoinOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand */}
        <Link
          to="/"
          className="group flex items-center space-x-2 text-forest tracking-tighter"
        >
          <span className="font-display text-2xl sm:text-3xl tracking-tight transition-transform duration-300 group-hover:scale-105">
            —CONNECTSPHERE
          </span>
        </Link>

        {/* Center: Floating Pill Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 px-4 py-2 rounded-full bg-cream/40 border border-forest/10 backdrop-blur-xl shadow-sm transition-all duration-300 hover:bg-cream/60">
          <button
            onClick={() => scrollToSection('product')}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-forest/80 hover:text-forest transition-colors rounded-full hover:bg-forest/5"
          >
            Product
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-forest/80 hover:text-forest transition-colors rounded-full hover:bg-forest/5"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('security')}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-forest/80 hover:text-forest transition-colors rounded-full hover:bg-forest/5"
          >
            Security
          </button>
          <Link
            to="/pricing"
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-forest/80 hover:text-forest transition-colors rounded-full hover:bg-forest/5"
          >
            Pricing
          </Link>
        </nav>

        {/* Right: Join Meeting & Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => setQuickJoinOpen(true)}
            className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-deep hover:-translate-y-0.5"
          >
            <span>JOIN MEETING</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
            </span>
          </button>

          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 rounded-full border border-forest/20 text-xs font-bold uppercase tracking-widest text-forest hover:bg-forest/5 transition-colors"
            >
              <span>{user.name.split(' ')[0]}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold uppercase tracking-[0.25em] text-forest hover:opacity-75 transition-opacity px-2"
            >
              Log In
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setQuickJoinOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-forest text-cream font-bold text-[10px] uppercase tracking-widest"
          >
            Join
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-full bg-cream/70 border border-forest/15 text-forest"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-6 rounded-card-lg bg-cream/95 border border-forest/15 backdrop-blur-2xl shadow-deep flex flex-col space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => scrollToSection('product')}
            className="text-left text-sm font-bold uppercase tracking-[0.2em] text-forest py-2 border-b border-forest/10"
          >
            Product
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="text-left text-sm font-bold uppercase tracking-[0.2em] text-forest py-2 border-b border-forest/10"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('security')}
            className="text-left text-sm font-bold uppercase tracking-[0.2em] text-forest py-2 border-b border-forest/10"
          >
            Security
          </button>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-[0.2em] text-forest py-2 border-b border-forest/10"
          >
            Pricing
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-full bg-forest text-cream text-center text-xs font-bold uppercase tracking-widest"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold uppercase tracking-widest text-forest border border-forest/20 rounded-full"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold uppercase tracking-widest bg-forest text-cream rounded-full"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Join Modal */}
      {quickJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-8 rounded-card-lg bg-cream border border-forest/20 shadow-deep">
            <button
              onClick={() => setQuickJoinOpen(false)}
              className="absolute top-6 right-6 text-forest/60 hover:text-forest transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 rounded-full bg-sage text-forest">
                <Video className="w-5 h-5" />
              </div>
              <span className="editorial-label text-forest/70">Connect Directly</span>
            </div>
            <h3 className="font-display text-3xl text-forest mb-4">JOIN A MEETING</h3>
            <p className="text-forest/80 text-sm mb-6">
              Enter the meeting ID or invitation link to jump directly into the room.
            </p>
            <form onSubmit={handleQuickJoin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="e.g. 748-921-cs or paste link"
                  value={quickMeetingCode}
                  onChange={(e) => setQuickMeetingCode(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-full bg-cream-light border border-forest/25 text-forest font-medium placeholder:text-forest/40 focus:outline-none focus:border-forest text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!quickMeetingCode.trim()}
                className="w-full py-3.5 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.25em] transition-all hover:shadow-deep hover:bg-forest-light disabled:opacity-50"
              >
                Enter Meeting Room →
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
