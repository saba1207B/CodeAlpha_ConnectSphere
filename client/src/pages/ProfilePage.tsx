import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Check, ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/layout/Navigation';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUserDirect } = useAuth();
  const [name, setName] = useState(user?.name || 'Julian Sterling');
  const [email] = useState(user?.email || 'director@studio.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUserDirect({ ...user, name });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream text-forest flex flex-col justify-between pt-24 pb-16 px-6 sm:px-12 lg:px-20">
      <Navigation />

      <main className="max-w-3xl mx-auto w-full my-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-forest/70 hover:text-forest transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="p-8 sm:p-12 rounded-card-lg sm:rounded-container-xl bg-olive/30 border border-forest/15 shadow-deep">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 mb-10 pb-10 border-b border-forest/15">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-forest text-cream flex items-center justify-center font-display text-4xl shadow-deep">
                {name.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-cream text-forest border border-forest/20 shadow-sm hover:bg-forest hover:text-cream transition-colors"
                title="Update Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center sm:text-left">
              <span className="editorial-label text-forest/60 block mb-1">
                Account Identity
              </span>
              <h1 className="font-display text-4xl sm:text-5xl tracking-tight mb-2">
                {name}
              </h1>
              <p className="text-sm text-forest/70 font-medium">
                Verified Contributor · WebRTC Mesh Member
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="editorial-label text-xs block mb-2 text-forest/80">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-full bg-cream border border-forest/25 text-forest text-sm font-medium focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="editorial-label text-xs block mb-2 text-forest/80">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-5 py-4 rounded-full bg-cream/50 border border-forest/15 text-forest/60 text-sm font-medium cursor-not-allowed"
              />
              <span className="text-[10px] text-forest/50 mt-1 block px-3">
                Managed via organizational SSO or authentication provider.
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="text-xs text-forest/60">
                {saved && (
                  <span className="text-emerald-800 font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>PROFILE UPDATED SUCCESSFULLY</span>
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="px-8 py-4 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest-light transition-all shadow-deep"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-forest/40 uppercase tracking-widest pt-8">
        ConnectSphere Security &amp; Identity Subsystem
      </footer>
    </div>
  );
};
