export interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseId: string;
  courseName: string;
  facultyName: string;
  room: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'project' | 'skill' | 'remedial' | 'mentoring';
  semester: number;
  section: string; // 'A', 'B', 'C'
}

export interface SectionTimetableMeta {
  semester: number;
  section: string;
  roomNo: string;
  coordinator: string;
  effectiveFrom: string;
  courses: {
    code: string;
    name: string;
    contactHours: string;
    faculty: string;
  }[];
}

export const sectionTimetableMetadata: Record<string, SectionTimetableMeta> = {
  '3A': {
    semester: 3,
    section: 'A',
    roomNo: '404B',
    coordinator: 'Ms. Anujna K',
    effectiveFrom: '07-08-2026',
    courses: [
      { code: 'BMA301TC1', name: 'Computational Mathematics and Optimization', contactHours: '(3+1)', faculty: 'Mrs. Sucheta Sheka (SS)' },
      { code: 'BAI302G1', name: 'Digital Logic Design and Computer Organization', contactHours: '(3+1)', faculty: 'Ms. Anujna (AJ)' },
      { code: 'BAI303G1', name: 'Object Oriented Programming Concepts', contactHours: '(3+1)', faculty: 'Ms. Deeksha J S (DJ)' },
      { code: 'BAI304T1', name: 'Data Structures and Applications', contactHours: '(3+1)', faculty: 'Dr. Sadhana Rai (SR)' },
      { code: 'BAI305T1', name: 'Operating Systems', contactHours: '3', faculty: 'Mr. Nitesh (NI)' },
      { code: 'BAI306L1', name: 'Data Structures and Applications Laboratory with C', contactHours: '2', faculty: 'Dr. Sadhana Rai (SR)' },
      { code: 'BAI307A1', name: 'Competitive Programming-I', contactHours: '2', faculty: 'Department Faculty' },
      { code: 'BAI309P1', name: 'Community Project', contactHours: '2', faculty: 'Project Mentors' },
    ],
  },
  '3B': {
    semester: 3,
    section: 'B',
    roomNo: '404',
    coordinator: 'Mrs. Chaithrika Aditya',
    effectiveFrom: '07-08-2026',
    courses: [
      { code: 'BMA301TC1', name: 'Computational Mathematics and Optimization', contactHours: '(3+1)', faculty: 'Mrs. Sucheta Sheka (SS)' },
      { code: 'BAI302G1', name: 'Digital Logic Design and Computer Organization', contactHours: '(3+1)', faculty: 'Mrs. Chaitrika Aditya (CA)' },
      { code: 'BAI303G1', name: 'Object Oriented Programming Concepts', contactHours: '(3+1)', faculty: 'Mr. Ganaraj K (GK)' },
      { code: 'BAI304T1', name: 'Data Structures and Applications', contactHours: '(3+1)', faculty: 'Mrs. Shruthi Vishwajeeth (SV)' },
      { code: 'BAI305T1', name: 'Operating Systems', contactHours: '3', faculty: 'Mrs. Nikitha Saurabh (NS)' },
      { code: 'BAI306L1', name: 'Data Structures and Applications Laboratory with C', contactHours: '2', faculty: 'Mrs. Shruthi Vishwajeeth (SV)' },
      { code: 'BAI307A1', name: 'Competitive Programming-I', contactHours: '2', faculty: 'Department Faculty' },
      { code: 'BAI309P1', name: 'Community Project', contactHours: '2', faculty: 'Project Mentors' },
    ],
  },
  '3C': {
    semester: 3,
    section: 'C',
    roomNo: '406',
    coordinator: 'Mrs. Sangeetha M S',
    effectiveFrom: '07-08-2026',
    courses: [
      { code: 'BMA301TC1', name: 'Computational Mathematics and Optimization', contactHours: '(3+1)', faculty: 'Mrs. Sucheta Sheka (SS)' },
      { code: 'BAI302G1', name: 'Digital Logic Design and Computer Organization', contactHours: '(3+1)', faculty: 'Mr. Sharathchandra N R (SNR)' },
      { code: 'BAI303G1', name: 'Object Oriented Programming Concepts', contactHours: '(3+1)', faculty: 'Mrs. Sangeetha M S (SM)' },
      { code: 'BAI304T1', name: 'Data Structures and Applications', contactHours: '(3+1)', faculty: 'Mrs. Shweta Naik (SN)' },
      { code: 'BAI305T1', name: 'Operating Systems', contactHours: '3', faculty: 'Mrs. Mamtha Shetty (MA)' },
      { code: 'BAI306L1', name: 'Data Structures and Applications Laboratory with C', contactHours: '2', faculty: 'Mrs. Shweta Naik (SN)' },
      { code: 'BAI307A1', name: 'Competitive Programming-I', contactHours: '2', faculty: 'Department Faculty' },
      { code: 'BAI309P1', name: 'Community Project', contactHours: '2', faculty: 'Project Mentors' },
    ],
  },
  '5A': {
    semester: 5,
    section: 'A',
    roomNo: '313',
    coordinator: 'Ms. Shreekshitha',
    effectiveFrom: '26-10-2026',
    courses: [
      { code: 'BAI501G', name: 'Computer Vision', contactHours: '3+1', faculty: 'Ms. Soumya (SO)' },
      { code: 'BAI502G', name: 'Computer Network and its Applications', contactHours: '3+1', faculty: 'Mrs. Rajeshwari Shettigar (RS)' },
      { code: 'BAI503T', name: 'Automata Theory and Computability', contactHours: '3+1', faculty: 'Ms. Shreekshitha (SK)' },
      { code: 'BAI504T', name: 'Machine Learning', contactHours: '3+1', faculty: 'Dr. Pushpalatha K (PK)' },
      { code: 'BAI505L', name: 'Machine Learning Laboratory', contactHours: '2', faculty: 'Dr. Pushpalatha K / Ms. Shreekshitha / Mr. Nitesh' },
      { code: 'BAI506E2', name: 'Intelligent Process Automation', contactHours: '3', faculty: 'Dr. Gurusiddayya Hiremath (GH)' },
      { code: 'BAI507P', name: 'Mini-Project Work', contactHours: '2', faculty: 'Project Guides' },
      { code: 'BBS508AK', name: 'Research Methodology and IPR', contactHours: '1', faculty: 'Dr. Gurusiddayya Hiremath (GH)' },
      { code: 'BBS509TK', name: 'Environmental Studies', contactHours: '1', faculty: 'Ms. Monisha (MO)' },
    ],
  },
  '5B': {
    semester: 5,
    section: 'B',
    roomNo: '407',
    coordinator: 'Mr. Ranjith',
    effectiveFrom: '26-10-2026',
    courses: [
      { code: 'BAI501G', name: 'Computer Vision', contactHours: '3+1', faculty: 'Mrs. Chaitrika Aditya (CA)' },
      { code: 'BAI502G', name: 'Computer Network and its Applications', contactHours: '3+1', faculty: 'Mr. Ranjith (RJ)' },
      { code: 'BAI503T', name: 'Automata Theory and Computability', contactHours: '3+1', faculty: 'Mrs. Sangeetha M S (SM)' },
      { code: 'BAI504T', name: 'Machine Learning', contactHours: '3+1', faculty: 'Mrs. Shweta Naik (SN)' },
      { code: 'BAI505L', name: 'Machine Learning Laboratory', contactHours: '2', faculty: 'Mrs. Shweta Naik / Mr. Nitesh / Ms. Shreekshitha' },
      { code: 'BAI506E2', name: 'Intelligent Process Automation', contactHours: '3', faculty: 'Mr. Anmol (AM)' },
      { code: 'BAI507P', name: 'Mini-Project Work', contactHours: '2', faculty: 'Project Guides' },
      { code: 'BBS508AK', name: 'Research Methodology and IPR', contactHours: '1', faculty: 'Dr. Gurusiddaya Hiremath (GH)' },
      { code: 'BBS509TK', name: 'Environmental Studies', contactHours: '1', faculty: 'Ms. Monisha (MO)' },
    ],
  },
  '5C': {
    semester: 5,
    section: 'C',
    roomNo: '314',
    coordinator: 'Mr. Ashok',
    effectiveFrom: '26-10-2026',
    courses: [
      { code: 'BAI501G', name: 'Computer Vision', contactHours: '4+1', faculty: 'Mr. Ashok (AK)' },
      { code: 'BAI502G', name: 'Computer Network and its Applications', contactHours: '4+1', faculty: 'Dr. Jayashree T R (JTR)' },
      { code: 'BAI503T', name: 'Automata Theory and Computability', contactHours: '4+1', faculty: 'Ms. Deeksha J S (DJ)' },
      { code: 'BAI504T', name: 'Machine Learning', contactHours: '4+1', faculty: 'Dr. Sadhana Rai (SR)' },
      { code: 'BAI505L', name: 'Machine Learning Laboratory', contactHours: '2', faculty: 'Dr. Sadhana Rai / Mrs. Sangeetha / Mr. Nitesh' },
      { code: 'BAI506E2', name: 'Intelligent Process Automation', contactHours: '3+1', faculty: 'Mr. Sharathchandra N R (SNR)' },
      { code: 'BAI507P', name: 'Mini-Project Work', contactHours: '2', faculty: 'Project Guides' },
      { code: 'BBS508AK', name: 'Research Methodology and IPR', contactHours: '1', faculty: 'Dr. Gurusiddayya H (GH)' },
      { code: 'BBS509TK', name: 'Environmental Studies', contactHours: '1', faculty: 'Ms. Monisha (MO)' },
    ],
  },
};

export const sectionTimetables: Record<string, TimetableEntry[]> = {
  // ==========================================
  // SECTION 3A (Room 404B)
  // ==========================================
  '3A': [
    // Mon
    { id: '3A-M1', semester: 3, section: 'A', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-M2', semester: 3, section: 'A', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-M3', semester: 3, section: 'A', day: 'Monday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B1 / DLDC B2 / OOPC B3 Lab', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Computing Lab', type: 'lab' },
    { id: '3A-M4', semester: 3, section: 'A', day: 'Monday', startTime: '13:30', endTime: '14:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-M5', semester: 3, section: 'A', day: 'Monday', startTime: '14:30', endTime: '15:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications (Tutorial)', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'tutorial' },
    { id: '3A-M6', semester: 3, section: 'A', day: 'Monday', startTime: '15:30', endTime: '16:30', courseId: 'REM', courseName: 'Remedial Session', facultyName: 'Course Faculty', room: 'Room 404B', type: 'remedial' },
    // Tue
    { id: '3A-T1', semester: 3, section: 'A', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T2', semester: 3, section: 'A', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T3', semester: 3, section: 'A', day: 'Tuesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T4', semester: 3, section: 'A', day: 'Tuesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T5', semester: 3, section: 'A', day: 'Tuesday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Auditorium', type: 'skill' },
    { id: '3A-T6', semester: 3, section: 'A', day: 'Tuesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI307A1', courseName: 'Skill Lab (Assignment)', facultyName: 'Dept Faculty', room: 'Lab 3', type: 'skill' },
    // Wed
    { id: '3A-W1', semester: 3, section: 'A', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W2', semester: 3, section: 'A', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W3', semester: 3, section: 'A', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W4', semester: 3, section: 'A', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W5', semester: 3, section: 'A', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI309P1', courseName: 'Community Project', facultyName: 'Project Mentors', room: 'Room 404B', type: 'project' },
    { id: '3A-W6', semester: 3, section: 'A', day: 'Wednesday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    // Thu
    { id: '3A-H1', semester: 3, section: 'A', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-H2', semester: 3, section: 'A', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-H3', semester: 3, section: 'A', day: 'Thursday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B2 / DLDC B3 / OOPC B1 Lab', facultyName: 'Dr. Sadhana Rai (SR)', room: 'AI Lab', type: 'lab' },
    { id: '3A-H4', semester: 3, section: 'A', day: 'Thursday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '3A-H5', semester: 3, section: 'A', day: 'Thursday', startTime: '15:30', endTime: '17:30', courseId: 'BAI307A1', courseName: 'Skill Lab (Assignment)', facultyName: 'Lab Instructors', room: 'Lab 2', type: 'skill' },
    // Fri
    { id: '3A-F1', semester: 3, section: 'A', day: 'Friday', startTime: '08:30', endTime: '10:30', courseId: 'BAI306L1', courseName: 'DS B3 / DLDC B1 / OOPC B2 Lab', facultyName: 'Dr. Sadhana Rai (SR)', room: 'AI Lab', type: 'lab' },
    { id: '3A-F2', semester: 3, section: 'A', day: 'Friday', startTime: '10:45', endTime: '11:45', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-F3', semester: 3, section: 'A', day: 'Friday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-F4', semester: 3, section: 'A', day: 'Friday', startTime: '13:30', endTime: '14:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-F5', semester: 3, section: 'A', day: 'Friday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    // Sat
    { id: '3A-S1', semester: 3, section: 'A', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S2', semester: 3, section: 'A', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S3', semester: 3, section: 'A', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S4', semester: 3, section: 'A', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S5', semester: 3, section: 'A', day: 'Saturday', startTime: '13:30', endTime: '14:30', courseId: 'TUT', courseName: 'Tutorial Session', facultyName: 'Course Faculty', room: 'Room 404B', type: 'tutorial' },
    { id: '3A-S6', semester: 3, section: 'A', day: 'Saturday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Lab Instructors', room: 'Lab 3', type: 'skill' },
  ],

  // ==========================================
  // SECTION 3B (Room 404)
  // ==========================================
  '3B': [
    // Mon
    { id: '3B-M1', semester: 3, section: 'B', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M2', semester: 3, section: 'B', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M3', semester: 3, section: 'B', day: 'Monday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M4', semester: 3, section: 'B', day: 'Monday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M5', semester: 3, section: 'B', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'BAI306L1', courseName: 'DS B1 / DLDC B2 / OOPC B3 Lab', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'AI Lab', type: 'lab' },
    { id: '3B-M6', semester: 3, section: 'B', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    // Tue
    { id: '3B-T1', semester: 3, section: 'B', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-T2', semester: 3, section: 'B', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-T3', semester: 3, section: 'B', day: 'Tuesday', startTime: '10:45', endTime: '12:45', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '3B-T4', semester: 3, section: 'B', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications (Tutorial)', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'tutorial' },
    { id: '3B-T5', semester: 3, section: 'B', day: 'Tuesday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-T6', semester: 3, section: 'B', day: 'Tuesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI309P1', courseName: 'Community Project', facultyName: 'Project Mentors', room: 'Room 404', type: 'project' },
    // Wed
    { id: '3B-W1', semester: 3, section: 'B', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W2', semester: 3, section: 'B', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W3', semester: 3, section: 'B', day: 'Wednesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B2 / DLDC B3 / OOPC B1 Lab', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'AI Lab', type: 'lab' },
    { id: '3B-W4', semester: 3, section: 'B', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W5', semester: 3, section: 'B', day: 'Wednesday', startTime: '14:30', endTime: '15:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W6', semester: 3, section: 'B', day: 'Wednesday', startTime: '15:30', endTime: '16:30', courseId: 'BAI303G1', courseName: 'OOP Concepts (Tutorial)', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'tutorial' },
    // Thu
    { id: '3B-H1', semester: 3, section: 'B', day: 'Thursday', startTime: '08:30', endTime: '10:30', courseId: 'BAI306L1', courseName: 'DS B3 / DLDC B1 / OOPC B2 Lab', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'AI Lab', type: 'lab' },
    { id: '3B-H2', semester: 3, section: 'B', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-H3', semester: 3, section: 'B', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI305T1', courseName: 'Operating Systems (Tutorial)', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'tutorial' },
    { id: '3B-H4', semester: 3, section: 'B', day: 'Thursday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Placement Cell', room: 'Auditorium', type: 'skill' },
    { id: '3B-H5', semester: 3, section: 'B', day: 'Thursday', startTime: '15:30', endTime: '17:30', courseId: 'ZEN', courseName: 'ZENKEN / DipMat', facultyName: 'Language Trainers', room: 'Room 404', type: 'remedial' },
    // Fri
    { id: '3B-F1', semester: 3, section: 'B', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F2', semester: 3, section: 'B', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F3', semester: 3, section: 'B', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'ZEN', courseName: 'ZENKEN Japanese Training', facultyName: 'Zenken Faculty', room: 'Language Lab', type: 'skill' },
    { id: '3B-F4', semester: 3, section: 'B', day: 'Friday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F5', semester: 3, section: 'B', day: 'Friday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F6', semester: 3, section: 'B', day: 'Friday', startTime: '15:30', endTime: '16:30', courseId: 'REM', courseName: 'Remedial Session', facultyName: 'Course Faculty', room: 'Room 404', type: 'remedial' },
    // Sat
    { id: '3B-S1', semester: 3, section: 'B', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S2', semester: 3, section: 'B', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S3', semester: 3, section: 'B', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S4', semester: 3, section: 'B', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S5', semester: 3, section: 'B', day: 'Saturday', startTime: '13:30', endTime: '14:30', courseId: 'TUT', courseName: 'Tutorial Session', facultyName: 'Course Faculty', room: 'Room 404', type: 'tutorial' },
    { id: '3B-S6', semester: 3, section: 'B', day: 'Saturday', startTime: '14:30', endTime: '15:30', courseId: 'MENT', courseName: 'Mentoring Hour', facultyName: 'Class Mentor', room: 'Room 404', type: 'mentoring' },
  ],

  // ==========================================
  // SECTION 3C (Room 406)
  // ==========================================
  '3C': [
    // Mon
    { id: '3C-M1', semester: 3, section: 'C', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-M2', semester: 3, section: 'C', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
    { id: '3C-M3', semester: 3, section: 'C', day: 'Monday', startTime: '10:45', endTime: '12:45', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '3C-M4', semester: 3, section: 'C', day: 'Monday', startTime: '13:30', endTime: '14:30', courseId: 'BAI303G1', courseName: 'OOP Concepts (Tutorial)', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'tutorial' },
    { id: '3C-M5', semester: 3, section: 'C', day: 'Monday', startTime: '14:30', endTime: '15:30', courseId: 'BAI304T1', courseName: 'Data Structures & Applications (Tutorial)', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'tutorial' },
    { id: '3C-M6', semester: 3, section: 'C', day: 'Monday', startTime: '15:30', endTime: '16:30', courseId: 'REM', courseName: 'Remedial Class', facultyName: 'Course Faculty', room: 'Room 406', type: 'remedial' },
    // Tue
    { id: '3C-T1', semester: 3, section: 'C', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-T2', semester: 3, section: 'C', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-T3', semester: 3, section: 'C', day: 'Tuesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B1 / DLDC B2 / OOPC B3 Lab', facultyName: 'Mrs. Shweta Naik / Faculty', room: 'AI Lab', type: 'lab' },
    { id: '3C-T4', semester: 3, section: 'C', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Mentor', room: 'Room 406', type: 'mentoring' },
    { id: '3C-T5', semester: 3, section: 'C', day: 'Tuesday', startTime: '14:30', endTime: '15:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-T6', semester: 3, section: 'C', day: 'Tuesday', startTime: '15:30', endTime: '17:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    // Wed
    { id: '3C-W1', semester: 3, section: 'C', day: 'Wednesday', startTime: '08:30', endTime: '10:30', courseId: 'BAI306L1', courseName: 'DS B2 / DLDC B3 / OOPC B1 Lab', facultyName: 'Mrs. Shweta Naik / Faculty', room: 'AI Lab', type: 'lab' },
    { id: '3C-W2', semester: 3, section: 'C', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'lecture' },
    { id: '3C-W3', semester: 3, section: 'C', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI305T1', courseName: 'Operating Systems (Tutorial)', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'tutorial' },
    { id: '3C-W4', semester: 3, section: 'C', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-W5', semester: 3, section: 'C', day: 'Wednesday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-W6', semester: 3, section: 'C', day: 'Wednesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI309P1', courseName: 'Community Project', facultyName: 'Project Mentors', room: 'Room 406', type: 'project' },
    // Thu
    { id: '3C-H1', semester: 3, section: 'C', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H2', semester: 3, section: 'C', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H3', semester: 3, section: 'C', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H4', semester: 3, section: 'C', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H5', semester: 3, section: 'C', day: 'Thursday', startTime: '13:30', endTime: '14:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H6', semester: 3, section: 'C', day: 'Thursday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H7', semester: 3, section: 'C', day: 'Thursday', startTime: '15:30', endTime: '17:30', courseId: 'DIPMAT', courseName: 'Diploma Mathematics', facultyName: 'Special Faculty', room: 'Room 406', type: 'remedial' },
    // Fri
    { id: '3C-F1', semester: 3, section: 'C', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-F2', semester: 3, section: 'C', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
    { id: '3C-F3', semester: 3, section: 'C', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B3 / DLDC B1 / OOPC B2 Lab', facultyName: 'Mrs. Shweta Naik / Faculty', room: 'AI Lab', type: 'lab' },
    { id: '3C-F4', semester: 3, section: 'C', day: 'Friday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Placement Cell', room: 'Auditorium', type: 'skill' },
    // Sat
    { id: '3C-S1', semester: 3, section: 'C', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-S2', semester: 3, section: 'C', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-S3', semester: 3, section: 'C', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-S4', semester: 3, section: 'C', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
  ],

  // ==========================================
  // SECTION 5A (Room 313)
  // ==========================================
  '5A': [
    // Mon
    { id: '5A-M1', semester: 5, section: 'A', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-M2', semester: 5, section: 'A', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-M3', semester: 5, section: 'A', day: 'Monday', startTime: '10:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'CN Lab (RS / JTR)', facultyName: 'Mrs. Rajeshwari Shettigar / Dr. Jayashree', room: 'Networks Lab', type: 'lab' },
    { id: '5A-M4', semester: 5, section: 'A', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Auditorium', type: 'skill' },
    { id: '5A-M5', semester: 5, section: 'A', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'PRAC', courseName: '10 Secs Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    // Tue
    { id: '5A-T1', semester: 5, section: 'A', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-T2', semester: 5, section: 'A', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-T3', semester: 5, section: 'A', day: 'Tuesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'CV Lab (SO / AK)', facultyName: 'Ms. Soumya / Mr. Ashok', room: 'Computer Vision Lab', type: 'lab' },
    { id: '5A-T4', semester: 5, section: 'A', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-T5', semester: 5, section: 'A', day: 'Tuesday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    // Wed
    { id: '5A-W1', semester: 5, section: 'A', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W2', semester: 5, section: 'A', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W3', semester: 5, section: 'A', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W4', semester: 5, section: 'A', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W5', semester: 5, section: 'A', day: 'Wednesday', startTime: '13:30', endTime: '15:30', courseId: 'BAI505L', courseName: 'ML Lab (PK / SK / NI)', facultyName: 'Dr. Pushpalatha K / Ms. Shreekshitha / Nitesh', room: 'AI Lab 2', type: 'lab' },
    { id: '5A-W6', semester: 5, section: 'A', day: 'Wednesday', startTime: '15:30', endTime: '16:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Ms. Shreekshitha', room: 'Room 313', type: 'mentoring' },
    { id: '5A-W7', semester: 5, section: 'A', day: 'Wednesday', startTime: '16:30', endTime: '17:30', courseId: 'TUT', courseName: 'Tutorial Session', facultyName: 'Course Faculty', room: 'Room 313', type: 'tutorial' },
    // Thu
    { id: '5A-H1', semester: 5, section: 'A', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H2', semester: 5, section: 'A', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H3', semester: 5, section: 'A', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H4', semester: 5, section: 'A', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BBS508AK', courseName: 'Research Methodology and IPR', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H5', semester: 5, section: 'A', day: 'Thursday', startTime: '13:30', endTime: '14:30', courseId: 'BBS509TK', courseName: 'Environmental Studies', facultyName: 'Ms. Monisha (MO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H6', semester: 5, section: 'A', day: 'Thursday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    // Fri
    { id: '5A-F1', semester: 5, section: 'A', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-F2', semester: 5, section: 'A', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-F3', semester: 5, section: 'A', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'BAI507P', courseName: 'Mini-Project Work', facultyName: 'Project Guides', room: 'Project Lab', type: 'project' },
    { id: '5A-F4', semester: 5, section: 'A', day: 'Friday', startTime: '13:30', endTime: '14:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-F5', semester: 5, section: 'A', day: 'Friday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab (Assignment)', facultyName: 'Lab Instructors', room: 'Lab 4', type: 'skill' },
    // Sat
    { id: '5A-S1', semester: 5, section: 'A', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S2', semester: 5, section: 'A', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S3', semester: 5, section: 'A', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S4', semester: 5, section: 'A', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S5', semester: 5, section: 'A', day: 'Saturday', startTime: '13:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
  ],

  // ==========================================
  // SECTION 5B (Room 407)
  // ==========================================
  '5B': [
    // Mon
    { id: '5B-M1', semester: 5, section: 'B', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M2', semester: 5, section: 'B', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M3', semester: 5, section: 'B', day: 'Monday', startTime: '10:45', endTime: '11:45', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M4', semester: 5, section: 'B', day: 'Monday', startTime: '11:45', endTime: '12:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M5', semester: 5, section: 'B', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '5B-M6', semester: 5, section: 'B', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'REM', courseName: 'Remedial Class', facultyName: 'Course Faculty', room: 'Room 407', type: 'remedial' },
    // Tue
    { id: '5B-T1', semester: 5, section: 'B', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T2', semester: 5, section: 'B', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BBS509TK', courseName: 'Environmental Studies', facultyName: 'Ms. Monisha (MO)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T3', semester: 5, section: 'B', day: 'Tuesday', startTime: '10:45', endTime: '11:45', courseId: 'BBS508AK', courseName: 'Research Methodology and IPR', facultyName: 'Dr. Gurusiddaya Hiremath (GH)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T4', semester: 5, section: 'B', day: 'Tuesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T5', semester: 5, section: 'B', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T6', semester: 5, section: 'B', day: 'Tuesday', startTime: '14:30', endTime: '16:30', courseId: 'PRAC', courseName: '10 Secs Practice Session', facultyName: 'Training Cell', room: 'Auditorium', type: 'skill' },
    // Wed
    { id: '5B-W1', semester: 5, section: 'B', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-W2', semester: 5, section: 'B', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Mr. Ranjith', room: 'Room 407', type: 'mentoring' },
    { id: '5B-W3', semester: 5, section: 'B', day: 'Wednesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'CN Lab (RJ / JTR)', facultyName: 'Mr. Ranjith / Dr. Jayashree', room: 'Networks Lab', type: 'lab' },
    { id: '5B-W4', semester: 5, section: 'B', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-W5', semester: 5, section: 'B', day: 'Wednesday', startTime: '14:30', endTime: '15:30', courseId: 'BAI502G', courseName: 'Computer Networks (Tutorial)', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'tutorial' },
    { id: '5B-W6', semester: 5, section: 'B', day: 'Wednesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI507P', courseName: 'Mini-Project Work', facultyName: 'Project Guides', room: 'Project Lab', type: 'project' },
    // Thu
    { id: '5B-H1', semester: 5, section: 'B', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H2', semester: 5, section: 'B', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H3', semester: 5, section: 'B', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H4', semester: 5, section: 'B', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H5', semester: 5, section: 'B', day: 'Thursday', startTime: '13:30', endTime: '15:30', courseId: 'BAI505L', courseName: 'ML Lab (NI / SN / SK)', facultyName: 'Mrs. Shweta Naik / Nitesh / Ms. Shreekshitha', room: 'AI Lab', type: 'lab' },
    { id: '5B-H6', semester: 5, section: 'B', day: 'Thursday', startTime: '15:30', endTime: '16:30', courseId: 'BAI503T', courseName: 'Automata Theory (Tutorial)', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'tutorial' },
    // Fri
    { id: '5B-F1', semester: 5, section: 'B', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
    { id: '5B-F2', semester: 5, section: 'B', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'TUT', courseName: 'Tutorial Hour', facultyName: 'Course Faculty', room: 'Room 407', type: 'tutorial' },
    { id: '5B-F3', semester: 5, section: 'B', day: 'Friday', startTime: '10:45', endTime: '11:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-F4', semester: 5, section: 'B', day: 'Friday', startTime: '11:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-F5', semester: 5, section: 'B', day: 'Friday', startTime: '13:30', endTime: '15:30', courseId: 'BAI501G', courseName: 'CV Lab (CA / AK)', facultyName: 'Mrs. Chaitrika Aditya / Mr. Ashok', room: 'Computer Vision Lab', type: 'lab' },
    { id: '5B-F6', semester: 5, section: 'B', day: 'Friday', startTime: '15:30', endTime: '16:30', courseId: 'BAI504T', courseName: 'Machine Learning (Tutorial)', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'tutorial' },
    // Sat
    { id: '5B-S1', semester: 5, section: 'B', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-S2', semester: 5, section: 'B', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-S3', semester: 5, section: 'B', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-S4', semester: 5, section: 'B', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
  ],

  // ==========================================
  // SECTION 5C (Room 314)
  // ==========================================
  '5C': [
    // Mon
    { id: '5C-M1', semester: 5, section: 'C', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mr. Ashok (AK)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M2', semester: 5, section: 'C', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M3', semester: 5, section: 'C', day: 'Monday', startTime: '10:45', endTime: '11:45', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M4', semester: 5, section: 'C', day: 'Monday', startTime: '11:45', endTime: '12:45', courseId: 'BBS509TK', courseName: 'Environmental Studies', facultyName: 'Ms. Monisha (MO)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M5', semester: 5, section: 'C', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'BAI501G', courseName: 'CV Lab (AK / SO)', facultyName: 'Mr. Ashok / Ms. Soumya', room: 'Computer Vision Lab', type: 'lab' },
    { id: '5C-M6', semester: 5, section: 'C', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'REM', courseName: 'Remedial Class', facultyName: 'Course Faculty', room: 'Room 314', type: 'remedial' },
    // Tue
    { id: '5C-T1', semester: 5, section: 'C', day: 'Tuesday', startTime: '08:30', endTime: '10:30', courseId: 'BAI505L', courseName: 'ML Lab (SM / SR / NI)', facultyName: 'Dr. Sadhana Rai / Mrs. Sangeetha / Mr. Nitesh', room: 'AI Lab 3', type: 'lab' },
    { id: '5C-T2', semester: 5, section: 'C', day: 'Tuesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Dr. Jayashree T R (JTR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-T3', semester: 5, section: 'C', day: 'Tuesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 314', type: 'lecture' },
    { id: '5C-T4', semester: 5, section: 'C', day: 'Tuesday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '5C-T5', semester: 5, section: 'C', day: 'Tuesday', startTime: '15:30', endTime: '16:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Mr. Ashok', room: 'Room 314', type: 'mentoring' },
    // Wed
    { id: '5C-W1', semester: 5, section: 'C', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W2', semester: 5, section: 'C', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BBS508AK', courseName: 'Research Methodology and IPR', facultyName: 'Dr. Gurusiddayya H (GH)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W3', semester: 5, section: 'C', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W4', semester: 5, section: 'C', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W5', semester: 5, section: 'C', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Dr. Jayashree T R (JTR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W6', semester: 5, section: 'C', day: 'Wednesday', startTime: '14:30', endTime: '16:30', courseId: 'PRAC', courseName: '10 Secs Practice Session', facultyName: 'Training Cell', room: 'Auditorium', type: 'skill' },
    // Thu
    { id: '5C-H1', semester: 5, section: 'C', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H2', semester: 5, section: 'C', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H3', semester: 5, section: 'C', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'MENT', courseName: 'Mentoring Session', facultyName: 'Class Mentor', room: 'Room 314', type: 'mentoring' },
    { id: '5C-H4', semester: 5, section: 'C', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mr. Ashok (AK)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H5', semester: 5, section: 'C', day: 'Thursday', startTime: '13:30', endTime: '14:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H6', semester: 5, section: 'C', day: 'Thursday', startTime: '14:30', endTime: '15:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Dr. Jayashree T R (JTR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H7', semester: 5, section: 'C', day: 'Thursday', startTime: '15:30', endTime: '16:30', courseId: 'BAI504T', courseName: 'Machine Learning (Tutorial)', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'tutorial' },
    // Fri
    { id: '5C-F1', semester: 5, section: 'C', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mr. Ashok (AK)', room: 'Room 314', type: 'lecture' },
    { id: '5C-F2', semester: 5, section: 'C', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-F3', semester: 5, section: 'C', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'CN Lab (JTR / RS)', facultyName: 'Dr. Jayashree / Mrs. Rajeshwari', room: 'Networks Lab', type: 'lab' },
    { id: '5C-F4', semester: 5, section: 'C', day: 'Friday', startTime: '13:30', endTime: '15:30', courseId: 'BAI507P', courseName: 'Mini-Project Work', facultyName: 'Project Guides', room: 'Project Lab', type: 'project' },
    { id: '5C-F5', semester: 5, section: 'C', day: 'Friday', startTime: '15:30', endTime: '16:30', courseId: 'TUT', courseName: 'Tutorial Hour', facultyName: 'Course Faculty', room: 'Room 314', type: 'tutorial' },
    // Sat
    { id: '5C-S1', semester: 5, section: 'C', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Dr. Jayashree T R (JTR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-S2', semester: 5, section: 'C', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-S3', semester: 5, section: 'C', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 314', type: 'lecture' },
    { id: '5C-S4', semester: 5, section: 'C', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mr. Ashok (AK)', room: 'Room 314', type: 'lecture' },
  ],
};

export const allTimetableEntries: TimetableEntry[] = [
  ...sectionTimetables['3A'],
  ...sectionTimetables['3B'],
  ...sectionTimetables['3C'],
  ...sectionTimetables['5A'],
  ...sectionTimetables['5B'],
  ...sectionTimetables['5C'],
];
