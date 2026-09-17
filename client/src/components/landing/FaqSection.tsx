import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "How does ConnectSphere achieve low latency without external media servers?",
      answer: "ConnectSphere negotiates direct browser-to-browser WebRTC mesh topologies. Media packets travel directly between participant network interfaces encrypted with DTLS and SRTP, bypassing centralized transcoding servers and reducing latency to pure network ping (typically under 25ms).",
      category: "Architecture"
    },
    {
      question: "Is there any software or browser plugin required to join?",
      answer: "No. ConnectSphere is 100% native web technology. Any recipient on Chrome, Safari, Edge, or Firefox can simply click an invitation link or enter a room code to immediately participate in audio, video, screen share, and whiteboard collaboration.",
      category: "Compatibility"
    },
    {
      question: "How does real-time whiteboard synchronization work?",
      answer: "The collaborative canvas operates on a synchronized vector stream over Socket.io. Rather than sharing heavy bitmap screenshots, each brush point, shape, and note is transmitted as lightweight vector coordinates, allowing infinite resolution rendering and multi-user drawing without lag.",
      category: "Whiteboard"
    },
    {
      question: "How does ConnectSphere handle secure file uploads?",
      answer: "Uploaded files are inspected server-side for MIME type verification and quarantined against executable formats (.exe, .bat, .sh, .cmd, etc.). Files are accessible only to authenticated session participants and can be downloaded or purged by the uploader at any time.",
      category: "Security"
    },
    {
      question: "Can I use ConnectSphere for free today?",
      answer: "Yes. The core WebRTC mesh, full video/audio calling, unlimited collaborative whiteboards, encrypted chat, and file sharing are 100% live, operational, and free. Expanded enterprise tiers are marked as planned and will introduce recording archives and SSO.",
      category: "Pricing"
    }
  ];

  return (
    <section className="relative bg-cream pt-24 sm:pt-28 pb-32 px-6 sm:px-12 lg:px-16 border-t border-forest/15">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 sm:mb-20">
          <span className="editorial-label text-forest/70 block mb-3 flex items-center justify-center space-x-2">
            <HelpCircle className="w-4 h-4 text-terracotta" />
            <span>Clarity &amp; Inquiries</span>
          </span>
          <h2 className="section-title text-forest tracking-tight">
            FREQUENTLY<br />ANSWERED
          </h2>
          <p className="text-forest/80 text-sm sm:text-base mt-4 max-w-lg mx-auto">
            Everything you need to know about peer networking, privacy guarantees, and creative tools.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-card-lg bg-olive/20 border border-forest/15 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 hover:bg-olive/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="editorial-label text-[9px] px-2.5 py-0.5 rounded-full bg-forest text-cream font-mono">
                      {faq.category}
                    </span>
                    <span className="font-display text-xl sm:text-2xl text-forest tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-terracotta text-cream rotate-90' : 'bg-forest text-cream'
                  }`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-7 pb-7 pt-2 text-forest/85 text-sm sm:text-base leading-relaxed border-t border-forest/10 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-16 p-8 rounded-card-lg bg-forest text-cream flex flex-col sm:flex-row items-center justify-between gap-6 shadow-deep">
          <div>
            <h4 className="font-display text-2xl tracking-tight mb-1">
              Have an architecture or enterprise inquiry?
            </h4>
            <p className="text-sage text-xs sm:text-sm">
              Our engineering team is available for custom deployment consultations.
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 px-6 py-3 rounded-full bg-terracotta hover:bg-terracotta-dark text-cream font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center space-x-2"
          >
            <span>Talk to Engineering</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
