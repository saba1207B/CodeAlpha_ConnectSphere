import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { ChatMessage } from '../../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  currentUserId: string;
  currentUserName: string;
  socket: Socket | null;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  meetingId,
  currentUserId,
  currentUserName,
  socket
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`connectsphere_chat_${meetingId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'system-welcome',
        meetingId,
        senderId: 'system',
        senderName: 'Meeting Host',
        text: 'Welcome! In-meeting chat is end-to-end encrypted and visible to everyone in this room.',
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`connectsphere_chat_${meetingId}`, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, meetingId]);

  // Dual-Engine Listeners (BroadcastChannel + Global Mesh + Socket.io)
  useEffect(() => {
    // 1. BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`connectsphere_chat_channel_${meetingId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, message } = event.data;
        if (type === 'chat:new-message' && message && message.senderId !== currentUserId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      };
    } catch (e) {}

    // 2. Global PeerJS Mesh across countries
    const handleGlobalChatMessage = (e: any) => {
      const msg = e.detail;
      if (msg && msg.senderId !== currentUserId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };
    window.addEventListener('connectsphere:chat-message', handleGlobalChatMessage);

    // 3. Socket.io
    if (socket) {
      const handleNewMessage = (message: ChatMessage) => {
        if (message.senderId !== currentUserId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      };

      socket.on('chat:message', handleNewMessage);

      return () => {
        socket.off('chat:message', handleNewMessage);
        window.removeEventListener('connectsphere:chat-message', handleGlobalChatMessage);
        if (bc) bc.close();
      };
    }

    return () => {
      window.removeEventListener('connectsphere:chat-message', handleGlobalChatMessage);
      if (bc) bc.close();
    };
  }, [socket, meetingId, currentUserId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      meetingId,
      senderId: currentUserId,
      senderName: currentUserName,
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Broadcast across Socket.io
    socket?.emit('chat:send', newMessage);

    // Broadcast across BroadcastChannel
    broadcastChannelRef.current?.postMessage({
      type: 'chat:new-message',
      message: newMessage
    });

    // Broadcast across Global Internet Mesh
    (window as any).csBroadcastGlobalData?.('chat', newMessage);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-[#1e2026] border-l border-[#2e323e] flex flex-col select-none text-zinc-200 shadow-xl">
      {/* Drawer Header */}
      <div className="p-3 sm:p-4 border-b border-[#2e323e] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-zinc-300" />
          <h3 className="font-semibold text-sm text-white">Meeting Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#2c303c] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          const isSystem = m.senderId === 'system';
          const timeFormatted = new Date(m.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          if (isSystem) {
            return (
              <div key={m.id} className="p-2.5 rounded-lg bg-[#252833] border border-[#353949] text-xs text-zinc-400 text-center leading-relaxed">
                {m.text}
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 px-1">
                <span className="font-medium text-zinc-300">{isMe ? 'You' : m.senderName}</span>
                <span>·</span>
                <span>{timeFormatted}</span>
              </div>
              <div
                className={`max-w-[88%] px-3 py-2 text-xs leading-relaxed break-words ${
                  isMe
                    ? 'rounded-lg bg-blue-600 text-white shadow-sm'
                    : 'rounded-lg bg-[#282b37] border border-[#373b4b] text-zinc-200 shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2e323e] bg-[#1a1c22]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type message to everyone..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[#272a34] border border-[#373b49] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-500 transition-colors"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
