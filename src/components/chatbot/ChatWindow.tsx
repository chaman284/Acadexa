import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { ChatMessage } from '../../types/department';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  suggestedPrompts?: string[];
  type: 'tutor' | 'department';
  botName?: string;
  botSubtitle?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  suggestedPrompts = [],
  botName = 'Academic Tutor',
  botSubtitle = 'Ask me anything academic',
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFBF9]">
      {/* Bot header */}
      <div className="px-5 py-3.5 border-b border-[#E1D4CA] bg-white flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center flex-shrink-0 text-[#542536]">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="font-semibold text-[#302A2B] text-sm leading-tight">{botName}</p>
            <p className="text-xs text-[#79666A] font-normal mt-0.5">{botSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F4EF] border border-[#D5DFD4]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34483A] animate-pulse" />
          <span className="text-[11px] font-medium text-[#34483A] tracking-wider uppercase">Active</span>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12 my-auto">
            <div className="w-14 h-14 rounded-[14px] bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center text-[#542536] shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-md">
              <p
                className="text-lg font-normal text-[#302A2B] mb-1.5"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
              >
                How can I assist your studies today?
              </p>
              <p className="text-xs text-[#79666A] font-normal leading-relaxed">
                Select a recommended question below or type your inquiry to get step-by-step academic explanations.
              </p>
            </div>
            {suggestedPrompts.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(prompt)}
                    className="text-xs font-medium px-3.5 py-2 rounded-[8px] border border-[#E1D4CA] bg-white hover:bg-[#F7F1E8] text-[#542536] transition-all shadow-xs cursor-pointer text-left hover:border-[#C58D98]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              'flex gap-3 animate-fade-in-up items-start',
              msg.role === 'user' && 'flex-row-reverse'
            )}
          >
            {msg.role === 'assistant' ? (
              <div className="w-7 h-7 rounded-[8px] bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#542536]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            ) : (
              <Avatar name={user?.name || 'You'} size="xs" className="mt-0.5 flex-shrink-0" />
            )}
            <div
              className={clsx(
                'max-w-[78%] text-sm leading-relaxed rounded-[14px] px-4 py-2.5 shadow-xs whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-[#542536] text-white rounded-tr-xs font-normal'
                  : 'bg-white border border-[#E1D4CA] text-[#302A2B] rounded-tl-xs font-normal'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in items-start">
            <div className="w-7 h-7 rounded-[8px] bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#542536]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white border border-[#E1D4CA] rounded-[14px] rounded-tl-xs px-4 py-2.5 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#542536] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#542536] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#542536] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts strip when conversation has messages */}
      {messages.length > 0 && suggestedPrompts.length > 0 && (
        <div className="px-5 py-2 flex gap-2 overflow-x-auto bg-[#F7F1E8]/50 border-t border-[#E1D4CA]/50">
          {suggestedPrompts.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(prompt)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-[7px] border border-[#E1D4CA] bg-white hover:bg-[#F7F1E8] text-[#542536] transition-all flex-shrink-0 cursor-pointer shadow-xs hover:border-[#C58D98]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="p-4 border-t border-[#E1D4CA] bg-white">
        <div
          className="flex items-end gap-2 bg-[#F7F1E8]/40 focus-within:bg-white rounded-[12px] p-2 border border-[#E1D4CA] focus-within:border-[#542536] focus-within:ring-2 focus-within:ring-[#542536]/10 transition-all shadow-xs"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your courses, quizzes, or concepts..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#302A2B] placeholder:text-[#79666A]/70 outline-none resize-none px-2 py-1 max-h-32 leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-[8px] bg-[#542536] hover:bg-[#321923] text-white flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 cursor-pointer shadow-xs active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[11px] text-[#79666A] text-center mt-2 font-normal">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#F7F1E8] border border-[#E1D4CA] text-[10px]">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-[#F7F1E8] border border-[#E1D4CA] text-[10px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};
