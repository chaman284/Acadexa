import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChatWindow } from '../../components/chatbot/ChatWindow';
import { chatService } from '../../services/chatService';
import api from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import type { ChatMessage, FacultyMember } from '../../types/department';
import {
  buildStudentSchedule,
  formatEventDateLabel,
  isUpcomingEvent,
  type BackendDeptEvent,
} from '../../utils/scheduleUtils';
import {
  departmentInfo,
  announcements,
  facultyMembers as initialFacultyMembers,
  departmentFAQs,
} from '../../data/collegeInfo';
import {
  sectionTimetables,
  sectionTimetableMetadata,
  sectionMatrixTimetables,
  type MatrixPeriodCell,
  type DayMatrixRow,
} from '../../data/timetables';
import {
  Megaphone,
  Calendar,
  Clock,
  Users,
  HelpCircle,
  MessageSquare,
  Building2,
  Mail,
  MapPin,
  Sparkles,
  Award,
  BookOpen,
  Filter,
  Search,
  RefreshCw,
  Phone,
  CheckCircle2,
  Lock,
  Layers,
  LayoutGrid,
  List,
  Info,
  Coffee,
  Utensils,
  X,
} from 'lucide-react';

const DEPT_SUGGESTED_PROMPTS = [
  'Who is the HOD and how can I contact them?',
  'What are the CIE dates for 3rd and 5th semester?',
  'When is Synergia 2026 taking place?',
  'What is the department vision and focus?',
  'When are the Semester End Theory and Practical exams?',
  'What are the Course Drop and Withdrawal deadlines?',
];

const DEPT_INITIAL_MESSAGE: ChatMessage = {
  id: 'dept_init',
  role: 'assistant',
  content:
    'Hello! I am the Acadexa Department Assistant for Artificial Intelligence & Machine Learning. I have the complete 2026–27 Academic Calendar, CIE/SEE exam schedules, faculty contacts, and department policies ready. How can I help you today?',
  timestamp: new Date().toISOString(),
  type: 'department',
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ALL_SECTIONS = ['3A', '3B', '3C', '5A', '5B', '5C'];

export const DepartmentInfo: React.FC = () => {
  const { user } = useAuth();

  // Student Section Resolution (Default to student's section, e.g. 5A or 3A)
  const studentSem = user?.student?.section?.semester || 5;

  const [activeSection, setActiveSection] = useState<'overview' | 'events' | 'faculty' | 'timetable' | 'announcements' | 'faq' | 'chatbot'>('overview');
  const [messages, setMessages] = useState<ChatMessage[]>([DEPT_INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Faculty State
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(initialFacultyMembers);
  const [isFetchingFaculty, setIsFetchingFaculty] = useState(false);

  // Events filter state — defaults to the logged-in student's semester + common events
  const [eventSemesterFilter, setEventSemesterFilter] = useState<'all' | '3' | '5' | 'general'>(
    String(studentSem) as '3' | '5'
  );
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'all' | 'exam' | 'deadline' | 'event' | 'holiday'>('all');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [backendEvents, setBackendEvents] = useState<BackendDeptEvent[]>([]);

  // FAQ search state
  const [faqSearch, setFaqSearch] = useState('');

  const studentSecName = (user?.student?.section?.name || 'A').toUpperCase();
  const studentSectionKey = `${studentSem}${studentSecName}`;

  // Timetable State: defaults directly to the logged-in student's section!
  const [selectedTimetableSection, setSelectedTimetableSection] = useState<string>(studentSectionKey);
  const [timetableDayFilter, setTimetableDayFilter] = useState<string>('all');
  const [showOtherSections, setShowOtherSections] = useState<boolean>(false);
  const [timetableViewMode, setTimetableViewMode] = useState<'matrix' | 'list'>('matrix');
  const [selectedPeriodCell, setSelectedPeriodCell] = useState<MatrixPeriodCell | null>(null);

  // Update selected section when user data loads or changes
  useEffect(() => {
    if (studentSectionKey && sectionTimetables[studentSectionKey]) {
      setSelectedTimetableSection(studentSectionKey);
    }
  }, [studentSectionKey]);

  // Fetch dynamic faculty from database whenever DepartmentInfo is loaded
  const fetchFacultyFromDB = async () => {
    setIsFetchingFaculty(true);
    try {
      const res = await api.get('/dept/faculty');
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setFacultyList(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch real-time faculty from backend, displaying default faculty roster:', err);
    } finally {
      setIsFetchingFaculty(false);
    }
  };

  useEffect(() => {
    fetchFacultyFromDB();
  }, []);

  // Live department events (admin/faculty additions) with periodic refresh.
  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        const res = await api.get('/dept/info');
        if (Array.isArray(res.data?.data) && !cancelled) {
          setBackendEvents(res.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch live department events, using academic calendar:', err);
      }
    };
    fetchEvents();
    const timer = window.setInterval(fetchEvents, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
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
      const response = await chatService.sendDepartmentMessage(text, messages);
      setMessages(prev => [...prev, response]);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Vision', icon: Building2 },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'events', label: 'Academic Calendar & Events', icon: Calendar },
    { id: 'faculty', label: 'Faculty Directory', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'faq', label: 'Dept FAQs', icon: HelpCircle },
    { id: 'chatbot', label: 'Ask Assistant', icon: MessageSquare },
  ];

  // Academic calendar + live backend additions, normalized and ordered by real date/time.
  const now = new Date();
  const allEvents = buildStudentSchedule(backendEvents, undefined, {
    upcomingOnly: false,
    now,
  });

  // Filtered Events — semester-aware, upcoming-only by default.
  const filteredEvents = allEvents.filter(ev => {
    if (eventSemesterFilter === '3' && ev.semester !== 3) return false;
    if (eventSemesterFilter === '5' && ev.semester !== 5) return false;
    if (eventSemesterFilter === 'general' && ev.semester !== undefined) return false;
    if (eventCategoryFilter !== 'all' && ev.category !== eventCategoryFilter) return false;
    if (!showPastEvents && !isUpcomingEvent(ev, now)) return false;
    return true;
  });

  // Filtered FAQs
  const filteredFaqs = departmentFAQs.filter(
    faq =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Current Timetable Details
  const currentTimetableMeta =
    sectionTimetableMetadata[selectedTimetableSection] ||
    sectionTimetableMetadata['5A'];

  const currentSectionEntries =
    sectionTimetables[selectedTimetableSection] ||
    sectionTimetables['5A'] ||
    [];

  const filteredTimetableEntries = currentSectionEntries.filter(entry => {
    if (timetableDayFilter === 'all') return true;
    return entry.day.toLowerCase() === timetableDayFilter.toLowerCase();
  });

  // Current Matrix Rows for authentic Box & Table Format
  const currentMatrixRows: DayMatrixRow[] =
    sectionMatrixTimetables[selectedTimetableSection] ||
    sectionMatrixTimetables['5A'] ||
    [];

  const filteredMatrixRows = currentMatrixRows.filter(row => {
    if (timetableDayFilter === 'all') return true;
    return row.dayFull.toLowerCase() === timetableDayFilter.toLowerCase();
  });

  const isAssignedSection = selectedTimetableSection === studentSectionKey;

  const getPeriodBoxStyle = (type: MatrixPeriodCell['type']) => {
    switch (type) {
      case 'theory':
        return {
          wrapper: 'bg-sky-50/90 border-sky-200 text-sky-950 hover:border-sky-400 hover:shadow-xs',
          badge: 'bg-sky-200 text-sky-900',
          label: 'THEORY',
        };
      case 'lab':
        return {
          wrapper: 'bg-emerald-50/90 border-emerald-200 text-emerald-950 hover:border-emerald-400 hover:shadow-xs',
          badge: 'bg-emerald-200 text-emerald-900',
          label: 'LAB',
        };
      case 'skill':
        return {
          wrapper: 'bg-purple-50/90 border-purple-200 text-purple-950 hover:border-purple-400 hover:shadow-xs',
          badge: 'bg-purple-200 text-purple-900',
          label: 'SKILL LAB',
        };
      case 'project':
        return {
          wrapper: 'bg-amber-50/90 border-amber-200 text-amber-950 hover:border-amber-400 hover:shadow-xs',
          badge: 'bg-amber-200 text-amber-900',
          label: 'PROJECT',
        };
      case 'tutorial':
        return {
          wrapper: 'bg-indigo-50/90 border-indigo-200 text-indigo-950 hover:border-indigo-400 hover:shadow-xs',
          badge: 'bg-indigo-200 text-indigo-900',
          label: 'TUTORIAL',
        };
      case 'remedial':
        return {
          wrapper: 'bg-rose-50/90 border-rose-200 text-rose-950 hover:border-rose-400 hover:shadow-xs',
          badge: 'bg-rose-200 text-rose-900',
          label: 'REMEDIAL',
        };
      case 'mentoring':
        return {
          wrapper: 'bg-teal-50/90 border-teal-200 text-teal-950 hover:border-teal-400 hover:shadow-xs',
          badge: 'bg-teal-200 text-teal-900',
          label: 'MENTORING',
        };
      case 'empty':
      default:
        return {
          wrapper: 'bg-gray-50/50 border-dashed border-gray-200 text-gray-400',
          badge: 'bg-gray-100 text-gray-400',
          label: 'FREE',
        };
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'oxblood';
      case 'lab': return 'amber';
      case 'tutorial': return 'purple';
      case 'project': return 'forest';
      case 'skill': return 'rose';
      case 'remedial': return 'gray';
      case 'mentoring': return 'sage';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Department Info"
        subtitle="Department of Artificial Intelligence and Machine Learning · Sahyadri College of Engineering & Management"
        breadcrumbs={[{ label: 'Student Portal' }, { label: 'Department Info' }]}
      />

      {/* Navigation Pills */}
      <div className="flex gap-2 flex-wrap">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
              activeSection === item.id
                ? 'bg-oxblood text-white shadow-btn'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-oxblood hover:text-oxblood'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW & VISION SECTION */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="bg-gradient-to-br from-oxblood via-[#55101b] to-[#3a0911] text-white rounded-2xl p-6 md:p-8 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-rose-200 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {departmentInfo.college} · Academic Year {departmentInfo.academicYear}
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
                Department of {departmentInfo.name}
              </h2>
              <p className="text-rose-100/90 text-sm md:text-base leading-relaxed max-w-4xl">
                {departmentInfo.overview}
              </p>
            </div>
          </div>

          {/* Vision & HOD Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Vision Card */}
            <div className="md:col-span-2">
              <Card className="h-full bg-white border border-[var(--color-border)] shadow-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-oxblood">
                    <Award className="w-5 h-5 text-oxblood" />
                    <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">Department Vision</h3>
                  </div>
                  <blockquote className="border-l-4 border-oxblood pl-4 italic text-sm md:text-base text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-bg-subtle)] p-3 rounded-r-xl font-medium">
                    "{departmentInfo.vision}"
                  </blockquote>
                  <div className="pt-2 text-xs text-[var(--color-text-muted)] space-y-1.5">
                    <p className="font-semibold text-[var(--color-text-secondary)]">Core Specialization Focus Areas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Data Analytics', 'Predictive Modelling', 'Ethical AI'].map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-forest/10 text-forest text-[11px] font-medium rounded-lg border border-forest/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* HOD Card */}
            <div className="md:col-span-1">
              <Card className="h-full bg-gradient-to-b from-[#FAF7F2] to-white border border-oxblood/20 shadow-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-oxblood text-white">
                      Department Head
                    </span>
                    <Building2 className="w-4 h-4 text-oxblood" />
                  </div>

                  <div className="pt-1">
                    <h4 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                      {departmentInfo.hod.name}
                    </h4>
                    <p className="text-xs font-semibold text-oxblood">{departmentInfo.hod.designation}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{departmentInfo.name}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-oxblood flex-shrink-0" />
                      <a href={`mailto:${departmentInfo.hod.email}`} className="text-oxblood font-medium hover:underline truncate">
                        {departmentInfo.hod.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-oxblood flex-shrink-0" />
                      <span>{departmentInfo.hod.office}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-oxblood flex-shrink-0" />
                      <span>{departmentInfo.hod.contact}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Links & Calendar Highlights */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div
              onClick={() => {
                setActiveSection('timetable');
              }}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-white hover:border-oxblood hover:shadow-card cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-oxblood">Class Timetable</span>
                <Clock className="w-4 h-4 text-oxblood" />
              </div>
              <h5 className="font-semibold text-sm text-[var(--color-text-primary)]">
                Section {studentSectionKey} Weekly Schedule
              </h5>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Personalized class timetable for your assigned section
              </p>
            </div>

            <div
              onClick={() => {
                setActiveSection('events');
                setEventSemesterFilter(String(studentSem) as any);
              }}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-white hover:border-oxblood hover:shadow-card cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest">Semester {studentSem}</span>
                <Calendar className="w-4 h-4 text-forest" />
              </div>
              <h5 className="font-semibold text-sm text-[var(--color-text-primary)]">Academic Calendar</h5>
              <p className="text-xs text-[var(--color-text-secondary)]">CIEs, placement bootcamp & SEE dates</p>
            </div>

            <div
              onClick={() => setActiveSection('faculty')}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-white hover:border-oxblood hover:shadow-card cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600">Directory</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <h5 className="font-semibold text-sm text-[var(--color-text-primary)]">Live Faculty Roster</h5>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {facultyList.length} verified faculty members in database
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TIMETABLE SECTION — Personalized by Enrolled Section */}
      {activeSection === 'timetable' && (
        <div className="space-y-4">
          {/* Header Banner & Section Switcher */}
          <div className="p-5 bg-white rounded-2xl border border-[var(--color-border)] shadow-card space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-oxblood text-white">
                    Semester {currentTimetableMeta.semester} — Section {currentTimetableMeta.section}
                  </span>
                  {isAssignedSection && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest/15 text-forest border border-forest/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Your Assigned Section
                    </span>
                  )}
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">
                    Effective From: {currentTimetableMeta.effectiveFrom}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg md:text-xl text-[var(--color-text-primary)]">
                  Department of Computer Science & Engineering (AI&ML)
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-3 flex-wrap">
                  <span><strong>Room No:</strong> {currentTimetableMeta.roomNo}</span>
                  <span>•</span>
                  <span><strong>Mode:</strong> Offline Mode</span>
                  <span>•</span>
                  <span><strong>Faculty Class Coordinator:</strong> {currentTimetableMeta.coordinator}</span>
                </p>
              </div>

              {/* View Toggle + Switch Section */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)]">
                  <button
                    onClick={() => setTimetableViewMode('matrix')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      timetableViewMode === 'matrix'
                        ? 'bg-oxblood text-white shadow-xs'
                        : 'text-[var(--color-text-secondary)] hover:text-oxblood'
                    }`}
                    title="Authentic Box & Table Weekly Matrix"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Box & Table Grid</span>
                  </button>
                  <button
                    onClick={() => setTimetableViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      timetableViewMode === 'list'
                        ? 'bg-oxblood text-white shadow-xs'
                        : 'text-[var(--color-text-secondary)] hover:text-oxblood'
                    }`}
                    title="Sequential Agenda List"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>List View</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowOtherSections(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-oxblood hover:text-oxblood transition-colors cursor-pointer bg-white"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showOtherSections ? 'Hide Switcher' : 'Switch Section'}</span>
                </button>
              </div>
            </div>

            {/* Section Switcher Pills (shown when toggled, defaults to showing only student's section) */}
            {showOtherSections && (
              <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>Choose Section Timetable:</span>
                  <span>Your Assigned Section: <strong>{studentSectionKey}</strong></span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {ALL_SECTIONS.map(secKey => {
                    const isStudentSec = secKey === studentSectionKey;
                    const isCurrent = secKey === selectedTimetableSection;

                    return (
                      <button
                        key={secKey}
                        onClick={() => setSelectedTimetableSection(secKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-oxblood text-white shadow-btn'
                            : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-oxblood/10 hover:text-oxblood border border-[var(--color-border)]'
                        }`}
                      >
                        <span>Section {secKey}</span>
                        {isStudentSec && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isCurrent ? 'bg-white/20 text-white' : 'bg-forest/15 text-forest'}`}>
                            You
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Day Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Day:
            </span>
            <button
              onClick={() => setTimetableDayFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                timetableDayFilter === 'all'
                  ? 'bg-oxblood text-white'
                  : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-oxblood'
              }`}
            >
              All Days (Mon–Sat)
            </button>
            {DAYS_OF_WEEK.map(d => (
              <button
                key={d}
                onClick={() => setTimetableDayFilter(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  timetableDayFilter.toLowerCase() === d.toLowerCase()
                    ? 'bg-oxblood text-white'
                    : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-oxblood'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Timetable Display: Authentic Box & Table Matrix (Default) or Sequential List */}
          {timetableViewMode === 'matrix' ? (
            <Card padding="none" className="overflow-hidden shadow-card border border-[var(--color-border)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[1040px]">
                  <thead>
                    <tr className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-3 w-24 text-center border-r border-[var(--color-border)] bg-gray-100/70 text-[var(--color-text-primary)]">
                        DAY
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px] border-r border-[var(--color-border)]/60">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 1</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">8:30 – 9:30</div>
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px] border-r border-[var(--color-border)]/60">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 2</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">9:30 – 10:30</div>
                      </th>
                      <th className="py-2 px-1 text-center w-11 min-w-[44px] bg-amber-100/60 text-amber-900 border-r border-amber-300">
                        <div className="text-[9px] font-black uppercase">TEA</div>
                        <div className="text-[8px] font-mono text-amber-700">10:30–10:45</div>
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px] border-r border-[var(--color-border)]/60">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 3</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">10:45 – 11:45</div>
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px] border-r border-[var(--color-border)]/60">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 4</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">11:45 – 12:45</div>
                      </th>
                      <th className="py-2 px-1 text-center w-11 min-w-[44px] bg-orange-100/60 text-orange-900 border-r border-orange-300">
                        <div className="text-[9px] font-black uppercase">LUNCH</div>
                        <div className="text-[8px] font-mono text-orange-700">12:45–1:30</div>
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px] border-r border-[var(--color-border)]/60">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 5</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">1:30 – 2:30</div>
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px] border-r border-[var(--color-border)]/60">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 6</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">2:30 – 3:30</div>
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px] border-r border-[var(--color-border)]/60">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 7</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">3:30 – 4:30</div>
                      </th>
                      <th className="py-2.5 px-2 text-center min-w-[115px]">
                        <div className="font-bold text-[var(--color-text-primary)]">PERIOD 8</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">4:30 – 5:30</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredMatrixRows.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-8 text-sm text-[var(--color-text-muted)]">
                          No classes scheduled for the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredMatrixRows.map(dayRow => (
                        <tr key={dayRow.day} className="hover:bg-gray-50/40 transition-colors">
                          {/* Day Column */}
                          <td className="py-3 px-3 text-center align-middle font-black bg-gray-50/90 border-r border-[var(--color-border)]">
                            <div className="text-oxblood font-serif text-base">{dayRow.day}</div>
                            <div className="text-[10px] font-sans font-medium text-[var(--color-text-muted)]">{dayRow.dayFull}</div>
                          </td>

                          {/* Slots Before Tea */}
                          {dayRow.slotsBeforeTea.map((slot, sIdx) => {
                            const style = getPeriodBoxStyle(slot.type);
                            const isEmpty = slot.type === 'empty' || slot.code === '—';

                            return (
                              <td
                                key={`tea-${sIdx}`}
                                colSpan={slot.colSpan || 1}
                                className="p-1.5 align-middle border-r border-[var(--color-border)]/50"
                              >
                                {isEmpty ? (
                                  <div className="h-full min-h-[74px] rounded-xl border border-dashed border-gray-200 bg-gray-50/40 p-2 flex items-center justify-center text-xs text-gray-400 font-medium">
                                    <span>— Free —</span>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => setSelectedPeriodCell(slot)}
                                    className={`h-full min-h-[74px] rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer text-left select-none ${style.wrapper}`}
                                    title={`${slot.code} · ${slot.subjectName || ''} (${slot.time}) - Click to inspect`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-mono text-xs font-bold leading-tight truncate">
                                          {slot.code}
                                        </span>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex-shrink-0 ${style.badge}`}>
                                          {style.label}
                                        </span>
                                      </div>
                                      {slot.subjectName && (
                                        <p className="text-[11px] font-medium leading-snug line-clamp-1 opacity-90">
                                          {slot.subjectName}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t border-black/5 opacity-80">
                                      <span className="truncate font-semibold">{slot.faculty || 'Faculty'}</span>
                                      <span className="font-mono flex-shrink-0 ml-1 text-[9px]">{slot.time}</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          {/* Tea Break Cell */}
                          <td className="bg-amber-50/60 border-r border-amber-300 p-1 text-center align-middle select-none">
                            <div className="flex flex-col items-center justify-center gap-0.5 text-amber-800">
                              <Coffee className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[9px] font-extrabold uppercase tracking-tight">Tea</span>
                            </div>
                          </td>

                          {/* Slots Before Lunch */}
                          {dayRow.slotsBeforeLunch.map((slot, sIdx) => {
                            const style = getPeriodBoxStyle(slot.type);
                            const isEmpty = slot.type === 'empty' || slot.code === '—';

                            return (
                              <td
                                key={`lunch-${sIdx}`}
                                colSpan={slot.colSpan || 1}
                                className="p-1.5 align-middle border-r border-[var(--color-border)]/50"
                              >
                                {isEmpty ? (
                                  <div className="h-full min-h-[74px] rounded-xl border border-dashed border-gray-200 bg-gray-50/40 p-2 flex items-center justify-center text-xs text-gray-400 font-medium">
                                    <span>— Free —</span>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => setSelectedPeriodCell(slot)}
                                    className={`h-full min-h-[74px] rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer text-left select-none ${style.wrapper}`}
                                    title={`${slot.code} · ${slot.subjectName || ''} (${slot.time}) - Click to inspect`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-mono text-xs font-bold leading-tight truncate">
                                          {slot.code}
                                        </span>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex-shrink-0 ${style.badge}`}>
                                          {style.label}
                                        </span>
                                      </div>
                                      {slot.subjectName && (
                                        <p className="text-[11px] font-medium leading-snug line-clamp-1 opacity-90">
                                          {slot.subjectName}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t border-black/5 opacity-80">
                                      <span className="truncate font-semibold">{slot.faculty || 'Faculty'}</span>
                                      <span className="font-mono flex-shrink-0 ml-1 text-[9px]">{slot.time}</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          {/* Lunch Break Cell */}
                          <td className="bg-orange-50/60 border-r border-orange-300 p-1 text-center align-middle select-none">
                            <div className="flex flex-col items-center justify-center gap-0.5 text-orange-800">
                              <Utensils className="w-3.5 h-3.5 text-orange-600" />
                              <span className="text-[9px] font-extrabold uppercase tracking-tight">Lunch</span>
                            </div>
                          </td>

                          {/* Slots After Lunch */}
                          {dayRow.slotsAfterLunch.map((slot, sIdx) => {
                            const style = getPeriodBoxStyle(slot.type);
                            const isEmpty = slot.type === 'empty' || slot.code === '—';

                            return (
                              <td
                                key={`after-${sIdx}`}
                                colSpan={slot.colSpan || 1}
                                className="p-1.5 align-middle border-r border-[var(--color-border)]/50 last:border-r-0"
                              >
                                {isEmpty ? (
                                  <div className="h-full min-h-[74px] rounded-xl border border-dashed border-gray-200 bg-gray-50/40 p-2 flex items-center justify-center text-xs text-gray-400 font-medium">
                                    <span>— Free —</span>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => setSelectedPeriodCell(slot)}
                                    className={`h-full min-h-[74px] rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer text-left select-none ${style.wrapper}`}
                                    title={`${slot.code} · ${slot.subjectName || ''} (${slot.time}) - Click to inspect`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-mono text-xs font-bold leading-tight truncate">
                                          {slot.code}
                                        </span>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex-shrink-0 ${style.badge}`}>
                                          {style.label}
                                        </span>
                                      </div>
                                      {slot.subjectName && (
                                        <p className="text-[11px] font-medium leading-snug line-clamp-1 opacity-90">
                                          {slot.subjectName}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t border-black/5 opacity-80">
                                      <span className="truncate font-semibold">{slot.faculty || 'Faculty'}</span>
                                      <span className="font-mono flex-shrink-0 ml-1 text-[9px]">{slot.time}</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Color Legend Bar */}
              <div className="bg-gray-50/80 border-t border-[var(--color-border)] p-3 flex items-center justify-between gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-[var(--color-text-secondary)]">Slot Legend:</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-sky-200 border border-sky-300"></span>
                    <span className="text-sky-950 font-medium">Theory Class</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300"></span>
                    <span className="text-emerald-950 font-medium">Laboratory</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-purple-200 border border-purple-300"></span>
                    <span className="text-purple-950 font-medium">Skill Lab / Practice</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-200 border border-amber-300"></span>
                    <span className="text-amber-950 font-medium">Mini-Project</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-indigo-200 border border-indigo-300"></span>
                    <span className="text-indigo-950 font-medium">Tutorial</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-200 border border-rose-300"></span>
                    <span className="text-rose-950 font-medium">Remedial</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-teal-200 border border-teal-300"></span>
                    <span className="text-teal-950 font-medium">Mentoring</span>
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)] italic">
                  * Click any box cell to view complete course & faculty info
                </span>
              </div>
            </Card>
          ) : (
            /* Agenda List View */
            <Card padding="none" className="overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Faculty In-Charge</th>
                      <th>Room / Lab</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimetableEntries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-sm text-[var(--color-text-muted)]">
                          No classes scheduled for the selected day filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTimetableEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-[var(--color-bg-subtle)]/60 transition-colors">
                          <td>
                            <span className="font-semibold text-[var(--color-text-primary)] text-sm">{entry.day}</span>
                          </td>
                          <td>
                            <span className="text-xs font-mono font-medium text-[var(--color-text-secondary)] bg-gray-100 px-2 py-0.5 rounded">
                              {entry.startTime} – {entry.endTime}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs font-bold text-oxblood">{entry.courseId}</span>
                          </td>
                          <td>
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">{entry.courseName}</span>
                          </td>
                          <td>
                            <span className="text-xs text-[var(--color-text-secondary)]">{entry.facultyName}</span>
                          </td>
                          <td>
                            <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {entry.room}
                            </span>
                          </td>
                          <td>
                            <Badge color={getTypeBadgeColor(entry.type)} className="capitalize text-[10px]">
                              {entry.type}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Active Period Details Modal */}
          {selectedPeriodCell && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
              <div className="bg-white rounded-2xl shadow-modal border border-[var(--color-border)] max-w-md w-full p-5 space-y-4 animate-scale-up">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-oxblood/10 text-oxblood">
                      {selectedPeriodCell.type} session
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mt-1.5">
                      {selectedPeriodCell.subjectName || selectedPeriodCell.code}
                    </h3>
                    <p className="font-mono text-xs text-oxblood font-semibold">
                      {selectedPeriodCell.subjectCode || selectedPeriodCell.code}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPeriodCell(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border)] text-xs">
                  <div className="bg-[var(--color-bg-subtle)] p-2.5 rounded-xl">
                    <span className="text-[var(--color-text-muted)] block text-[10px] uppercase font-bold">Time Slot</span>
                    <span className="font-mono font-semibold text-[var(--color-text-primary)]">{selectedPeriodCell.time}</span>
                  </div>
                  <div className="bg-[var(--color-bg-subtle)] p-2.5 rounded-xl">
                    <span className="text-[var(--color-text-muted)] block text-[10px] uppercase font-bold">Class / Lab Room</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{currentTimetableMeta.roomNo}</span>
                  </div>
                  <div className="col-span-2 bg-[var(--color-bg-subtle)] p-2.5 rounded-xl">
                    <span className="text-[var(--color-text-muted)] block text-[10px] uppercase font-bold">Faculty In-Charge</span>
                    <span className="font-semibold text-[var(--color-text-primary)] text-sm">{selectedPeriodCell.faculty || 'Department Faculty'}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedPeriodCell(null)}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section Course & Faculty Directory Reference */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                  Section {selectedTimetableSection} Registered Courses & Faculty Details
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Subject codes, weekly contact hours, and faculty allocations as per official department schedule
                </p>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">
                Coordinator: <strong>{currentTimetableMeta.coordinator}</strong>
              </span>
            </div>

            <Card padding="none" className="overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-32">Course Code</th>
                      <th>Course Name</th>
                      <th className="w-36 text-center">Contact Hours / Wk</th>
                      <th>Faculty In-Charge (Initial)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTimetableMeta.courses.map((c, idx) => (
                      <tr key={idx} className="hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                        <td>
                          <span className="font-mono text-xs font-bold text-oxblood">{c.code}</span>
                        </td>
                        <td>
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{c.name}</span>
                        </td>
                        <td className="text-center">
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {c.contactHours}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-[var(--color-text-secondary)]">{c.faculty}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ACADEMIC CALENDAR & EVENTS SECTION */}
      {activeSection === 'events' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Semester:
              </span>
              {(['all', '3', '5', 'general'] as const).map(sem => (
                <button
                  key={sem}
                  onClick={() => setEventSemesterFilter(sem)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    eventSemesterFilter === sem
                      ? 'bg-oxblood text-white'
                      : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-oxblood/10 hover:text-oxblood'
                  }`}
                >
                  {sem === 'all'
                    ? 'All Semesters'
                    : sem === 'general'
                    ? 'Campus & Fests (All)'
                    : sem === String(studentSem)
                    ? `My Semester (${sem})`
                    : `Semester ${sem}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Category:</span>
              {(['all', 'exam', 'deadline', 'event', 'holiday'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setEventCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                    eventCategoryFilter === cat
                      ? 'bg-forest text-white'
                      : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-forest/10 hover:text-forest'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Events Count summary */}
          <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-[var(--color-text-muted)] px-1">
            <span>
              Showing {filteredEvents.length} {showPastEvents ? '' : 'upcoming '}events
              {eventSemesterFilter === 'general'
                ? ' common to all semesters'
                : eventSemesterFilter === 'all'
                ? ' across all semesters'
                : ` for semester ${eventSemesterFilter} + campus events`}
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={showPastEvents}
                onChange={e => setShowPastEvents(e.target.checked)}
                className="accent-oxblood cursor-pointer"
              />
              Show past events
            </label>
          </div>

          {/* Events Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredEvents.map(ev => {
              const [year, month, day] = ev.date.split('-').map(Number);
              const startDate = new Date(year, (month || 1) - 1, day || 1);
              const dayNum = startDate.getDate();
              const monthStr = startDate.toLocaleDateString('en-IN', { month: 'short' });
              const dateLabel = formatEventDateLabel(ev, now);

              return (
                <Card key={ev.id} className="hover:shadow-card-hover transition-all">
                  <div className="flex items-start gap-3.5">
                    {/* Date Block */}
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center ${
                        ev.category === 'exam'
                          ? 'bg-rose-100 text-rose-700'
                          : ev.category === 'deadline'
                          ? 'bg-amber-100 text-amber-800'
                          : ev.category === 'holiday'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-oxblood/10 text-oxblood'
                      }`}
                    >
                      <span className="text-xl font-black leading-none">{dayNum}</span>
                      <span className="text-[10px] font-bold uppercase mt-0.5 tracking-wider">{monthStr}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {(dateLabel === 'Today' || dateLabel === 'Tomorrow') && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-oxblood text-white">
                            {dateLabel}
                          </span>
                        )}
                        {ev.semester && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                            Sem {ev.semester}
                          </span>
                        )}
                        {!ev.semester && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
                            All Semesters
                          </span>
                        )}
                        <Badge
                          color={
                            ev.category === 'exam'
                              ? 'red'
                              : ev.category === 'deadline'
                              ? 'amber'
                              : ev.category === 'holiday'
                              ? 'green'
                              : 'oxblood'
                          }
                          className="capitalize text-[10px]"
                        >
                          {ev.category}
                        </Badge>
                        {ev.endDate && ev.endDate !== ev.date && (
                          <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                            thru {formatEventDateLabel({ date: ev.endDate, endDate: ev.endDate }, now)}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-2 flex-wrap">
                        <span>{ev.time}</span>
                        {ev.location && (
                          <>
                            <span>·</span>
                            <span>{ev.location}</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* DYNAMIC FACULTY DIRECTORY */}
      {activeSection === 'faculty' && (
        <div className="space-y-4">
          {/* Header & Refresh */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[var(--color-border)]">
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                Registered AIML Faculty Directory
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Directly connected to database — all newly added faculty members reflect immediately
              </p>
            </div>
            <button
              onClick={fetchFacultyFromDB}
              disabled={isFetchingFaculty}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-oxblood hover:text-oxblood transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFaculty ? 'animate-spin text-oxblood' : ''}`} />
              <span>{isFetchingFaculty ? 'Syncing...' : 'Sync Faculty'}</span>
            </button>
          </div>

          {/* Faculty Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyList.map(faculty => {
              const isHod = faculty.isHod;
              const initials = faculty.name
                .split(' ')
                .filter(Boolean)
                .map(n => n[0])
                .slice(-2)
                .join('')
                .toUpperCase();

              return (
                <Card
                  key={faculty.id}
                  hover
                  className={`transition-all ${
                    isHod ? 'border-2 border-oxblood/30 bg-gradient-to-b from-[#FFFDF9] to-white shadow-card' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                        isHod
                          ? 'bg-oxblood text-white shadow-md'
                          : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      }`}
                    >
                      <span className="text-base">{initials || 'FC'}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-[var(--color-text-primary)] text-sm truncate">
                          {faculty.name}
                        </h4>
                        {isHod && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-oxblood text-white">
                            HOD
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-oxblood mt-0.5">{faculty.designation}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{faculty.department}</p>

                      {/* Subjects */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {faculty.subjects && faculty.subjects.length > 0 ? (
                          faculty.subjects.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400">Core AI & Data Science</span>
                        )}
                      </div>

                      {/* Contact & Cabin */}
                      <div className="mt-2.5 pt-2 border-t border-[var(--color-border)] space-y-1 text-xs">
                        {faculty.office && (
                          <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
                            <span>{faculty.office}</span>
                          </p>
                        )}
                        <a
                          href={`mailto:${faculty.email}`}
                          className="text-xs text-oxblood hover:underline flex items-center gap-1 truncate font-medium"
                        >
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{faculty.email}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS SECTION */}
      {activeSection === 'announcements' && (
        <div className="space-y-3">
          {announcements.map(ann => (
            <Card key={ann.id} className="shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ann.category === 'exam'
                      ? 'bg-danger/10 text-danger'
                      : ann.category === 'placement'
                      ? 'bg-forest/10 text-forest'
                      : 'bg-oxblood/10 text-oxblood'
                  }`}
                >
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {ann.isPinned && <Badge color="red" className="text-[10px]">📌 Pinned</Badge>}
                    <Badge
                      color={ann.category === 'exam' ? 'red' : ann.category === 'placement' ? 'green' : 'oxblood'}
                      className="capitalize text-[10px]"
                    >
                      {ann.category}
                    </Badge>
                  </div>
                  <h3 className="font-serif font-bold text-[var(--color-text-primary)] text-base">{ann.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">{ann.content}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    By {ann.postedBy} ·{' '}
                    {new Date(ann.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DEPARTMENT FAQS SECTION */}
      {activeSection === 'faq' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FAQs by question, topic, HOD, CIE, SEE, or Synergia..."
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-oxblood"
            />
          </div>

          <div className="space-y-3">
            {filteredFaqs.map(faq => (
              <Card key={faq.id} className="hover:shadow-card transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-oxblood/10 text-oxblood rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4 text-oxblood" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-text-primary)] text-sm">{faq.question}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                      {faq.category}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENT CHATBOT SECTION */}
      {activeSection === 'chatbot' && (
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '480px' }}>
          <ChatWindow
            messages={messages}
            onSendMessage={handleSend}
            isLoading={isLoading}
            suggestedPrompts={DEPT_SUGGESTED_PROMPTS}
            type="department"
            botName="Department AI Assistant"
            botSubtitle="Ask about 3rd & 5th sem dates, CIE/SEE exams, HOD contact, and department policies"
          />
        </div>
      )}
    </div>
  );
};
