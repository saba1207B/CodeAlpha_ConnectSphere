import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-forest text-sage pt-24 pb-16 px-6 sm:px-12 lg:px-20 border-t border-forest-light">
      <div className="max-w-7xl mx-auto">
        {/* 12-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 pb-20 border-b border-sage/15">
          {/* Left 6 Columns: Newsletter */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="editorial-label text-sage/70 block mb-4">Newsletter</span>
              <h2 className="font-display text-6xl sm:text-7xl lg:text-8xl text-cream tracking-tight leading-[0.85] mb-8">
                STAY<br />CONNECTED.
              </h2>
              <p className="text-sage/80 max-w-md text-sm sm:text-base mb-8">
                Dispatches on creative collaboration, WebRTC engineering, and thoughtful digital workspaces.
              </p>

              <form onSubmit={handleSubscribe} className="relative max-w-md">
                <div className="flex items-center border-b-2 border-sage/40 focus-within:border-cream transition-colors py-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    className="w-full bg-transparent text-cream placeholder:text-sage/40 placeholder:tracking-widest placeholder:text-xs text-sm font-medium focus:outline-none uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="flex items-center space-x-2 text-cream font-bold text-xs uppercase tracking-[0.2em] px-3 py-1 hover:text-olive transition-colors whitespace-nowrap"
                  >
                    <span>{subscribed ? 'JOINED' : 'SUBSCRIBE'}</span>
                    {subscribed ? <Check className="w-4 h-4 text-olive" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-12 pt-8 text-xs tracking-widest uppercase text-sage/50">
              EDITORIAL COLLABORATION SUITE
            </div>
          </div>

          {/* Right 6 Columns: Navigation Groups */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product */}
            <div>
              <span className="editorial-label text-cream block mb-6">Product</span>
              <ul className="space-y-4 text-sm text-sage/80">
                <li><a href="#features" className="hover:text-cream transition-colors">Meetings</a></li>
                <li><a href="#features" className="hover:text-cream transition-colors">Whiteboard</a></li>
                <li><a href="#features" className="hover:text-cream transition-colors">File Sharing</a></li>
                <li><a href="#security" className="hover:text-cream transition-colors">Security</a></li>
                <li><a href="#/pricing" className="hover:text-cream transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Architecture */}
            <div>
              <span className="editorial-label text-cream block mb-6">Origin</span>
              <ul className="space-y-4 text-sm text-sage/80">
                <li><span className="text-cream/90 font-medium">WebRTC Mesh</span></li>
                <li><span className="text-sage/70">Socket.io Wire</span></li>
                <li><span className="text-sage/70">Prisma Engine</span></li>
                <li><span className="text-sage/70">Analog Grain</span></li>
                <li><span className="text-sage/70">Low Latency</span></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <span className="editorial-label text-cream block mb-6">Company</span>
              <ul className="space-y-4 text-sm text-sage/80">
                <li><a href="#about" className="hover:text-cream transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-cream transition-colors">Contact</a></li>
                <li><a href="#privacy" className="hover:text-cream transition-colors">Privacy</a></li>
                <li><a href="#terms" className="hover:text-cream transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-sage/50">
          <p className="tracking-wider uppercase">
            © 2026 ConnectSphere. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0 tracking-widest uppercase opacity-30 hover:opacity-75 transition-opacity">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#terms" className="hover:underline">Terms of Service</a>
            <a href="#security" className="hover:underline">System Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
