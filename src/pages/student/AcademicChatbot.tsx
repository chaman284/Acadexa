import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChatWindow } from '../../components/chatbot/ChatWindow';
import { chatService } from '../../services/chatService';
import type { ChatMessage } from '../../types/department';

const SUGGESTED_PROMPTS = [
  'Explain the core concept and intuition behind this topic',
  'How do I analyze the time and space complexity?',
  'Give me 3 practice questions with step-by-step explanations',
  'Help me prepare and review for an upcoming quiz',
  'What is the difference between these two algorithmic approaches?',
  'Give me an intuitive real-world analogy to understand this',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: 'Hello! I\'m your AI Academic Tutor. I can help you understand concepts, clarify doubts from your quizzes, and suggest practice questions. What would you like to explore today?',
  timestamp: new Date().toISOString(),
  type: 'tutor',
};

export const AcademicChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      type: 'tutor',
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await chatService.sendTutorMessage(text, messages);
      setMessages(prev => [...prev, response]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up h-full">
      <PageHeader
        title="AI Academic Tutor"
        subtitle="Ask questions, get explanations, and explore topics interactively"
        breadcrumbs={[{ label: 'Overview' }, { label: 'AI Tutor' }]}
      />

      <div
        className="bg-white rounded-[14px] border border-[#E1D4CA] overflow-hidden shadow-xs"
        style={{ height: 'calc(100vh - 220px)', minHeight: '520px' }}
      >
        <ChatWindow
          messages={messages}
          onSendMessage={handleSend}
          isLoading={isLoading}
          suggestedPrompts={SUGGESTED_PROMPTS}
          type="tutor"
          botName="Academic Tutor"
          botSubtitle="Powered by Acadexa AI · Based on your curriculum"
        />
      </div>
    </div>
  );
};
