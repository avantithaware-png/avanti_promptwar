import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  HelpCircle,
  ShieldAlert,
  Handshake,
  BrainCircuit,
  Copy,
  Check,
} from 'lucide-react';
import { ContextDetails } from '../types/decision';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface SocraticChatbotProps {
  decisionTitle?: string;
  currentLeaning?: string;
  primaryReasons?: string;
  contextDetails?: ContextDetails;
  isOpen: boolean;
  onClose: () => void;
}

export const SocraticChatbot: React.FC<SocraticChatbotProps> = ({
  decisionTitle = 'Career & Academic Crossroads',
  currentLeaning = 'Evaluating options',
  primaryReasons = '',
  contextDetails,
  isOpen,
  onClose,
}) => {
  const [roleMode, setRoleMode] = useState<'socratic' | 'devils_advocate' | 'negotiation_coach'>('socratic');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `I'm your **Socratic Mirror**. My goal isn't to tell you what to do, but to challenge your unstated premises and help you stress-test: **"${decisionTitle}"**.\n\nWhat is the most persistent doubt you've pushed to the back of your mind?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const quickPrompts = [
    'Challenge my assumption that high cash justifies delaying graduation.',
    'Roleplay as a senior mentor: what red flags should I watch for?',
    'Help me practice asking for 32 hours/week instead of 40.',
    'If I decline this offer, what is the best alternative way to gain experience?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          decisionContext: {
            decisionTitle,
            currentLeaning,
            primaryReasons,
            contextDetails,
          },
          roleMode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to receive reply.');
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content: `*A momentary connection interruption occurred: ${err.message || 'Please try again in a few seconds.'}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        content: `Conversation refreshed. I am calibrated to analyze **"${decisionTitle}"** as your **${
          roleMode === 'devils_advocate'
            ? "Devil's Advocate"
            : roleMode === 'negotiation_coach'
            ? 'Negotiation Coach'
            : 'Socratic Mirror'
        }**. What angle should we probe?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={`w-full bg-[#10131a] border border-zinc-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'max-w-4xl h-[90vh]'
            : 'max-w-xl h-[82vh] sm:h-[650px]'
        }`}
      >
        {/* Chat Header */}
        <div className="p-4 bg-[#141822] border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-sm font-semibold text-zinc-100">
                  Socratic Sparring Partner
                </h3>
                <span className="font-code text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  GEMINI 3.5
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-xs sm:max-w-sm">
                Context: {decisionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset Conversation"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse View' : 'Expand View'}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors hidden sm:block cursor-pointer"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Chat"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Selector Bar */}
        <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] uppercase font-code text-zinc-500 mr-1 shrink-0">
            Sparring Persona:
          </span>
          <button
            type="button"
            onClick={() => setRoleMode('socratic')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
              roleMode === 'socratic'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <HelpCircle className="w-3 h-3 text-amber-400" />
            <span>Socratic Mirror</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleMode('devils_advocate')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
              roleMode === 'devils_advocate'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Devil's Advocate</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleMode('negotiation_coach')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
              roleMode === 'negotiation_coach'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <Handshake className="w-3 h-3 text-emerald-400" />
            <span>Negotiation Coach</span>
          </button>
        </div>

        {/* Scrollable Messages Thread */}
        <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto font-sans-body">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1.5 shadow-sm group relative ${
                  msg.role === 'user'
                    ? 'bg-amber-500/15 border border-amber-500/30 text-zinc-100 rounded-tr-none'
                    : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 font-code">
                  <span>{msg.timestamp}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-200 ml-2"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-amber-400 border border-zinc-700 flex items-center justify-center text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-150" />
                <span className="ml-1 text-[11px] font-code">Deconstructing reasoning...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 4 && (
          <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/60 overflow-x-auto flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-code text-zinc-500 shrink-0">Suggested:</span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] whitespace-nowrap transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Box */}
        <div className="p-3 bg-[#141822] border-t border-zinc-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Challenge my thinking or ask how to negotiate trade-offs... (Enter to send, Shift+Enter for new line)"
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 resize-none font-sans-body"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
