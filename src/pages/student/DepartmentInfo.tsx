import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChatWindow } from '../../components/chatbot/ChatWindow';
import { chatService } from '../../services/chatService';
import type { ChatMessage, Announcement, TimetableEntry, FacultyMember, DepartmentFAQ } from '../../types/department';
import api from '../../lib/apiClient';
import { departmentService } from '../../services/chatService';
import {
  Megaphone, Calendar, Clock, Users, HelpCircle, MessageSquare, Building2, Upload, Sparkles, CheckCircle2,
} from 'lucide-react';

const DEPT_SUGGESTED_PROMPTS = [
  'When is the next department event?',
  'When are the internal exams?',
  'Who teaches Database Management Systems?',
  "What is the syllabus for Trees in Data Structures?",
  'Where is the department office and faculty hours?',
  'Are there any upcoming holidays?',
];

const DEPT_INITIAL_MESSAGE: ChatMessage = {
  id: 'dept_init',
  role: 'assistant',
  content: 'Hello! I am Nexus, the official Department AI Assistant. I use verified Department Records and Syllabus Documents to provide factual guidance on courses, exams, schedules, and faculty hours. How can I assist you today?',
  timestamp: new Date().toISOString(),
  type: 'department',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DepartmentInfo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'announcements' | 'events' | 'timetable' | 'faculty' | 'faq' | 'chatbot'>('announcements');
  const [messages, setMessages] = useState<ChatMessage[]>([DEPT_INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [announcements] = useState<Announcement[]>([]);
  const [timetable] = useState<TimetableEntry[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [departmentFAQs] = useState<DepartmentFAQ[]>([]);

  useEffect(() => {
    api.get('/dept/info').then(res => {
      if (Array.isArray(res.data?.data)) {
        setEvents(res.data.data);
      }
    }).catch(() => {});

    // Fetch real faculty from assigned courses
    api.get('/courses').then(res => {
      if (Array.isArray(res.data)) {
        const facultyMap = new Map<string, FacultyMember>();
        res.data.forEach((course: any) => {
          (course.assignments || []).forEach((a: any) => {
            if (a.facultyId && a.facultyName) {
              if (!facultyMap.has(a.facultyId)) {
                facultyMap.set(a.facultyId, {
                  id: a.facultyId,
                  name: a.facultyName,
                  designation: 'Faculty Member',
                  department: course.departmentName || 'Computer Science',
                  subjects: [course.name],
                  email: a.facultyEmail || `${a.facultyName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
                  office: 'Academic Block',
                });
              } else {
                const existing = facultyMap.get(a.facultyId)!;
                if (!existing.subjects.includes(course.name)) {
                  existing.subjects.push(course.name);
                }
              }
            }
          });
        });
        setFacultyMembers(Array.from(facultyMap.values()));
      }
    }).catch(() => {});
  }, []);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      type: 'department',
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const response = await chatService.sendNexusMessage(text, messages);
      setMessages(prev => [
        ...prev,
        {
          id: response.id,
          role: 'assistant',
          content: response.content,
          timestamp: response.timestamp,
          type: 'department',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'faq', label: 'Dept FAQs', icon: HelpCircle },
    { id: 'chatbot', label: 'Ask Assistant', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Department Info"
        subtitle="Computer Science Department · Academic Portal"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Department Info' }]}
      />

      <div className="flex gap-2 flex-wrap">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-150 ${
              activeSection === item.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Announcements */}
      {activeSection === 'announcements' && (
        <div className="space-y-3">
          {announcements.length > 0 ? (
            announcements.map(ann => (
              <Card key={ann.id}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    ann.category === 'exam' ? 'bg-[var(--color-danger-light)]' :
                    ann.category === 'placement' ? 'bg-[var(--color-success-light)]' :
                    'bg-[var(--color-accent-light)]'
                  }`}>
                    <Megaphone className={`w-4 h-4 ${
                      ann.category === 'exam' ? 'text-[var(--color-danger)]' :
                      ann.category === 'placement' ? 'text-[var(--color-success)]' :
                      'text-[var(--color-accent)]'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {ann.isPinned && <Badge color="red" className="text-[10px]">📌 Pinned</Badge>}
                      <Badge color={ann.category === 'exam' ? 'red' : ann.category === 'placement' ? 'green' : 'indigo'} className="capitalize text-[10px]">
                        {ann.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{ann.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">{ann.content}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                      By {ann.postedBy} · {new Date(ann.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-[var(--color-border)] p-8">
              <Megaphone className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">No Announcements</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Official department announcements will be posted here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Events */}
      {activeSection === 'events' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.length > 0 ? (
            events.map(ev => (
              <Card key={ev.id}>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center ${
                    ev.type === 'EVENT' ? 'bg-[var(--color-accent-light)]' : 'bg-[var(--color-warning-light)]'
                  }`}>
                    <span className="text-lg font-black text-[var(--color-accent)]">{new Date(ev.date).getDate()}</span>
                    <span className="text-[10px] font-semibold uppercase text-[var(--color-text-muted)]">
                      {new Date(ev.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                  </div>
                  <div>
                    <Badge color={ev.type === 'EVENT' ? 'indigo' : 'amber'} className="capitalize text-[10px] mb-1">
                      {ev.type}
                    </Badge>
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{ev.title}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{ev.description}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[var(--color-border)] p-8">
              <Calendar className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">No Events Scheduled</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                No department events or holidays are currently on the calendar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Timetable */}
      {activeSection === 'timetable' && (
        <Card padding="none">
          {timetable.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Faculty</th>
                    <th>Room</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map(entry => (
                    <tr key={entry.id}>
                      <td><span className="font-medium text-[var(--color-text-primary)] text-sm">{entry.day}</span></td>
                      <td><span className="text-sm font-mono">{entry.startTime}–{entry.endTime}</span></td>
                      <td><span className="text-sm text-[var(--color-text-primary)]">{entry.courseName}</span></td>
                      <td><span className="text-sm text-[var(--color-text-secondary)]">{entry.facultyName}</span></td>
                      <td><span className="text-sm font-medium">{entry.room}</span></td>
                      <td>
                        <Badge color={entry.type === 'lab' ? 'amber' : entry.type === 'tutorial' ? 'green' : 'gray'} className="capitalize text-[10px]">
                          {entry.type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center p-8">
              <Clock className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Timetable Not Published</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                The weekly lecture and lab schedule for this semester is currently being finalized.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Faculty */}
      {activeSection === 'faculty' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyMembers.length > 0 ? (
            facultyMembers.map(faculty => (
              <Card key={faculty.id} hover>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-[var(--color-primary)]">
                      {faculty.name.split(' ').pop()?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{faculty.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{faculty.designation}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {faculty.subjects.map((s, i) => (
                        <Badge key={i} color="indigo" className="text-[10px]">{s.split(' ')[0]}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5">{faculty.office}</p>
                    <a href={`mailto:${faculty.email}`} className="text-xs text-[var(--color-accent)] hover:underline">{faculty.email}</a>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[var(--color-border)] p-8">
              <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">No Faculty Assigned</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Faculty members assigned to your department courses will be listed here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FAQs */}
      {activeSection === 'faq' && (
        <div className="space-y-3">
          {departmentFAQs.length > 0 ? (
            departmentFAQs.map(faq => (
              <Card key={faq.id}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[var(--color-accent-light)] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)] text-sm">{faq.question}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">{faq.answer}</p>
                    <Badge color="gray" className="text-[10px] mt-2">{faq.category}</Badge>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-[var(--color-border)] p-8">
              <HelpCircle className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">No FAQs Available</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Have questions? Ask Nexus in the "Ask Assistant" tab for instant guidance.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Department Chatbot */}
      {activeSection === 'chatbot' && (
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '480px' }}>
          <ChatWindow
            messages={messages}
            onSendMessage={handleSend}
            isLoading={isLoading}
            suggestedPrompts={DEPT_SUGGESTED_PROMPTS}
            type="department"
            botName="Nexus"
            botSubtitle="Official Department AI Assistant (RAG Grounded)"
          />
        </div>
      )}
    </div>
  );
};
