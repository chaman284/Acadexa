import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChatWindow } from '../../components/chatbot/ChatWindow';
import { chatService } from '../../services/chatService';
import type { ChatMessage } from '../../types/department';

const SUGGESTED_PROMPTS = [
  'Explain normalization with examples',
  'Give me 3 questions on Binary Trees',
  'Explain my Trees quiz mistake',
  'Help me prepare for tomorrow\'s quiz',
  'What is the difference between BFS and DFS?',
  'Explain paging vs segmentation',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: 'Hello! I\'m your AI Academic Tutor. I can help you understand concepts, clarify doubts from your quizzes, and suggest practice questions based on your learning gaps. What would you like to explore today?',
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

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
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
