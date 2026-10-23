import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Calendar,
  BookOpen,
  Info,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, departmentService } from '../../services/chatService';

interface Message {
  id: string;
  sender: 'user' | 'nexus';
  text: string;
  timestamp: string;
  sources?: {
    syllabus: string[];
    dept: string[];
  };
}

const QUICK_PROMPTS = [
  '📅 Upcoming department events & symposium',
  '🌳 Explain BST traversal and search complexity',
  '📝 When is our CIE-1 internal exam schedule?',
  '🏛️ Who is the faculty for DBMS & office hours?',
  '🌴 Are there any upcoming holidays?',
  '💻 What is the normalization syllabus?',
];

export const NexusFloatingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'calendar-extract'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'nexus',
      text: 'Hello! I am Nexus, your official Department AI Assistant. I use verified Department Records and Syllabus Documents to provide factual guidance on courses, exams, schedules, and faculty hours. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calendar upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await chatService.sendNexusMessage(textToSend, historyPayload);

      const nexusReply: Message = {
        id: res.id,
        sender: 'nexus',
        text: res.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.sources,
      };

      setMessages(prev => [...prev, nexusReply]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'nexus',
          text: 'I encountered an error retrieving departmental context. Please try again or visit Room CS-401 for assistance.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const res = await departmentService.uploadCalendar(file);
      setUploadResult(res);
      // Also notify in chat
      setMessages(prev => [
        ...prev,
        {
          id: `upload_notice_${Date.now()}`,
          sender: 'nexus',
          text: `📄 Calendar processed via Gemini Vision! Extracted ${res.count || res.items?.length || 0} events/notices and updated official records in DeptInformation. You can now ask me questions about this schedule.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to extract calendar info');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* ── Floating Launcher Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-full border border-indigo-500/30 shadow-xl cursor-pointer hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-indigo-200">Ask Nexus</span>
            <span className="text-slate-400">· Dept AI Assistant</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(prev => !prev)}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center border border-white/20 hover:shadow-indigo-500/60 transition-all group"
          title="Nexus Department AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <Bot className="w-7 h-7 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </>
          )}
        </motion.button>
      </div>

      {/* ── Floating Chat & Extractor Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[430px] h-[580px] max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 px-5 py-4 border-b border-indigo-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base leading-none">Nexus</h3>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">
                      Dept AI
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/70 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    RAG Grounded · Official Records
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex border-b border-indigo-900/40 bg-slate-950/40 text-xs px-4 pt-2 gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`pb-2 font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'chat'
                    ? 'border-indigo-400 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Nexus Chat
              </button>
              <button
                onClick={() => setActiveTab('calendar-extract')}
                className={`pb-2 font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'calendar-extract'
                    ? 'border-indigo-400 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Vision Calendar Extractor
              </button>
            </div>

            {activeTab === 'chat' ? (
              <>
                {/* Notice banner */}
                <div className="bg-indigo-950/40 border-b border-indigo-900/40 px-4 py-2 flex items-center gap-2 text-[11px] text-indigo-200/80">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Answers strictly derived from Syllabus & Dept records. Code assistance provides conceptual steps.</span>
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'nexus' && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-800/80 border border-slate-700/60 text-slate-100 rounded-bl-none shadow-md'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {/* RAG sources tags if available */}
                        {msg.sources && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5 text-[10px]">
                            {msg.sources.syllabus.map((s, idx) => (
                              <span
                                key={`s_${idx}`}
                                className="px-2 py-0.5 rounded-md bg-indigo-900/50 text-indigo-200 border border-indigo-500/20 flex items-center gap-1"
                              >
                                <BookOpen className="w-2.5 h-2.5 text-indigo-300" />
                                {s}
                              </span>
                            ))}
                            {msg.sources.dept.map((d, idx) => (
                              <span
                                key={`d_${idx}`}
                                className="px-2 py-0.5 rounded-md bg-purple-900/50 text-purple-200 border border-purple-500/20 flex items-center gap-1"
                              >
                                <Calendar className="w-2.5 h-2.5 text-purple-300" />
                                {d}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-1 text-[9px] text-right opacity-60">{msg.timestamp}</div>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2.5 items-center">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
                      </div>
                      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-none p-3 text-xs text-indigo-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[11px] text-slate-300 ml-1">
                          Nexus is searching Syllabus & Dept Records...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Chips */}
                <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-[11px] whitespace-nowrap bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 hover:text-white px-2.5 py-1 rounded-full border border-indigo-800/50 transition-all flex items-center gap-1 flex-shrink-0"
                    >
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-slate-950/90 border-t border-indigo-950/80 flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Nexus about syllabus, exams, faculty, events..."
                    className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-md flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Calendar Extractor View (Gemini Vision) */
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    Gemini Vision Calendar Extractor
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload an image of a department notice, event flyer, or semester calendar.
                    Gemini Vision extracts events, holidays, and faculty info into <code>DeptInformation</code>.
                  </p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer bg-indigo-950/20 hover:bg-indigo-950/40 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 group-hover:bg-indigo-600/30 text-indigo-400 mx-auto flex items-center justify-center mb-2 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {isUploading ? 'Extracting with Gemini Vision...' : 'Click to select calendar image'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP (Max 10MB)</p>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadResult && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadResult.message || 'Extracted successfully!'}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Extracted Records ({uploadResult.items?.length || 0}):
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {uploadResult.items?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{item.title}</span>
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px]">{item.description}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(item.date).toLocaleDateString()} · Dept: {item.targetDept}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
