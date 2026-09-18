import React, { useState, useEffect } from 'react';
import { X, BarChart2, Plus, Trash2, CheckCircle2, Vote } from 'lucide-react';
import { Socket } from 'socket.io-client';

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // User IDs who voted
}

export interface PollItem {
  id: string;
  question: string;
  creatorId: string;
  creatorName: string;
  options: PollOption[];
  isClosed: boolean;
  createdAt: string;
}

interface PollsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  socket: Socket | null;
}

export const PollsDrawer: React.FC<PollsDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  socket
}) => {
  const [polls, setPolls] = useState<PollItem[]>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_polls_${meetingId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'poll-welcome',
        question: 'How is your connection and audio quality today?',
        creatorId: 'system',
        creatorName: 'Meeting Host',
        isClosed: false,
        createdAt: new Date().toISOString(),
        options: [
          { id: 'opt-1', text: 'Crystal clear HD (Optimal)', votes: ['usr-sample1', 'usr-sample2'] },
          { id: 'opt-2', text: 'Good, minor background noise', votes: ['usr-sample3'] },
          { id: 'opt-3', text: 'Experiencing packet loss', votes: [] }
        ]
      }
    ];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_polls_${meetingId}`, JSON.stringify(polls));
    } catch (e) {}
  }, [polls, meetingId]);

  // Sync listeners (BroadcastChannel + Socket)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_polls_${meetingId}`);
      bc.onmessage = (e) => {
        if (e.data?.polls) setPolls(e.data.polls);
      };
    } catch (e) {}

    if (socket) {
      const handlePollsUpdate = (updatedPolls: PollItem[]) => {
        setPolls(updatedPolls);
      };
      socket.on('meeting:polls-update', handlePollsUpdate);

      return () => {
        socket.off('meeting:polls-update', handlePollsUpdate);
        if (bc) bc.close();
      };
    }

    return () => {
      if (bc) bc.close();
    };
  }, [meetingId, socket]);

  const broadcastPolls = (updated: PollItem[]) => {
    setPolls(updated);
    socket?.emit('meeting:polls-update', { meetingId, polls: updated });
    try {
      const bc = new BroadcastChannel(`connectsphere_polls_${meetingId}`);
      bc.postMessage({ polls: updated });
      bc.close();
    } catch (e) {}
  };

  const handleVote = (pollId: string, optionId: string) => {
    const updated = polls.map((poll) => {
      if (poll.id !== pollId || poll.isClosed) return poll;

      const newOptions = poll.options.map((opt) => {
        // Remove vote from other options in this poll
        const filtered = opt.votes.filter((uid) => uid !== currentUserId);
        if (opt.id === optionId) {
          return { ...opt, votes: [...filtered, currentUserId] };
        }
        return { ...opt, votes: filtered };
      });

      return { ...poll, options: newOptions };
    });

    broadcastPolls(updated);
  };

  const handleAddOption = () => {
    if (newOptions.length < 5) {
      setNewOptions([...newOptions, '']);
    }
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = newOptions.map((o) => o.trim()).filter(Boolean);
    if (!newQuestion.trim() || cleanOptions.length < 2) return;

    const newPoll: PollItem = {
      id: 'poll-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      question: newQuestion.trim(),
      creatorId: currentUserId,
      creatorName: currentUserName,
      isClosed: false,
      createdAt: new Date().toISOString(),
      options: cleanOptions.map((optText, idx) => ({
        id: `opt-${idx}-${Date.now()}`,
        text: optText,
        votes: []
      }))
    };

    broadcastPolls([newPoll, ...polls]);
    setNewQuestion('');
    setNewOptions(['', '']);
    setIsCreating(false);
  };

  const handleToggleClosePoll = (pollId: string) => {
    const updated = polls.map((p) =>
      p.id === pollId ? { ...p, isClosed: !p.isClosed } : p
    );
    broadcastPolls(updated);
  };

  const handleDeletePoll = (pollId: string) => {
    const updated = polls.filter((p) => p.id !== pollId);
    broadcastPolls(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-[#1e2026] border-l border-[#2e323e] flex flex-col select-none text-zinc-200 shadow-xl">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2e323e] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-sm text-white">Live Polls</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Polls Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4">
        {/* Create Poll Button */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Poll</span>
          </button>
        )}

        {/* Create Poll Form */}
        {isCreating && (
          <form
            onSubmit={handleCreatePoll}
            className="p-3.5 rounded-xl bg-[#272a34] border border-[#373b49] space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                New Poll
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Question</label>
              <input
                type="text"
                placeholder="What would you like to ask?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1c1e24] border border-[#373b49] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400 block">Options</label>
              {newOptions.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const copy = [...newOptions];
                    copy[i] = e.target.value;
                    setNewOptions(copy);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1c1e24] border border-[#373b49] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                  required
                />
              ))}

              {newOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium pt-1 block"
                >
                  + Add another option
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Launch Poll
            </button>
          </form>
        )}

        {/* Polls List */}
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);
          const hasVoted = poll.options.some((opt) => opt.votes.includes(currentUserId));

          return (
            <div
              key={poll.id}
              className="p-3.5 rounded-xl bg-[#232630] border border-[#303442] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-white leading-snug">
                    {poll.question}
                  </h4>
                  <span className="text-[10px] text-zinc-400">
                    By {poll.creatorName} · {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                    {poll.isClosed && ' · (Closed)'}
                  </span>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleClosePoll(poll.id)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#2e323e] hover:bg-[#383d4c] text-zinc-300 transition-colors"
                  >
                    {poll.isClosed ? 'Reopen' : 'Close'}
                  </button>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Delete Poll"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {poll.options.map((opt) => {
                  const voteCount = opt.votes.length;
                  const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                  const isMyVote = opt.votes.includes(currentUserId);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(poll.id, opt.id)}
                      disabled={poll.isClosed}
                      className={`w-full text-left p-2 rounded-lg border transition-all relative overflow-hidden ${
                        isMyVote
                          ? 'border-blue-500 bg-blue-950/25 text-white'
                          : 'border-[#333745] bg-[#272a34] hover:border-[#42485a] text-zinc-300'
                      }`}
                    >
                      {/* Live Percentage Fill Bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-blue-600/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />

                      <div className="relative flex items-center justify-between z-10 text-xs">
                        <div className="flex items-center space-x-2">
                          {isMyVote ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          ) : (
                            <Vote className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          )}
                          <span className="font-medium">{opt.text}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-zinc-400">
                          {percent}% ({voteCount})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
