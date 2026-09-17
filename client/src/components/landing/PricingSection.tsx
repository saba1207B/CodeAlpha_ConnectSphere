import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "FREE",
      price: "$0",
      period: "forever",
      desc: "For creative duos, independent builders and personal collaboration.",
      badge: "LIVE & FREE",
      badgeClass: "bg-forest text-cream border-forest",
      features: [
        "Up to 8 concurrent WebRTC participants",
        "Unlimited meeting durations",
        "Real-time synchronized whiteboard",
        "Encrypted chat & file sharing (up to 25MB)",
        "Direct screen sharing with audio pass-through"
      ],
      ctaText: "START FREE NOW",
      isPrimary: false,
      btnClass: "bg-forest text-cream hover:bg-forest-light"
    },
    {
      name: "TEAM",
      price: isAnnual ? "$14" : "$18",
      period: "per host / month",
      desc: "For growing design studios, engineering pods and agencies.",
      badge: "PLANNED",
      badgeClass: "bg-terracotta text-cream border-terracotta",
      features: [
        "Up to 32 concurrent WebRTC participants",
        "Custom branded room slugs & domains",
        "Multi-board persistent canvas spaces",
        "Meeting audio/video recording archives",
        "Dedicated room lock & co-host controls"
      ],
      ctaText: "REGISTER INTEREST",
      isPrimary: true,
      btnClass: "bg-terracotta text-cream hover:bg-terracotta-dark shadow-deep"
    },
    {
      name: "BUSINESS",
      price: isAnnual ? "$38" : "$48",
      period: "per host / month",
      desc: "For enterprise creative technology groups requiring custom governance.",
      badge: "PLANNED",
      badgeClass: "bg-amber text-forest border-amber font-bold",
      features: [
        "Up to 100 concurrent peer connections",
        "SAML SSO & Okta identity synchronization",
        "Enterprise file quota up to 500MB",
        "Audit logs & access telemetry",
        "99.99% uptime SLA with dedicated support"
      ],
      ctaText: "TALK TO US",
      isPrimary: false,
      btnClass: "bg-forest text-cream hover:bg-forest-light"
    }
  ];

  return (
    <section id="pricing" className="relative bg-warm-mesh pt-24 sm:pt-28 pb-32 px-6 sm:px-12 lg:px-16 border-t border-forest/15">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <span className="editorial-label text-forest/70 block mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber"></span>
              <span>Transparent Access Models</span>
            </span>
            <h2 className="section-title text-forest tracking-tight">
              CHOOSE<br />YOUR SPACE
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-forest/80 text-sm sm:text-base mb-6 leading-relaxed">
              ConnectSphere core peer infrastructure is completely functional and free today. Expanded tier plans are marked as planned.
            </p>

            {/* Annual vs Monthly Toggle */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-cream border border-forest/20 shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  !isAnnual ? 'bg-forest text-cream shadow-sm' : 'text-forest/70 hover:text-forest'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                  isAnnual ? 'bg-terracotta text-cream shadow-sm' : 'text-forest/70 hover:text-forest'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber text-forest text-[9px]">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Large Organic Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 sm:p-10 rounded-card-lg sm:rounded-container-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-sm ${
                plan.isPrimary
                  ? 'bg-forest text-cream shadow-deep border-2 border-terracotta/40'
                  : 'bg-cream/90 text-forest border border-forest/20 hover:border-forest/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className={`font-display text-3xl tracking-tight ${plan.isPrimary ? 'text-cream' : 'text-forest'}`}>
                    {plan.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${plan.badgeClass}`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-display text-5xl sm:text-6xl tracking-tight">
                      {plan.price}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${plan.isPrimary ? 'text-sage' : 'text-forest/70'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-3 ${plan.isPrimary ? 'text-cream/80' : 'text-forest/80'}`}>
                    {plan.desc}
                  </p>
                </div>

                {/* Features List */}
                <div className="py-6 border-t border-b space-y-3.5 my-6 border-forest/15">
                  {plan.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-3 text-sm">
                      <div className={`mt-0.5 p-0.5 rounded-full ${plan.isPrimary ? 'bg-amber text-forest' : 'bg-forest text-cream'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={plan.isPrimary ? 'text-cream/90' : 'text-forest/90'}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => {
                    if (plan.name === 'FREE') {
                      navigate('/register');
                    } else {
                      alert(`The ${plan.name} plan is planned for future release. You can use the fully functional FREE tier right now!`);
                    }
                  }}
                  className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center space-x-2 transition-all duration-300 ${plan.btnClass}`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
