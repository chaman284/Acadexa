import type { DepartmentEvent, Announcement, TimetableEntry, FacultyMember, DepartmentFAQ } from '../types/department';

export const departmentEvents: DepartmentEvent[] = [
  { id: 'ev1', title: 'Internal Assessment — Batch A', description: 'First internal examination for 5th semester batch A', date: '2026-10-15', time: '09:00 AM', location: 'Examination Hall 1', category: 'exam' },
  { id: 'ev2', title: 'CS Department Symposium', description: 'Annual technical symposium featuring student project presentations', date: '2026-10-22', time: '10:00 AM', location: 'Seminar Hall', category: 'event' },
  { id: 'ev3', title: 'Campus Recruitment Drive — Infosys', description: 'On-campus placement drive for eligible final year students', date: '2026-11-02', time: '08:30 AM', location: 'Main Auditorium', category: 'event' },
  { id: 'ev4', title: 'Project Submission Deadline', description: 'Last date for mini project submission (5th Semester)', date: '2026-10-30', time: '05:00 PM', location: 'Department Office', category: 'deadline' },
];

export const announcements: Announcement[] = [
  { id: 'an1', title: 'Internal Exam Schedule Released', content: 'The internal examination schedule for October 2026 has been published. Please check the department notice board for your respective subjects and timings.', postedBy: 'Department Office', postedAt: '2026-10-01T09:00:00Z', isPinned: true, category: 'exam' },
  { id: 'an2', title: 'Library Extended Hours', content: 'The college library will remain open until 9:00 PM during the examination period (Oct 12–22). Students are encouraged to utilize the digital resources section.', postedBy: 'Library Committee', postedAt: '2026-09-28T11:00:00Z', isPinned: false, category: 'general' },
  { id: 'an3', title: 'TCS NQT Registration Open', content: 'TCS National Qualifier Test (NQT) registration is now open for 2026 batch students. Register through the placement portal before October 10th.', postedBy: 'Placement Cell', postedAt: '2026-09-25T14:00:00Z', isPinned: true, category: 'placement' },
  { id: 'an4', title: 'Attendance Requirement Reminder', content: 'Students are reminded that a minimum of 75% attendance is required for appearing in end-semester examinations. Current attendance reports are available on the student portal.', postedBy: 'Academic Office', postedAt: '2026-09-20T10:00:00Z', isPinned: false, category: 'academic' },
];

export const timetable: TimetableEntry[] = [
  { id: 'tt1', day: 'Monday', startTime: '09:00', endTime: '10:00', courseId: 'c1', courseName: 'Data Structures & Algorithms', facultyName: 'Dr. Ramesh Kumar', room: 'CS-201', type: 'lecture' },
  { id: 'tt2', day: 'Monday', startTime: '10:00', endTime: '11:00', courseId: 'c2', courseName: 'Database Management Systems', facultyName: 'Prof. Sunita Sharma', room: 'CS-202', type: 'lecture' },
  { id: 'tt3', day: 'Monday', startTime: '11:15', endTime: '12:15', courseId: 'c3', courseName: 'Operating Systems', facultyName: 'Dr. Arvind Mehta', room: 'CS-201', type: 'lecture' },
  { id: 'tt4', day: 'Tuesday', startTime: '09:00', endTime: '10:00', courseId: 'c4', courseName: 'Computer Networks', facultyName: 'Prof. Meena Patel', room: 'CS-203', type: 'lecture' },
  { id: 'tt5', day: 'Tuesday', startTime: '10:00', endTime: '12:00', courseId: 'c1', courseName: 'Data Structures Lab', facultyName: 'Dr. Ramesh Kumar', room: 'CS-Lab-1', type: 'lab' },
  { id: 'tt6', day: 'Wednesday', startTime: '09:00', endTime: '10:00', courseId: 'c1', courseName: 'Data Structures & Algorithms', facultyName: 'Dr. Ramesh Kumar', room: 'CS-201', type: 'lecture' },
  { id: 'tt7', day: 'Wednesday', startTime: '10:00', endTime: '12:00', courseId: 'c2', courseName: 'DBMS Lab', facultyName: 'Prof. Sunita Sharma', room: 'CS-Lab-2', type: 'lab' },
  { id: 'tt8', day: 'Thursday', startTime: '09:00', endTime: '10:00', courseId: 'c3', courseName: 'Operating Systems', facultyName: 'Dr. Arvind Mehta', room: 'CS-201', type: 'lecture' },
  { id: 'tt9', day: 'Thursday', startTime: '10:00', endTime: '11:00', courseId: 'c4', courseName: 'Computer Networks', facultyName: 'Prof. Meena Patel', room: 'CS-203', type: 'lecture' },
  { id: 'tt10', day: 'Friday', startTime: '09:00', endTime: '10:00', courseId: 'c2', courseName: 'Database Management Systems', facultyName: 'Prof. Sunita Sharma', room: 'CS-202', type: 'lecture' },
  { id: 'tt11', day: 'Friday', startTime: '10:00', endTime: '11:00', courseId: 'c1', courseName: 'DSA Tutorial', facultyName: 'Dr. Ramesh Kumar', room: 'CS-201', type: 'tutorial' },
];

export const facultyMembers: FacultyMember[] = [
  { id: 'f1', name: 'Dr. Ramesh Kumar', designation: 'Associate Professor', department: 'Computer Science', subjects: ['Data Structures & Algorithms', 'Design & Analysis of Algorithms'], email: 'ramesh.kumar@college.edu', office: 'Room 405, CS Block' },
  { id: 'f2', name: 'Prof. Sunita Sharma', designation: 'Assistant Professor', department: 'Computer Science', subjects: ['Database Management Systems', 'Data Warehousing'], email: 'sunita.sharma@college.edu', office: 'Room 406, CS Block' },
  { id: 'f3', name: 'Dr. Arvind Mehta', designation: 'Professor', department: 'Computer Science', subjects: ['Operating Systems', 'Distributed Systems'], email: 'arvind.mehta@college.edu', office: 'Room 402, CS Block' },
  { id: 'f4', name: 'Prof. Meena Patel', designation: 'Assistant Professor', department: 'Computer Science', subjects: ['Computer Networks', 'Network Security'], email: 'meena.patel@college.edu', office: 'Room 407, CS Block' },
  { id: 'f5', name: 'Dr. Suresh Iyer', designation: 'Head of Department', department: 'Computer Science', subjects: ['Software Engineering', 'Project Management'], email: 'suresh.iyer@college.edu', office: 'Room 401, CS Block' },
];

export const departmentFAQs: DepartmentFAQ[] = [
  { id: 'faq1', question: 'When are the internal exams?', answer: 'The first internal examination is scheduled from October 15–22, 2026. The second internal will be in December 2026. Exact schedules are posted on the department notice board.', category: 'Examinations' },
  { id: 'faq2', question: 'What is the minimum attendance requirement?', answer: 'Students must maintain a minimum of 75% attendance in each subject to be eligible for end-semester examinations. Students below this threshold may apply for condonation with valid medical certificates.', category: 'Academic' },
  { id: 'faq3', question: "Where is the department office?", answer: 'The CS Department office is located on the 4th floor of the Computer Science Block (CS-401). Office hours are 9:00 AM to 5:00 PM, Monday to Friday.', category: 'General' },
  { id: 'faq4', question: 'Who teaches Database Management Systems?', answer: 'DBMS for 5th Semester is taught by Prof. Sunita Sharma (Room 406, CS Block). You can contact her at sunita.sharma@college.edu.', category: 'Faculty' },
  { id: 'faq5', question: 'How do I apply for a leave of absence?', answer: 'Leave applications must be submitted to the class teacher and department office. Medical leaves require a valid certificate from a registered practitioner. Applications must be submitted within 3 days of resuming attendance.', category: 'Academic' },
  { id: 'faq6', question: 'What placement opportunities are available this year?', answer: 'The placement cell has already facilitated campus drives from TCS, Infosys, and Wipro. More companies are scheduled in November and February. Register on the placement portal to stay updated.', category: 'Placements' },
];
