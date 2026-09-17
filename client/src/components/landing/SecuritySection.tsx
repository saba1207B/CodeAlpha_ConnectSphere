import React from 'react';
import { KeyRound, Shield, FileCheck, Users, LockKeyhole, Sparkles } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityPillars = [
    {
      title: "AUTHENTICATION",
      desc: "Cryptographically salted bcrypt passwords paired with HTTP-only cookies and protected token sessions.",
      icon: KeyRound,
      tag: "RFC 7519",
      accent: "bg-terracotta text-cream",
      badgeBorder: "border-terracotta/40 text-terracotta-light"
    },
    {
      title: "ACCESS CONTROL",
      desc: "Meeting lock mechanics, host admission gates, and granular participant role authorization.",
      icon: Users,
      tag: "RBAC Model",
      accent: "bg-amber text-forest",
      badgeBorder: "border-amber/40 text-amber-light"
    },
    {
      title: "ENCRYPTED TRANSPORT",
      desc: "Strict DTLS / SRTP media streams via WebRTC and TLS 1.3 socket protocol pipelines.",
      icon: LockKeyhole,
      tag: "DTLS / SRTP",
      accent: "bg-coral text-cream",
      badgeBorder: "border-coral/40 text-coral-light"
    },
    {
      title: "SECURE FILE HANDLING",
      desc: "Server-side MIME inspection, strict file-extension quarantine, and zero-executable transmission.",
      icon: FileCheck,
      tag: "Quarantined",
      accent: "bg-sage text-forest",
      badgeBorder: "border-sage/40 text-sage"
    },
    {
      title: "PROTECTED MEETINGS",
      desc: "Unique ephemeral room identifiers, optional passcode challenges, and instantaneous participant ejection.",
      icon: Shield,
      tag: "Isolated",
      accent: "bg-cream text-forest",
      badgeBorder: "border-cream/40 text-cream"
    }
  ];

  return (
    <section id="security" className="relative bg-forest-mesh text-cream pt-24 pb-32 px-6 sm:px-12 lg:px-16 border-t border-forest-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 sm:mb-20 max-w-3xl">
          <span className="editorial-label text-amber block mb-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber" />
            <span>Security &amp; Integrity Architecture</span>
          </span>
          <h2 className="section-title text-cream tracking-tight">
            PRIVATE<br />BY DESIGN
          </h2>
          <p className="text-sage/90 max-w-xl text-base sm:text-lg mt-5 leading-relaxed">
            Privacy is not a superficial feature toggle. ConnectSphere is structured around strict authorization boundaries, protected peer streams, and verified storage pipelines.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-8 sm:p-9 rounded-card-lg bg-[#013522]/90 border border-sage/15 flex flex-col justify-between hover:border-sage/40 transition-all duration-300 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${p.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`editorial-label text-[9px] px-3 py-1 rounded-full bg-forest-dark border ${p.badgeBorder}`}>
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-cream tracking-wide mb-3">
                    {p.title}
                  </h3>
                  <p className="text-sage/80 text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="pt-5 mt-6 border-t border-sage/10 text-[10px] font-bold uppercase tracking-widest text-sage/60 flex items-center justify-between">
                  <span>Verified Standard</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
