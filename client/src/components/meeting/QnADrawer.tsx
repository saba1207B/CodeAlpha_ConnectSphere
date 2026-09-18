import React, { useState, useEffect } from 'react';
import { X, HelpCircle, ThumbsUp, CheckCircle, MessageSquarePlus, CornerDownRight } from 'lucide-react';
import { Socket } from 'socket.io-client';

export interface QnAQuestion {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  upvotes: string[]; // User IDs who upvoted
  answer?: string;
  isAnsweredLive?: boolean;
  createdAt: string;
}

interface QnADrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  socket: Socket | null;
}

export const QnADrawer: React.FC<QnADrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  socket
}) => {
  const [questions, setQuestions] = useState<QnAQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_qna_${meetingId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'q-sample-1',
        authorId: 'usr-guest1',
        authorName: 'Alex Rivera',
        text: 'Will the session recording and AI meeting notes be available immediately after the call?',
        upvotes: ['usr-sample1', 'usr-sample2', 'usr-sample3'],
        answer: 'Yes, meeting recordings and Gemini AI summaries are instantly exportable to your computer or Google Drive!',
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      },
      {
        id: 'q-sample-2',
        authorId: 'usr-guest2',
        authorName: 'Sarah Lin',
        text: 'Does ConnectSphere support phone dial-in or companion mode for audio?',
        upvotes: ['usr-sample4'],
        isAnsweredLive: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerInputText, setAnswerInputText] = useState('');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_qna_${meetingId}`, JSON.stringify(questions));
    } catch (e) {}
  }, [questions, meetingId]);

  // Sync listeners (BroadcastChannel + Socket)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_qna_${meetingId}`);
      bc.onmessage = (e) => {
        if (e.data?.questions) setQuestions(e.data.questions);
      };
    } catch (e) {}

    if (socket) {
      const handleQnAUpdate = (updatedQuestions: QnAQuestion[]) => {
        setQuestions(updatedQuestions);
      };
      socket.on('meeting:qna-update', handleQnAUpdate);

      return () => {
        socket.off('meeting:qna-update', handleQnAUpdate);
        if (bc) bc.close();
      };
    }

    return () => {
      if (bc) bc.close();
    };
  }, [meetingId, socket]);

  const broadcastQuestions = (updated: QnAQuestion[]) => {
    setQuestions(updated);
    socket?.emit('meeting:qna-update', { meetingId, questions: updated });
    try {
      const bc = new BroadcastChannel(`connectsphere_qna_${meetingId}`);
      bc.postMessage({ questions: updated });
      bc.close();
    } catch (e) {}
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    const newQ: QnAQuestion = {
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      authorId: currentUserId,
      authorName: currentUserName,
      text: inputQuestion.trim(),
      upvotes: [currentUserId],
      createdAt: new Date().toISOString()
    };

    broadcastQuestions([newQ, ...questions]);
    setInputQuestion('');
  };

  const handleToggleUpvote = (qId: string) => {
    const updated = questions.map((q) => {
      if (q.id !== qId) return q;
      const hasVoted = q.upvotes.includes(currentUserId);
      const newVotes = hasVoted
        ? q.upvotes.filter((id) => id !== currentUserId)
        : [...q.upvotes, currentUserId];
      return { ...q, upvotes: newVotes };
    });
    broadcastQuestions(updated);
  };

  const handleMarkAnsweredLive = (qId: string) => {
    const updated = questions.map((q) =>
      q.id === qId ? { ...q, isAnsweredLive: true } : q
    );
    broadcastQuestions(updated);
  };

  const handleSubmitTextAnswer = (qId: string) => {
    if (!answerInputText.trim()) return;
    const updated = questions.map((q) =>
      q.id === qId ? { ...q, answer: answerInputText.trim() } : q
    );
    broadcastQuestions(updated);
    setAnsweringQuestionId(null);
    setAnswerInputText('');
  };

  const filteredQuestions = questions.filter((q) => {
    const isAnswered = Boolean(q.answer || q.isAnsweredLive);
    if (activeFilter === 'answered') return isAnswered;
    if (activeFilter === 'unanswered') return !isAnswered;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-[#1e2026] border-l border-[#2e323e] flex flex-col select-none text-zinc-200 shadow-xl">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2e323e] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold text-sm text-white">Q&amp;A</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-900/40 text-purple-300 font-bold">
            {questions.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center px-3 py-2 border-b border-[#2e323e] space-x-1 text-xs">
        {(['all', 'unanswered', 'answered'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
              activeFilter === filter
                ? 'bg-[#2b2f3d] text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Question List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">
            No questions in this category.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const hasUpvoted = q.upvotes.includes(currentUserId);
            const isAnswered = Boolean(q.answer || q.isAnsweredLive);

            return (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-[#232630] border border-[#303442] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-zinc-400 block mb-0.5 font-medium">
                      {q.authorName}
                    </span>
                    <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                      {q.text}
                    </p>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => handleToggleUpvote(q.id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-semibold transition-all ${
                      hasUpvoted
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                        : 'bg-[#272a34] border-[#373b49] text-zinc-400 hover:text-white'
                    }`}
                    title="Upvote question"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{q.upvotes.length}</span>
                  </button>
                </div>

                {/* Answer Display */}
                {q.answer && (
                  <div className="p-2.5 rounded-lg bg-[#1a1c22] border border-[#2d313e] text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center space-x-1 text-emerald-400 font-semibold text-[10px]">
                      <CheckCircle className="w-3 h-3" />
                      <span>Host Answer:</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-[11px]">{q.answer}</p>
                  </div>
                )}

                {q.isAnsweredLive && !q.answer && (
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Answered live during call</span>
                  </div>
                )}

                {/* Host Moderation Actions */}
                {!isAnswered && (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <button
                      onClick={() => handleMarkAnsweredLive(q.id)}
                      className="text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      Mark Answered Live
                    </button>
                    <button
                      onClick={() => setAnsweringQuestionId(answeringQuestionId === q.id ? null : q.id)}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      {answeringQuestionId === q.id ? 'Cancel' : 'Type Answer'}
                    </button>
                  </div>
                )}

                {/* Inline Answer Form */}
                {answeringQuestionId === q.id && (
                  <div className="pt-2 border-t border-[#313644] space-y-2">
                    <input
                      type="text"
                      placeholder="Write your answer..."
                      value={answerInputText}
                      onChange={(e) => setAnswerInputText(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#1c1e24] border border-[#373b49] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleSubmitTextAnswer(q.id)}
                      className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                    >
                      Publish Answer
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ask Question Input */}
      <form onSubmit={handlePostQuestion} className="p-3 border-t border-[#2e323e] bg-[#1a1c22]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question to the host..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[#272a34] border border-[#373b49] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim()}
            className="p-2 rounded-lg bg-purple-600 text-white disabled:opacity-30 hover:bg-purple-500 transition-colors"
            title="Post Question"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
