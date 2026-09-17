import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Plus, ArrowRight, Clock, Users, Calendar, 
  Copy, Check, LogOut, Settings, User, Sparkles, X, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/layout/Navigation';

interface RecentMeeting {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  participants: number;
  duration: string;
}

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [scheduledSuccess, setScheduledSuccess] = useState<string | null>(null);

  // Time-based editorial greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 18) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  const displayName = user ? user.name.toUpperCase() : "CREATOR";

  const handleStartInstantMeeting = () => {
    const roomId = 'cs-' + Math.random().toString(36).substring(2, 8);
    navigate(`/meeting/${roomId}`);
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const cleanId = joinCode.trim().replace(/^.*\/meeting\//, '');
    navigate(`/meeting/${cleanId}`);
  };

  const handleCreateScheduledMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (newTitle.trim() ? newTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') : 'session') + '-' + Math.random().toString(36).substring(2, 6);
    setScheduledSuccess(slug);
  };

  const recentMeetings: RecentMeeting[] = [
    {
      id: 'cs-design-critique',
      title: 'Editorial System Review',
      category: 'DESIGN CRITIQUE',
      categoryColor: 'bg-terracotta/15 text-terracotta-dark border-terracotta/30',
      date: 'Today, 2:30 PM',
      participants: 4,
      duration: '42 mins'
    },
    {
      id: 'cs-audio-sync',
      title: 'WebRTC Mesh Architecture',
      category: 'SYSTEMS',
      categoryColor: 'bg-amber/20 text-amber-dark border-amber/40',
      date: 'Yesterday',
      participants: 3,
      duration: '28 mins'
    },
    {
      id: 'cs-whiteboard-sprint',
      title: 'Vector Canvas Brainstorm',
      category: 'COLLABORATION',
      categoryColor: 'bg-forest/15 text-forest border-forest/30',
      date: 'Sep 16, 2026',
      participants: 6,
      duration: '1 hr 15m'
    }
  ];

  const copyMeetingLink = (id: string) => {
    const url = `${window.location.origin}/meeting/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-warm-mesh text-forest flex flex-col justify-between pt-24 pb-16 px-6 sm:px-12 lg:px-16">
      <Navigation />

      <main className="max-w-7xl mx-auto w-full my-auto">
        {/* Editorial Greeting Header */}
        <div className="mb-12 pt-6 border-b border-forest/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="editorial-label text-terracotta block mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>Workspace Overview</span>
            </span>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.9]">
              {getGreeting()},<br />
              <span className="text-forest-dark">{displayName}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-terracotta text-cream font-bold text-xs uppercase tracking-widest hover:bg-terracotta-dark transition-all shadow-sm flex items-center space-x-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Room</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-5 py-2.5 rounded-full border border-forest/20 font-bold text-xs uppercase tracking-widest hover:bg-forest/5 transition-colors flex items-center space-x-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-5 py-2.5 rounded-full border border-forest/20 font-bold text-xs uppercase tracking-widest hover:bg-forest/5 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-full border border-forest/20 hover:bg-rose-50 text-rose-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="p-5 rounded-card-lg bg-cream/90 border border-forest/15 shadow-sm">
            <span className="editorial-label text-[10px] text-terracotta block mb-1">Sessions Active</span>
            <span className="font-display text-3xl sm:text-4xl text-forest">03 ROOMS</span>
          </div>
          <div className="p-5 rounded-card-lg bg-cream/90 border border-forest/15 shadow-sm">
            <span className="editorial-label text-[10px] text-amber block mb-1">Total Time</span>
            <span className="font-display text-3xl sm:text-4xl text-forest">148 MINS</span>
          </div>
          <div className="p-5 rounded-card-lg bg-cream/90 border border-forest/15 shadow-sm">
            <span className="editorial-label text-[10px] text-forest/70 block mb-1">Vector Boards</span>
            <span className="font-display text-3xl sm:text-4xl text-forest">05 SAVED</span>
          </div>
          <div className="p-5 rounded-card-lg bg-cream/90 border border-forest/15 shadow-sm">
            <span className="editorial-label text-[10px] text-emerald-700 block mb-1">Mesh Status</span>
            <span className="font-display text-3xl sm:text-4xl text-forest">OPTIMAL</span>
          </div>
        </div>

        {/* Primary Actions: Large Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 mb-16">
          {/* Card 1: Start Instant Meeting */}
          <div className="md:col-span-6 p-8 sm:p-10 rounded-card-lg sm:rounded-container-xl bg-forest text-cream shadow-deep flex flex-col justify-between min-h-[340px] border border-forest-light">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="editorial-label text-amber">Instant Space</span>
                <div className="w-11 h-11 rounded-full bg-cream text-forest flex items-center justify-center shadow-sm">
                  <Video className="w-5 h-5" />
                </div>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight mb-3">
                START A MEETING
              </h2>
              <p className="text-sage/85 text-sm sm:text-base max-w-md">
                Launch a fresh room instantly with dedicated WebRTC peer channels, synchronized whiteboard, and encrypted chat.
              </p>
            </div>

            <button
              onClick={handleStartInstantMeeting}
              className="self-start group flex items-center space-x-3 px-8 py-4 rounded-full bg-cream text-forest font-bold text-xs uppercase tracking-[0.25em] shadow-deep hover:bg-white hover:scale-105 transition-all duration-300 mt-6"
            >
              <span>LAUNCH ROOM NOW</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 2: Join by ID or URL */}
          <div className="md:col-span-6 p-8 sm:p-10 rounded-card-lg sm:rounded-container-xl bg-olive/40 border border-forest/20 shadow-sm flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="editorial-label text-forest/70">Enter Session</span>
                <div className="w-11 h-11 rounded-full bg-forest text-cream flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight mb-3 text-forest">
                JOIN A MEETING
              </h2>
              <p className="text-forest/80 text-sm sm:text-base max-w-md mb-6">
                Paste a link or code from a colleague or team lead to enter an active collaboration session.
              </p>
            </div>

            <form onSubmit={handleJoinMeeting} className="flex items-center space-x-2 mt-auto">
              <input
                type="text"
                placeholder="ROOM CODE OR URL"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-full bg-cream border border-forest/25 text-forest text-xs font-bold uppercase tracking-wider placeholder:text-forest/40 focus:outline-none focus:border-forest"
              />
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="px-6 py-3.5 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-[0.2em] hover:bg-forest-light disabled:opacity-40 transition-colors shadow-sm"
              >
                JOIN →
              </button>
            </form>
          </div>
        </div>

        {/* Recent Meetings: Editorial List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="editorial-label text-forest/60 block mb-1">
                Archived Sessions
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-forest tracking-tight">
                RECENT CONVERSATIONS
              </h3>
            </div>
            <span className="editorial-label text-xs text-forest/60">
              3 Sessions Cached
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentMeetings.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-card-lg bg-cream/95 border border-forest/15 flex flex-col justify-between min-h-[230px] hover:border-forest/40 transition-all hover:-translate-y-1 hover:shadow-deep"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`editorial-label text-[9px] px-2.5 py-0.5 rounded-full border ${m.categoryColor}`}>
                      {m.category}
                    </span>
                    <button
                      onClick={() => copyMeetingLink(m.id)}
                      className="p-1.5 rounded-full hover:bg-forest/10 text-forest/70 hover:text-forest transition-colors"
                      title="Copy Link"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-800" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <h4 className="font-display text-2xl text-forest mb-2">
                    {m.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-forest/70 font-medium">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-forest/60" />
                      <span>{m.participants} peers</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-forest/60" />
                      <span>{m.duration}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/meeting/${m.id}`)}
                  className="self-start text-xs font-bold uppercase tracking-[0.2em] text-forest flex items-center space-x-1 hover:underline pt-4 border-t border-forest/10 w-full"
                >
                  <span>RE-ENTER SPACE</span>
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Schedule Room Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-8 rounded-card-lg bg-cream border border-forest/20 shadow-deep text-forest">
            <button
              onClick={() => {
                setScheduleModalOpen(false);
                setScheduledSuccess(null);
              }}
              className="absolute top-6 right-6 text-forest/60 hover:text-forest p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="editorial-label text-terracotta block mb-2">Calendar Integration</span>
            <h3 className="font-display text-3xl mb-4">SCHEDULE A SESSION</h3>

            {scheduledSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-organic-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <div className="font-bold uppercase tracking-wider mb-1">Room Link Generated!</div>
                  <div className="font-mono text-xs">{window.location.origin}/meeting/{scheduledSuccess}</div>
                </div>
                <button
                  onClick={() => navigate(`/meeting/${scheduledSuccess}`)}
                  className="w-full py-3.5 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-widest hover:bg-forest-light transition-all"
                >
                  Enter Room Now →
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateScheduledMeeting} className="space-y-4">
                <div>
                  <label className="editorial-label text-[10px] block mb-2 text-forest/70">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Critique Pod"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-cream-light border border-forest/25 text-sm font-medium focus:outline-none focus:border-forest"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-forest text-cream font-bold text-xs uppercase tracking-widest hover:bg-forest-light transition-all shadow-sm"
                >
                  Create Custom Room →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto w-full pt-12 border-t border-forest/15 mt-12 text-xs text-forest/50 flex flex-col sm:flex-row items-center justify-between">
        <span className="uppercase tracking-widest">ConnectSphere Editorial Platform</span>
        <span className="uppercase tracking-widest mt-2 sm:mt-0">Encrypted Transport Ready</span>
      </footer>
    </div>
  );
};
