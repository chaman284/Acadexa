import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { ChatMessage } from '../../types/department';
import { Avatar } from '../ui/Avatar';

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
  type,
  botName = 'AI Tutor',
  botSubtitle = 'Ask me anything academic',
}) => {
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

  const accentColor = type === 'tutor' ? 'var(--color-accent)' : '#0ea5e9';

  return (
    <div className="flex flex-col h-full">
      {/* Bot header */}
      <div
        className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-3"
        style={{ background: `${accentColor}08` }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentColor }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text-primary)] text-sm">{botName}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{botSubtitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span className="text-xs text-[var(--color-text-muted)]">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${accentColor}15` }}
            >
              <Sparkles className="w-8 h-8" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)] mb-1">
                How can I help you today?
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Choose a suggested question or type your own.
              </p>
            </div>
            {suggestedPrompts.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(prompt)}
                    className="text-xs px-3 py-2 rounded-[10px] border border-[var(--color-border)] bg-white hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] text-[var(--color-text-secondary)] transition-all duration-150"
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
              'flex gap-3 animate-fade-in-up',
              msg.role === 'user' && 'flex-row-reverse'
            )}
          >
            {msg.role === 'assistant' ? (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: accentColor }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            ) : (
              <Avatar name="Chaman" size="sm" className="mt-1 flex-shrink-0" />
            )}
            <div
              className={clsx(
                'max-w-[75%] text-sm leading-relaxed',
                msg.role === 'user' ? 'chat-bubble-user px-4 py-2.5' : 'chat-bubble-bot px-4 py-2.5'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: accentColor }}
            >
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="chat-bubble-bot px-4 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts when there are messages */}
      {messages.length > 0 && suggestedPrompts.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {suggestedPrompts.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-[8px] border border-[var(--color-border)] bg-white hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-[var(--color-text-muted)] transition-all duration-150 flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-end gap-2 bg-[var(--color-muted)] rounded-[12px] p-1.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none resize-none px-2 py-1.5 max-h-32"
            style={{ lineHeight: '1.4' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all duration-150 flex-shrink-0 disabled:opacity-40"
            style={{ background: accentColor }}
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
