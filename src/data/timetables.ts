import type { TimetableEntry, SectionTimetableMeta } from '../types/department';

export interface MatrixPeriodCell {
  code: string;
  subjectCode?: string;
  subjectName?: string;
  faculty?: string;
  time: string;
  colSpan?: number;
  type: 'theory' | 'lab' | 'skill' | 'project' | 'tutorial' | 'remedial' | 'mentoring' | 'empty';
}

export interface DayMatrixRow {
  day: string;
  dayFull: string;
  slotsBeforeTea: MatrixPeriodCell[];
  slotsBeforeLunch: MatrixPeriodCell[];
  slotsAfterLunch: MatrixPeriodCell[];
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

export const sectionMatrixTimetables: Record<string, DayMatrixRow[]> = {
  // ========================================================
  // SECTION 3A (Room 404B)
  // ========================================================
  '3A': [
    {
      day: 'MON',
      dayFull: 'Monday',
      slotsBeforeTea: [
        { code: 'BAI303G(DJ)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Ms. Deeksha J S (DJ)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'DS B1 / DLDC B2 / OOPC B3', subjectCode: 'BAI306L1', subjectName: 'Data Structures / DLDC Lab', faculty: 'Dr. Sadhana Rai (SR)', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: 'BAI305T(NI)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mr. Nitesh (NI)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'BAI304T(SR)-TUT', subjectCode: 'BAI304T1', subjectName: 'Data Structures (Tutorial)', faculty: 'Dr. Sadhana Rai (SR)', time: '2:30 - 3:30', colSpan: 1, type: 'tutorial' },
        { code: 'REMEDIAL', subjectName: 'Remedial Session', faculty: 'Course Faculty', time: '3:30 - 4:30', colSpan: 1, type: 'remedial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'TUE',
      dayFull: 'Tuesday',
      slotsBeforeTea: [
        { code: 'BAI302G(AJ)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Ms. Anujna (AJ)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(DJ)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Ms. Deeksha J S (DJ)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI305T(NI)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mr. Nitesh (NI)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI304T(SR)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Dr. Sadhana Rai (SR)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: '10 SECS PRACTICE SESSION', subjectName: '10 Seconds Coding & Aptitude', faculty: 'Training Team', time: '1:30 - 3:30', colSpan: 2, type: 'skill' },
        { code: 'SKILL LAB (Assignment)', subjectCode: 'BAI307A1', subjectName: 'Competitive Programming Skill Lab', faculty: 'Lab Faculty', time: '3:30 - 5:30', colSpan: 2, type: 'skill' },
      ],
    },
    {
      day: 'WED',
      dayFull: 'Wednesday',
      slotsBeforeTea: [
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI304T(SR)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Dr. Sadhana Rai (SR)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI305T(NI)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mr. Nitesh (NI)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI302G(AJ)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Ms. Anujna (AJ)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'COMMUNITY PROJECT', subjectCode: 'BAI309P1', subjectName: 'Community Social Project', faculty: 'Project Mentors', time: '1:30 - 2:30', colSpan: 1, type: 'project' },
        { code: 'SKILL LAB', subjectCode: 'BAI307A1', subjectName: 'Full Skill Lab Bootcamp', faculty: 'Technical Trainers', time: '2:30 - 5:30', colSpan: 3, type: 'skill' },
      ],
    },
    {
      day: 'THU',
      dayFull: 'Thursday',
      slotsBeforeTea: [
        { code: 'BAI304T(SR)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Dr. Sadhana Rai (SR)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'DS B2 / DLDC B3 / OOPC B1', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Dr. Sadhana Rai (SR)', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: '10 Secs', subjectName: '10 Seconds Coding Practice', faculty: 'Placement Cell', time: '1:30 - 3:30', colSpan: 2, type: 'skill' },
        { code: 'SKILL LAB (Assignment)', subjectCode: 'BAI307A1', subjectName: 'Competitive Programming Skill Lab', faculty: 'Lab Faculty', time: '3:30 - 5:30', colSpan: 2, type: 'skill' },
      ],
    },
    {
      day: 'FRI',
      dayFull: 'Friday',
      slotsBeforeTea: [
        { code: 'DS B3 / DLDC B1 / OOPC B2', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Dr. Sadhana Rai (SR)', time: '8:30 - 10:30', colSpan: 2, type: 'lab' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI303G(DJ)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Ms. Deeksha J S (DJ)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI302G(AJ)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Ms. Anujna (AJ)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'SKILL LAB', subjectCode: 'BAI307A1', subjectName: 'Skill Lab Session', faculty: 'Technical Trainers', time: '2:30 - 5:30', colSpan: 3, type: 'skill' },
      ],
    },
    {
      day: 'SAT',
      dayFull: 'Saturday',
      slotsBeforeTea: [
        { code: 'BAI303G(DJ)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Ms. Deeksha J S (DJ)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI305T(NI)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mr. Nitesh (NI)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI302G(AJ)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Ms. Anujna (AJ)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI304T(SR)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Dr. Sadhana Rai (SR)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'TUTORIAL', subjectName: 'Course Tutorial', faculty: 'Course Faculty', time: '1:30 - 2:30', colSpan: 1, type: 'tutorial' },
        { code: 'SKILL LAB', subjectCode: 'BAI307A1', subjectName: 'Skill Lab Workshop', faculty: 'Technical Trainers', time: '2:30 - 5:30', colSpan: 3, type: 'skill' },
      ],
    },
  ],

  // ========================================================
  // SECTION 3B (Room 404)
  // ========================================================
  '3B': [
    {
      day: 'MON',
      dayFull: 'Monday',
      slotsBeforeTea: [
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI305T(NS)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mrs. Nikitha Saurabh (NS)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI305T(NS)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mrs. Nikitha Saurabh (NS)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI302G(CA)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'DS B1 / DLDC B2 / OOPC B3', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '1:30 - 3:30', colSpan: 2, type: 'lab' },
        { code: '10 SECS PRACTICE SESSION', subjectName: '10 Seconds Coding Practice', faculty: 'Training Team', time: '3:30 - 5:30', colSpan: 2, type: 'skill' },
      ],
    },
    {
      day: 'TUE',
      dayFull: 'Tuesday',
      slotsBeforeTea: [
        { code: 'BAI304T(SV)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(GK)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mr. Ganaraj K (GK)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'SKILL LAB', subjectCode: 'BAI307A1', subjectName: 'Skill Lab', faculty: 'Technical Trainers', time: '10:45 - 12:45', colSpan: 2, type: 'skill' },
      ],
      slotsAfterLunch: [
        { code: 'BAI304T(SV)-TUT', subjectCode: 'BAI304T1', subjectName: 'Data Structures (Tutorial)', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '1:30 - 2:30', colSpan: 1, type: 'tutorial' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '2:30 - 3:30', colSpan: 1, type: 'theory' },
        { code: 'COMMUNITY PROJECT', subjectCode: 'BAI309P1', subjectName: 'Community Project', faculty: 'Project Mentors', time: '3:30 - 5:30', colSpan: 2, type: 'project' },
      ],
    },
    {
      day: 'WED',
      dayFull: 'Wednesday',
      slotsBeforeTea: [
        { code: 'BAI302G(CA)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'DS B2 / DLDC B3 / OOPC B1', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: 'BAI304T(SV)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(GK)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mr. Ganaraj K (GK)', time: '2:30 - 3:30', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(GK)-TUT', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts (Tutorial)', faculty: 'Mr. Ganaraj K (GK)', time: '3:30 - 4:30', colSpan: 1, type: 'tutorial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'THU',
      dayFull: 'Thursday',
      slotsBeforeTea: [
        { code: 'DS B3 / DLDC B1 / OOPC B2', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '8:30 - 10:30', colSpan: 2, type: 'lab' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI305T(NS)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mrs. Nikitha Saurabh (NS)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI305T(NS)-TUT', subjectCode: 'BAI305T1', subjectName: 'Operating Systems (Tutorial)', faculty: 'Mrs. Nikitha Saurabh (NS)', time: '11:45 - 12:45', colSpan: 1, type: 'tutorial' },
      ],
      slotsAfterLunch: [
        { code: '10 Secs', subjectName: '10 Seconds Practice', faculty: 'Placement Cell', time: '1:30 - 3:30', colSpan: 2, type: 'skill' },
        { code: 'ZENKEN / DipMat', subjectName: 'Zenken Japanese / Diploma Math', faculty: 'Language Faculty', time: '3:30 - 5:30', colSpan: 2, type: 'remedial' },
      ],
    },
    {
      day: 'FRI',
      dayFull: 'Friday',
      slotsBeforeTea: [
        { code: 'BAI302G(CA)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(GK)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mr. Ganaraj K (GK)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'ZENKEN', subjectName: 'Zenken Corporate Training', faculty: 'Zenken Trainers', time: '10:45 - 12:45', colSpan: 2, type: 'skill' },
      ],
      slotsAfterLunch: [
        { code: 'BAI304T(SV)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '2:30 - 3:30', colSpan: 1, type: 'theory' },
        { code: 'REMEDIAL', subjectName: 'Remedial Class', faculty: 'Course Faculty', time: '3:30 - 4:30', colSpan: 1, type: 'remedial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'SAT',
      dayFull: 'Saturday',
      slotsBeforeTea: [
        { code: 'BAI303G(GK)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mr. Ganaraj K (GK)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI304T(SV)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shruthi Vishwajeeth (SV)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI302G(CA)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'TUTORIAL', subjectName: 'Course Tutorial', faculty: 'Course Faculty', time: '1:30 - 2:30', colSpan: 1, type: 'tutorial' },
        { code: 'MENTORING', subjectName: 'Student Mentoring', faculty: 'Class Mentor', time: '2:30 - 3:30', colSpan: 1, type: 'mentoring' },
        { code: '—', time: '3:30 - 5:30', colSpan: 2, type: 'empty' },
      ],
    },
  ],

  // ========================================================
  // SECTION 3C (Room 406)
  // ========================================================
  '3C': [
    {
      day: 'MON',
      dayFull: 'Monday',
      slotsBeforeTea: [
        { code: 'BAI302G(SNR)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mr. Sharathchandra N R (SNR)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(SM)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mrs. Sangeetha M S (SM)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'SKILL LAB', subjectCode: 'BAI307A1', subjectName: 'Skill Lab', faculty: 'Technical Trainers', time: '10:45 - 12:45', colSpan: 2, type: 'skill' },
      ],
      slotsAfterLunch: [
        { code: 'BAI303G(SM)-TUT', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts (Tutorial)', faculty: 'Mrs. Sangeetha M S (SM)', time: '1:30 - 2:30', colSpan: 1, type: 'tutorial' },
        { code: 'BAI304T(SN)-TUT', subjectCode: 'BAI304T1', subjectName: 'Data Structures (Tutorial)', faculty: 'Mrs. Shweta Naik (SN)', time: '2:30 - 3:30', colSpan: 1, type: 'tutorial' },
        { code: 'REMEDIAL', subjectName: 'Remedial Session', faculty: 'Course Faculty', time: '3:30 - 4:30', colSpan: 1, type: 'remedial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'TUE',
      dayFull: 'Tuesday',
      slotsBeforeTea: [
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI304T(SN)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shweta Naik (SN)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'DS B1 / DLDC B2 / OOPC B3', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Mrs. Shweta Naik / Faculty', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: 'MENTORING', subjectName: 'Student Mentoring', faculty: 'Mentor', time: '1:30 - 2:30', colSpan: 1, type: 'mentoring' },
        { code: 'BAI302G(SNR)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mr. Sharathchandra N R (SNR)', time: '2:30 - 3:30', colSpan: 1, type: 'theory' },
        { code: '10 SECS PRACTICE SESSION', subjectName: '10 Seconds Coding Practice', faculty: 'Training Team', time: '3:30 - 5:30', colSpan: 2, type: 'skill' },
      ],
    },
    {
      day: 'WED',
      dayFull: 'Wednesday',
      slotsBeforeTea: [
        { code: 'DS B2 / DLDC B3 / OOPC B1', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Mrs. Shweta Naik / Faculty', time: '8:30 - 10:30', colSpan: 2, type: 'lab' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI305T(MA)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mrs. Mamtha Shetty (MA)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI305T(MA)-TUT', subjectCode: 'BAI305T1', subjectName: 'Operating Systems (Tutorial)', faculty: 'Mrs. Mamtha Shetty (MA)', time: '11:45 - 12:45', colSpan: 1, type: 'tutorial' },
      ],
      slotsAfterLunch: [
        { code: 'BAI304T(SN)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shweta Naik (SN)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '2:30 - 3:30', colSpan: 1, type: 'theory' },
        { code: 'COMMUNITY PROJECT', subjectCode: 'BAI309P1', subjectName: 'Community Project', faculty: 'Project Mentors', time: '3:30 - 5:30', colSpan: 2, type: 'project' },
      ],
    },
    {
      day: 'THU',
      dayFull: 'Thursday',
      slotsBeforeTea: [
        { code: 'BAI303G(SM)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mrs. Sangeetha M S (SM)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI305T(MA)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mrs. Mamtha Shetty (MA)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI305T(MA)', subjectCode: 'BAI305T1', subjectName: 'Operating Systems', faculty: 'Mrs. Mamtha Shetty (MA)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI304T(SN)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shweta Naik (SN)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'BAI302G(SNR)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mr. Sharathchandra N R (SNR)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '2:30 - 3:30', colSpan: 1, type: 'theory' },
        { code: 'DipMat', subjectName: 'Diploma Mathematics', faculty: 'Special Faculty', time: '3:30 - 5:30', colSpan: 2, type: 'remedial' },
      ],
    },
    {
      day: 'FRI',
      dayFull: 'Friday',
      slotsBeforeTea: [
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(SM)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mrs. Sangeetha M S (SM)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'DS B3 / DLDC B1 / OOPC B2', subjectCode: 'BAI306L1', subjectName: 'DS / DLDC / OOP Lab', faculty: 'Mrs. Shweta Naik / Faculty', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: '10 Secs', subjectName: '10 Seconds Coding Practice', faculty: 'Placement Cell', time: '1:30 - 3:30', colSpan: 2, type: 'skill' },
        { code: '—', time: '3:30 - 5:30', colSpan: 2, type: 'empty' },
      ],
    },
    {
      day: 'SAT',
      dayFull: 'Saturday',
      slotsBeforeTea: [
        { code: 'BAI304T(SN)', subjectCode: 'BAI304T1', subjectName: 'Data Structures and Applications', faculty: 'Mrs. Shweta Naik (SN)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BMA301A(SS)', subjectCode: 'BMA301TC1', subjectName: 'Computational Maths', faculty: 'Mrs. Sucheta Sheka (SS)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI302G(SNR)', subjectCode: 'BAI302G1', subjectName: 'Digital Logic Design & CO', faculty: 'Mr. Sharathchandra N R (SNR)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI303G(SM)', subjectCode: 'BAI303G1', subjectName: 'OOP Concepts', faculty: 'Mrs. Sangeetha M S (SM)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: '—', time: '1:30 - 5:30', colSpan: 4, type: 'empty' },
      ],
    },
  ],

  // ========================================================
  // SECTION 5A (Room 313)
  // ========================================================
  '5A': [
    {
      day: 'MON',
      dayFull: 'Monday',
      slotsBeforeTea: [
        { code: 'BAI506E2(GH)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Dr. Gurusiddayya Hiremath (GH)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI503T(SK)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Shreekshitha (SK)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'CN LAB(RS)/(JTR)', subjectCode: 'BAI502G', subjectName: 'Computer Networks Lab', faculty: 'Mrs. Rajeshwari Shettigar / Dr. Jayashree', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: '10 SECONDS', subjectName: '10 Seconds Aptitude Session', faculty: 'Training Team', time: '1:30 - 3:30', colSpan: 2, type: 'skill' },
        { code: '10 SECS PRACTICE SESSION', subjectName: '10 Seconds Coding Practice', faculty: 'Training Team', time: '3:30 - 5:30', colSpan: 2, type: 'skill' },
      ],
    },
    {
      day: 'TUE',
      dayFull: 'Tuesday',
      slotsBeforeTea: [
        { code: 'BAI501G(SO)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Ms. Soumya (SO)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(PK)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Pushpalatha K (PK)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'CV LAB(SO)/(AK)', subjectCode: 'BAI501G', subjectName: 'Computer Vision Lab', faculty: 'Ms. Soumya / Mr. Ashok', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: 'BAI506E2(GH)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Dr. Gurusiddayya Hiremath (GH)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'SKILL LAB', subjectName: 'Department Skill Lab Bootcamp', faculty: 'Technical Trainers', time: '2:30 - 5:30', colSpan: 3, type: 'skill' },
      ],
    },
    {
      day: 'WED',
      dayFull: 'Wednesday',
      slotsBeforeTea: [
        { code: 'BAI501G(SO)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Ms. Soumya (SO)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(PK)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Pushpalatha K (PK)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI503T(SK)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Shreekshitha (SK)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(RS)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mrs. Rajeshwari Shettigar (RS)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'ML LAB (PK)/(SK)/(NI)', subjectCode: 'BAI505L', subjectName: 'Machine Learning Laboratory', faculty: 'Dr. Pushpalatha K / Ms. Shreekshitha / Nitesh', time: '1:30 - 3:30', colSpan: 2, type: 'lab' },
        { code: 'MENTORING', subjectName: 'Student Mentoring Session', faculty: 'Ms. Shreekshitha', time: '3:30 - 4:30', colSpan: 1, type: 'mentoring' },
        { code: 'TUTORIAL', subjectName: 'Course Tutorial', faculty: 'Course Faculty', time: '4:30 - 5:30', colSpan: 1, type: 'tutorial' },
      ],
    },
    {
      day: 'THU',
      dayFull: 'Thursday',
      slotsBeforeTea: [
        { code: 'BAI504T(PK)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Pushpalatha K (PK)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(RS)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mrs. Rajeshwari Shettigar (RS)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI501G(SO)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Ms. Soumya (SO)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BBS508AK(GH)', subjectCode: 'BBS508AK', subjectName: 'Research Methodology and IPR', faculty: 'Dr. Gurusiddayya Hiremath (GH)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'BBS509TK(MO)', subjectCode: 'BBS509TK', subjectName: 'Environmental Studies', faculty: 'Ms. Monisha (MO)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'SKILL LAB', subjectName: 'Hands-on Skill Lab', faculty: 'Technical Trainers', time: '2:30 - 5:30', colSpan: 3, type: 'skill' },
      ],
    },
    {
      day: 'FRI',
      dayFull: 'Friday',
      slotsBeforeTea: [
        { code: 'BAI503T(SK)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Shreekshitha (SK)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(RS)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mrs. Rajeshwari Shettigar (RS)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'MINI-PROJECT', subjectCode: 'BAI507P', subjectName: 'Mini-Project Work', faculty: 'Project Guides', time: '10:45 - 12:45', colSpan: 2, type: 'project' },
      ],
      slotsAfterLunch: [
        { code: 'BAI506E2(GH)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Dr. Gurusiddayya Hiremath (GH)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'SKILL LAB (Assignment)', subjectName: 'Skill Lab Assignment Lab', faculty: 'Lab Faculty', time: '2:30 - 5:30', colSpan: 3, type: 'skill' },
      ],
    },
    {
      day: 'SAT',
      dayFull: 'Saturday',
      slotsBeforeTea: [
        { code: 'BAI503T(SK)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Shreekshitha (SK)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(PK)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Pushpalatha K (PK)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI502G(RS)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mrs. Rajeshwari Shettigar (RS)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI501G(SO)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Ms. Soumya (SO)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'SKILL LAB', subjectName: 'Full Skill Workshop', faculty: 'Technical Trainers', time: '1:30 - 5:30', colSpan: 4, type: 'skill' },
      ],
    },
  ],

  // ========================================================
  // SECTION 5B (Room 407)
  // ========================================================
  '5B': [
    {
      day: 'MON',
      dayFull: 'Monday',
      slotsBeforeTea: [
        { code: 'BAI501G(CA)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(RJ)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mr. Ranjith (RJ)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI504T(SN)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Mrs. Shweta Naik (SN)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI503T(SM)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Mrs. Sangeetha M S (SM)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: '10 SECONDS', subjectName: '10 Seconds Coding Practice', faculty: 'Training Team', time: '1:30 - 3:30', colSpan: 2, type: 'skill' },
        { code: 'REMEDIAL', subjectName: 'Remedial Class', faculty: 'Course Faculty', time: '3:30 - 5:30', colSpan: 2, type: 'remedial' },
      ],
    },
    {
      day: 'TUE',
      dayFull: 'Tuesday',
      slotsBeforeTea: [
        { code: 'BAI502G(RJ)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mr. Ranjith (RJ)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BBS509TK(MO)', subjectCode: 'BBS509TK', subjectName: 'Environmental Studies', faculty: 'Ms. Monisha (MO)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BBS508AK(GH)', subjectCode: 'BBS508AK', subjectName: 'Research Methodology and IPR', faculty: 'Dr. Gurusiddaya Hiremath (GH)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI501G(CA)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'BAI506E2(AM)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Anmol (AM)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: '10 SECS PRACTICE SESSION', subjectName: '10 Seconds Practice', faculty: 'Training Cell', time: '2:30 - 4:30', colSpan: 2, type: 'skill' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'WED',
      dayFull: 'Wednesday',
      slotsBeforeTea: [
        { code: 'BAI506E2(AM)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Anmol (AM)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'MENTORING', subjectName: 'Student Mentoring', faculty: 'Mr. Ranjith', time: '9:30 - 10:30', colSpan: 1, type: 'mentoring' },
      ],
      slotsBeforeLunch: [
        { code: 'CN LAB (RJ)/(JTR)', subjectCode: 'BAI502G', subjectName: 'Computer Networks Lab', faculty: 'Mr. Ranjith / Dr. Jayashree', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: 'BAI503T(SM)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Mrs. Sangeetha M S (SM)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(RJ)-TUT', subjectCode: 'BAI502G', subjectName: 'Computer Networks (Tutorial)', faculty: 'Mr. Ranjith (RJ)', time: '2:30 - 3:30', colSpan: 1, type: 'tutorial' },
        { code: 'MINI-PROJECT', subjectCode: 'BAI507P', subjectName: 'Mini-Project Work', faculty: 'Project Guides', time: '3:30 - 5:30', colSpan: 2, type: 'project' },
      ],
    },
    {
      day: 'THU',
      dayFull: 'Thursday',
      slotsBeforeTea: [
        { code: 'BAI506E2(AM)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Anmol (AM)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(SN)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Mrs. Shweta Naik (SN)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI501G(CA)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI503T(SM)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Mrs. Sangeetha M S (SM)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'ML LAB (NI)/(SN)/(SK)', subjectCode: 'BAI505L', subjectName: 'Machine Learning Lab', faculty: 'Mrs. Shweta Naik / Nitesh / Ms. Shreekshitha', time: '1:30 - 3:30', colSpan: 2, type: 'lab' },
        { code: 'BAI503T(SM)-TUT', subjectCode: 'BAI503T', subjectName: 'Automata Theory (Tutorial)', faculty: 'Mrs. Sangeetha M S (SM)', time: '3:30 - 4:30', colSpan: 1, type: 'tutorial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'FRI',
      dayFull: 'Friday',
      slotsBeforeTea: [
        { code: 'BAI504T(SN)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Mrs. Shweta Naik (SN)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'TUTORIAL', subjectName: 'Course Tutorial', faculty: 'Course Faculty', time: '9:30 - 10:30', colSpan: 1, type: 'tutorial' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI501G(CA)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mrs. Chaitrika Aditya (CA)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(RJ)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mr. Ranjith (RJ)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'CV LAB (CA) /(AK)', subjectCode: 'BAI501G', subjectName: 'Computer Vision Lab', faculty: 'Mrs. Chaitrika Aditya / Mr. Ashok', time: '1:30 - 3:30', colSpan: 2, type: 'lab' },
        { code: 'BAI504T(SN)-TUT', subjectCode: 'BAI504T', subjectName: 'Machine Learning (Tutorial)', faculty: 'Mrs. Shweta Naik (SN)', time: '3:30 - 4:30', colSpan: 1, type: 'tutorial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'SAT',
      dayFull: 'Saturday',
      slotsBeforeTea: [
        { code: 'BAI503T(SM)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Mrs. Sangeetha M S (SM)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(RJ)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Mr. Ranjith (RJ)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI506E2(AM)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Anmol (AM)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(SN)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Mrs. Shweta Naik (SN)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: '—', time: '1:30 - 5:30', colSpan: 4, type: 'empty' },
      ],
    },
  ],

  // ========================================================
  // SECTION 5C (Room 314)
  // ========================================================
  '5C': [
    {
      day: 'MON',
      dayFull: 'Monday',
      slotsBeforeTea: [
        { code: 'BAI501G(AK)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mr. Ashok (AK)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(SR)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Sadhana Rai (SR)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI506E2(SNR)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Sharathchandra N R (SNR)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BBS509TK(MO)', subjectCode: 'BBS509TK', subjectName: 'Environmental Studies', faculty: 'Ms. Monisha (MO)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'CV LAB (AK)/(SO)', subjectCode: 'BAI501G', subjectName: 'Computer Vision Lab', faculty: 'Mr. Ashok / Ms. Soumya', time: '1:30 - 3:30', colSpan: 2, type: 'lab' },
        { code: 'REMEDIAL', subjectName: 'Remedial Class', faculty: 'Course Faculty', time: '3:30 - 5:30', colSpan: 2, type: 'remedial' },
      ],
    },
    {
      day: 'TUE',
      dayFull: 'Tuesday',
      slotsBeforeTea: [
        { code: 'ML LAB (SM)/(SR)/(NI)', subjectCode: 'BAI505L', subjectName: 'Machine Learning Lab', faculty: 'Dr. Sadhana Rai / Mrs. Sangeetha / Mr. Nitesh', time: '8:30 - 10:30', colSpan: 2, type: 'lab' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI502G(JTR)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Dr. Jayashree T R (JTR)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI503T(DJ)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Deeksha J S (DJ)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: '10 SECONDS', subjectName: '10 Seconds Coding Practice', faculty: 'Training Team', time: '1:30 - 3:30', colSpan: 2, type: 'skill' },
        { code: 'MENTORING', subjectName: 'Student Mentoring', faculty: 'Mr. Ashok', time: '3:30 - 4:30', colSpan: 1, type: 'mentoring' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'WED',
      dayFull: 'Wednesday',
      slotsBeforeTea: [
        { code: 'BAI503T(DJ)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Deeksha J S (DJ)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BBS508AK(GH)', subjectCode: 'BBS508AK', subjectName: 'Research Methodology and IPR', faculty: 'Dr. Gurusiddayya H (GH)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI506E2(SNR)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Sharathchandra N R (SNR)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(SR)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Sadhana Rai (SR)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'BAI502G(JTR)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Dr. Jayashree T R (JTR)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: '10 SECS PRACTICE SESSION', subjectName: '10 Seconds Practice Session', faculty: 'Training Cell', time: '2:30 - 4:30', colSpan: 2, type: 'skill' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'THU',
      dayFull: 'Thursday',
      slotsBeforeTea: [
        { code: 'BAI506E2(SNR)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Sharathchandra N R (SNR)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI503T(DJ)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Deeksha J S (DJ)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'MENTORING', subjectName: 'Student Mentoring', faculty: 'Class Mentor', time: '10:45 - 11:45', colSpan: 1, type: 'mentoring' },
        { code: 'BAI501G(AK)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mr. Ashok (AK)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: 'BAI504T(SR)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Sadhana Rai (SR)', time: '1:30 - 2:30', colSpan: 1, type: 'theory' },
        { code: 'BAI502G(JTR)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Dr. Jayashree T R (JTR)', time: '2:30 - 3:30', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(SR)-TUT', subjectCode: 'BAI504T', subjectName: 'Machine Learning (Tutorial)', faculty: 'Dr. Sadhana Rai (SR)', time: '3:30 - 4:30', colSpan: 1, type: 'tutorial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'FRI',
      dayFull: 'Friday',
      slotsBeforeTea: [
        { code: 'BAI501G(AK)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mr. Ashok (AK)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI506E2(SNR)', subjectCode: 'BAI506E2', subjectName: 'Intelligent Process Automation', faculty: 'Mr. Sharathchandra N R (SNR)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'CN LAB (JTR)/(RS)', subjectCode: 'BAI502G', subjectName: 'Computer Networks Lab', faculty: 'Dr. Jayashree / Mrs. Rajeshwari', time: '10:45 - 12:45', colSpan: 2, type: 'lab' },
      ],
      slotsAfterLunch: [
        { code: 'MINI-PROJECT', subjectCode: 'BAI507P', subjectName: 'Mini-Project Work', faculty: 'Project Guides', time: '1:30 - 3:30', colSpan: 2, type: 'project' },
        { code: 'TUTORIAL', subjectName: 'Course Tutorial', faculty: 'Course Faculty', time: '3:30 - 4:30', colSpan: 1, type: 'tutorial' },
        { code: '—', time: '4:30 - 5:30', colSpan: 1, type: 'empty' },
      ],
    },
    {
      day: 'SAT',
      dayFull: 'Saturday',
      slotsBeforeTea: [
        { code: 'BAI502G(JTR)', subjectCode: 'BAI502G', subjectName: 'Computer Network and its Applications', faculty: 'Dr. Jayashree T R (JTR)', time: '8:30 - 9:30', colSpan: 1, type: 'theory' },
        { code: 'BAI504T(SR)', subjectCode: 'BAI504T', subjectName: 'Machine Learning', faculty: 'Dr. Sadhana Rai (SR)', time: '9:30 - 10:30', colSpan: 1, type: 'theory' },
      ],
      slotsBeforeLunch: [
        { code: 'BAI503T(DJ)', subjectCode: 'BAI503T', subjectName: 'Automata Theory and Computability', faculty: 'Ms. Deeksha J S (DJ)', time: '10:45 - 11:45', colSpan: 1, type: 'theory' },
        { code: 'BAI501G(AK)', subjectCode: 'BAI501G', subjectName: 'Computer Vision', faculty: 'Mr. Ashok (AK)', time: '11:45 - 12:45', colSpan: 1, type: 'theory' },
      ],
      slotsAfterLunch: [
        { code: '—', time: '1:30 - 5:30', colSpan: 4, type: 'empty' },
      ],
    },
  ],
};

export const sectionTimetables: Record<string, TimetableEntry[]> = {
  '3A': [
    { id: '3A-M1', semester: 3, section: 'A', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-M2', semester: 3, section: 'A', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-M3', semester: 3, section: 'A', day: 'Monday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B1 / DLDC B2 / OOPC B3 Lab', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Computing Lab', type: 'lab' },
    { id: '3A-M4', semester: 3, section: 'A', day: 'Monday', startTime: '13:30', endTime: '14:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-M5', semester: 3, section: 'A', day: 'Monday', startTime: '14:30', endTime: '15:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications (Tutorial)', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'tutorial' },
    { id: '3A-M6', semester: 3, section: 'A', day: 'Monday', startTime: '15:30', endTime: '16:30', courseId: 'REM', courseName: 'Remedial Session', facultyName: 'Course Faculty', room: 'Room 404B', type: 'remedial' },
    { id: '3A-T1', semester: 3, section: 'A', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T2', semester: 3, section: 'A', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T3', semester: 3, section: 'A', day: 'Tuesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T4', semester: 3, section: 'A', day: 'Tuesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-T5', semester: 3, section: 'A', day: 'Tuesday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Auditorium', type: 'skill' },
    { id: '3A-T6', semester: 3, section: 'A', day: 'Tuesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI307A1', courseName: 'Skill Lab (Assignment)', facultyName: 'Dept Faculty', room: 'Lab 3', type: 'skill' },
    { id: '3A-W1', semester: 3, section: 'A', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W2', semester: 3, section: 'A', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W3', semester: 3, section: 'A', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W4', semester: 3, section: 'A', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-W5', semester: 3, section: 'A', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI309P1', courseName: 'Community Project', facultyName: 'Project Mentors', room: 'Room 404B', type: 'project' },
    { id: '3A-W6', semester: 3, section: 'A', day: 'Wednesday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '3A-H1', semester: 3, section: 'A', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-H2', semester: 3, section: 'A', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-H3', semester: 3, section: 'A', day: 'Thursday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B2 / DLDC B3 / OOPC B1 Lab', facultyName: 'Dr. Sadhana Rai (SR)', room: 'AI Lab', type: 'lab' },
    { id: '3A-H4', semester: 3, section: 'A', day: 'Thursday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '3A-H5', semester: 3, section: 'A', day: 'Thursday', startTime: '15:30', endTime: '17:30', courseId: 'BAI307A1', courseName: 'Skill Lab (Assignment)', facultyName: 'Lab Instructors', room: 'Lab 2', type: 'skill' },
    { id: '3A-F1', semester: 3, section: 'A', day: 'Friday', startTime: '08:30', endTime: '10:30', courseId: 'BAI306L1', courseName: 'DS B3 / DLDC B1 / OOPC B2 Lab', facultyName: 'Dr. Sadhana Rai (SR)', room: 'AI Lab', type: 'lab' },
    { id: '3A-F2', semester: 3, section: 'A', day: 'Friday', startTime: '10:45', endTime: '11:45', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-F3', semester: 3, section: 'A', day: 'Friday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-F4', semester: 3, section: 'A', day: 'Friday', startTime: '13:30', endTime: '14:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-F5', semester: 3, section: 'A', day: 'Friday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '3A-S1', semester: 3, section: 'A', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S2', semester: 3, section: 'A', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mr. Nitesh (NI)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S3', semester: 3, section: 'A', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Ms. Anujna (AJ)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S4', semester: 3, section: 'A', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 404B', type: 'lecture' },
    { id: '3A-S5', semester: 3, section: 'A', day: 'Saturday', startTime: '13:30', endTime: '14:30', courseId: 'TUT', courseName: 'Tutorial Session', facultyName: 'Course Faculty', room: 'Room 404B', type: 'tutorial' },
    { id: '3A-S6', semester: 3, section: 'A', day: 'Saturday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Lab Instructors', room: 'Lab 3', type: 'skill' },
  ],
  '3B': [
    { id: '3B-M1', semester: 3, section: 'B', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M2', semester: 3, section: 'B', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M3', semester: 3, section: 'B', day: 'Monday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M4', semester: 3, section: 'B', day: 'Monday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-M5', semester: 3, section: 'B', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'BAI306L1', courseName: 'DS B1 / DLDC B2 / OOPC B3 Lab', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'AI Lab', type: 'lab' },
    { id: '3B-M6', semester: 3, section: 'B', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '3B-T1', semester: 3, section: 'B', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-T2', semester: 3, section: 'B', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-T3', semester: 3, section: 'B', day: 'Tuesday', startTime: '10:45', endTime: '12:45', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '3B-T4', semester: 3, section: 'B', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications (Tutorial)', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'tutorial' },
    { id: '3B-T5', semester: 3, section: 'B', day: 'Tuesday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-T6', semester: 3, section: 'B', day: 'Tuesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI309P1', courseName: 'Community Project', facultyName: 'Project Mentors', room: 'Room 404', type: 'project' },
    { id: '3B-W1', semester: 3, section: 'B', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W2', semester: 3, section: 'B', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W3', semester: 3, section: 'B', day: 'Wednesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B2 / DLDC B3 / OOPC B1 Lab', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'AI Lab', type: 'lab' },
    { id: '3B-W4', semester: 3, section: 'B', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W5', semester: 3, section: 'B', day: 'Wednesday', startTime: '14:30', endTime: '15:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-W6', semester: 3, section: 'B', day: 'Wednesday', startTime: '15:30', endTime: '16:30', courseId: 'BAI303G1', courseName: 'OOP Concepts (Tutorial)', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'tutorial' },
    { id: '3B-H1', semester: 3, section: 'B', day: 'Thursday', startTime: '08:30', endTime: '10:30', courseId: 'BAI306L1', courseName: 'DS B3 / DLDC B1 / OOPC B2 Lab', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'AI Lab', type: 'lab' },
    { id: '3B-H2', semester: 3, section: 'B', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-H3', semester: 3, section: 'B', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI305T1', courseName: 'Operating Systems (Tutorial)', facultyName: 'Mrs. Nikitha Saurabh (NS)', room: 'Room 404', type: 'tutorial' },
    { id: '3B-H4', semester: 3, section: 'B', day: 'Thursday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Placement Cell', room: 'Auditorium', type: 'skill' },
    { id: '3B-H5', semester: 3, section: 'B', day: 'Thursday', startTime: '15:30', endTime: '17:30', courseId: 'ZEN', courseName: 'ZENKEN / DipMat', facultyName: 'Language Trainers', room: 'Room 404', type: 'remedial' },
    { id: '3B-F1', semester: 3, section: 'B', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F2', semester: 3, section: 'B', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F3', semester: 3, section: 'B', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'ZEN', courseName: 'ZENKEN Japanese Training', facultyName: 'Zenken Faculty', room: 'Language Lab', type: 'skill' },
    { id: '3B-F4', semester: 3, section: 'B', day: 'Friday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F5', semester: 3, section: 'B', day: 'Friday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-F6', semester: 3, section: 'B', day: 'Friday', startTime: '15:30', endTime: '16:30', courseId: 'REM', courseName: 'Remedial Session', facultyName: 'Course Faculty', room: 'Room 404', type: 'remedial' },
    { id: '3B-S1', semester: 3, section: 'B', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mr. Ganaraj K (GK)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S2', semester: 3, section: 'B', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shruthi Vishwajeeth (SV)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S3', semester: 3, section: 'B', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S4', semester: 3, section: 'B', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 404', type: 'lecture' },
    { id: '3B-S5', semester: 3, section: 'B', day: 'Saturday', startTime: '13:30', endTime: '14:30', courseId: 'TUT', courseName: 'Tutorial Session', facultyName: 'Course Faculty', room: 'Room 404', type: 'tutorial' },
    { id: '3B-S6', semester: 3, section: 'B', day: 'Saturday', startTime: '14:30', endTime: '15:30', courseId: 'MENT', courseName: 'Mentoring Hour', facultyName: 'Class Mentor', room: 'Room 404', type: 'mentoring' },
  ],
  '3C': [
    { id: '3C-M1', semester: 3, section: 'C', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-M2', semester: 3, section: 'C', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
    { id: '3C-M3', semester: 3, section: 'C', day: 'Monday', startTime: '10:45', endTime: '12:45', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '3C-M4', semester: 3, section: 'C', day: 'Monday', startTime: '13:30', endTime: '14:30', courseId: 'BAI303G1', courseName: 'OOP Concepts (Tutorial)', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'tutorial' },
    { id: '3C-M5', semester: 3, section: 'C', day: 'Monday', startTime: '14:30', endTime: '15:30', courseId: 'BAI304T1', courseName: 'Data Structures & Applications (Tutorial)', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'tutorial' },
    { id: '3C-M6', semester: 3, section: 'C', day: 'Monday', startTime: '15:30', endTime: '16:30', courseId: 'REM', courseName: 'Remedial Class', facultyName: 'Course Faculty', room: 'Room 406', type: 'remedial' },
    { id: '3C-T1', semester: 3, section: 'C', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-T2', semester: 3, section: 'C', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-T3', semester: 3, section: 'C', day: 'Tuesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B1 / DLDC B2 / OOPC B3 Lab', facultyName: 'Mrs. Shweta Naik / Faculty', room: 'AI Lab', type: 'lab' },
    { id: '3C-T4', semester: 3, section: 'C', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Mentor', room: 'Room 406', type: 'mentoring' },
    { id: '3C-T5', semester: 3, section: 'C', day: 'Tuesday', startTime: '14:30', endTime: '15:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-T6', semester: 3, section: 'C', day: 'Tuesday', startTime: '15:30', endTime: '17:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '3C-W1', semester: 3, section: 'C', day: 'Wednesday', startTime: '08:30', endTime: '10:30', courseId: 'BAI306L1', courseName: 'DS B2 / DLDC B3 / OOPC B1 Lab', facultyName: 'Mrs. Shweta Naik / Faculty', room: 'AI Lab', type: 'lab' },
    { id: '3C-W2', semester: 3, section: 'C', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'lecture' },
    { id: '3C-W3', semester: 3, section: 'C', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI305T1', courseName: 'Operating Systems (Tutorial)', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'tutorial' },
    { id: '3C-W4', semester: 3, section: 'C', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-W5', semester: 3, section: 'C', day: 'Wednesday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-W6', semester: 3, section: 'C', day: 'Wednesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI309P1', courseName: 'Community Project', facultyName: 'Project Mentors', room: 'Room 406', type: 'project' },
    { id: '3C-H1', semester: 3, section: 'C', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H2', semester: 3, section: 'C', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H3', semester: 3, section: 'C', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI305T1', courseName: 'Operating Systems', facultyName: 'Mrs. Mamtha Shetty (MA)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H4', semester: 3, section: 'C', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H5', semester: 3, section: 'C', day: 'Thursday', startTime: '13:30', endTime: '14:30', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H6', semester: 3, section: 'C', day: 'Thursday', startTime: '14:30', endTime: '15:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-H7', semester: 3, section: 'C', day: 'Thursday', startTime: '15:30', endTime: '17:30', courseId: 'DIPMAT', courseName: 'Diploma Mathematics', facultyName: 'Special Faculty', room: 'Room 406', type: 'remedial' },
    { id: '3C-F1', semester: 3, section: 'C', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-F2', semester: 3, section: 'C', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
    { id: '3C-F3', semester: 3, section: 'C', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'BAI306L1', courseName: 'DS B3 / DLDC B1 / OOPC B2 Lab', facultyName: 'Mrs. Shweta Naik / Faculty', room: 'AI Lab', type: 'lab' },
    { id: '3C-F4', semester: 3, section: 'C', day: 'Friday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Placement Cell', room: 'Auditorium', type: 'skill' },
    { id: '3C-S1', semester: 3, section: 'C', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI304T1', courseName: 'Data Structures and Applications', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 406', type: 'lecture' },
    { id: '3C-S2', semester: 3, section: 'C', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BMA301TC1', courseName: 'Computational Mathematics and Optimization', facultyName: 'Mrs. Sucheta Sheka (SS)', room: 'Room 406', type: 'lecture' },
    { id: '3C-S3', semester: 3, section: 'C', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI302G1', courseName: 'Digital Logic Design and Computer Organization', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 406', type: 'lecture' },
    { id: '3C-S4', semester: 3, section: 'C', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI303G1', courseName: 'Object Oriented Programming Concepts', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 406', type: 'lecture' },
  ],
  '5A': [
    { id: '5A-M1', semester: 5, section: 'A', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-M2', semester: 5, section: 'A', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-M3', semester: 5, section: 'A', day: 'Monday', startTime: '10:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'CN Lab (RS / JTR)', facultyName: 'Mrs. Rajeshwari Shettigar / Dr. Jayashree', room: 'Networks Lab', type: 'lab' },
    { id: '5A-M4', semester: 5, section: 'A', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Auditorium', type: 'skill' },
    { id: '5A-M5', semester: 5, section: 'A', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'PRAC', courseName: '10 Secs Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '5A-T1', semester: 5, section: 'A', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-T2', semester: 5, section: 'A', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-T3', semester: 5, section: 'A', day: 'Tuesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'CV Lab (SO / AK)', facultyName: 'Ms. Soumya / Mr. Ashok', room: 'Computer Vision Lab', type: 'lab' },
    { id: '5A-T4', semester: 5, section: 'A', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-T5', semester: 5, section: 'A', day: 'Tuesday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '5A-W1', semester: 5, section: 'A', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W2', semester: 5, section: 'A', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W3', semester: 5, section: 'A', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W4', semester: 5, section: 'A', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-W5', semester: 5, section: 'A', day: 'Wednesday', startTime: '13:30', endTime: '15:30', courseId: 'BAI505L', courseName: 'ML Lab (PK / SK / NI)', facultyName: 'Dr. Pushpalatha K / Ms. Shreekshitha / Nitesh', room: 'AI Lab 2', type: 'lab' },
    { id: '5A-W6', semester: 5, section: 'A', day: 'Wednesday', startTime: '15:30', endTime: '16:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Ms. Shreekshitha', room: 'Room 313', type: 'mentoring' },
    { id: '5A-W7', semester: 5, section: 'A', day: 'Wednesday', startTime: '16:30', endTime: '17:30', courseId: 'TUT', courseName: 'Tutorial Session', facultyName: 'Course Faculty', room: 'Room 313', type: 'tutorial' },
    { id: '5A-H1', semester: 5, section: 'A', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H2', semester: 5, section: 'A', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H3', semester: 5, section: 'A', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H4', semester: 5, section: 'A', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BBS508AK', courseName: 'Research Methodology and IPR', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H5', semester: 5, section: 'A', day: 'Thursday', startTime: '13:30', endTime: '14:30', courseId: 'BBS509TK', courseName: 'Environmental Studies', facultyName: 'Ms. Monisha (MO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-H6', semester: 5, section: 'A', day: 'Thursday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
    { id: '5A-F1', semester: 5, section: 'A', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-F2', semester: 5, section: 'A', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-F3', semester: 5, section: 'A', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'BAI507P', courseName: 'Mini-Project Work', facultyName: 'Project Guides', room: 'Project Lab', type: 'project' },
    { id: '5A-F4', semester: 5, section: 'A', day: 'Friday', startTime: '13:30', endTime: '14:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Dr. Gurusiddayya Hiremath (GH)', room: 'Room 313', type: 'lecture' },
    { id: '5A-F5', semester: 5, section: 'A', day: 'Friday', startTime: '14:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab (Assignment)', facultyName: 'Lab Instructors', room: 'Lab 4', type: 'skill' },
    { id: '5A-S1', semester: 5, section: 'A', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Shreekshitha (SK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S2', semester: 5, section: 'A', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Pushpalatha K (PK)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S3', semester: 5, section: 'A', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mrs. Rajeshwari Shettigar (RS)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S4', semester: 5, section: 'A', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Ms. Soumya (SO)', room: 'Room 313', type: 'lecture' },
    { id: '5A-S5', semester: 5, section: 'A', day: 'Saturday', startTime: '13:30', endTime: '17:30', courseId: 'SKILL', courseName: 'Skill Lab', facultyName: 'Technical Trainers', room: 'Computing Lab', type: 'skill' },
  ],
  '5B': [
    { id: '5B-M1', semester: 5, section: 'B', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M2', semester: 5, section: 'B', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M3', semester: 5, section: 'B', day: 'Monday', startTime: '10:45', endTime: '11:45', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M4', semester: 5, section: 'B', day: 'Monday', startTime: '11:45', endTime: '12:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-M5', semester: 5, section: 'B', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '5B-M6', semester: 5, section: 'B', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'REM', courseName: 'Remedial Class', facultyName: 'Course Faculty', room: 'Room 407', type: 'remedial' },
    { id: '5B-T1', semester: 5, section: 'B', day: 'Tuesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T2', semester: 5, section: 'B', day: 'Tuesday', startTime: '09:30', endTime: '10:30', courseId: 'BBS509TK', courseName: 'Environmental Studies', facultyName: 'Ms. Monisha (MO)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T3', semester: 5, section: 'B', day: 'Tuesday', startTime: '10:45', endTime: '11:45', courseId: 'BBS508AK', courseName: 'Research Methodology and IPR', facultyName: 'Dr. Gurusiddaya Hiremath (GH)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T4', semester: 5, section: 'B', day: 'Tuesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T5', semester: 5, section: 'B', day: 'Tuesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-T6', semester: 5, section: 'B', day: 'Tuesday', startTime: '14:30', endTime: '16:30', courseId: 'PRAC', courseName: '10 Secs Practice Session', facultyName: 'Training Cell', room: 'Auditorium', type: 'skill' },
    { id: '5B-W1', semester: 5, section: 'B', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-W2', semester: 5, section: 'B', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Mr. Ranjith', room: 'Room 407', type: 'mentoring' },
    { id: '5B-W3', semester: 5, section: 'B', day: 'Wednesday', startTime: '10:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'CN Lab (RJ / JTR)', facultyName: 'Mr. Ranjith / Dr. Jayashree', room: 'Networks Lab', type: 'lab' },
    { id: '5B-W4', semester: 5, section: 'B', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-W5', semester: 5, section: 'B', day: 'Wednesday', startTime: '14:30', endTime: '15:30', courseId: 'BAI502G', courseName: 'Computer Networks (Tutorial)', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'tutorial' },
    { id: '5B-W6', semester: 5, section: 'B', day: 'Wednesday', startTime: '15:30', endTime: '17:30', courseId: 'BAI507P', courseName: 'Mini-Project Work', facultyName: 'Project Guides', room: 'Project Lab', type: 'project' },
    { id: '5B-H1', semester: 5, section: 'B', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H2', semester: 5, section: 'B', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H3', semester: 5, section: 'B', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H4', semester: 5, section: 'B', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-H5', semester: 5, section: 'B', day: 'Thursday', startTime: '13:30', endTime: '15:30', courseId: 'BAI505L', courseName: 'ML Lab (NI / SN / SK)', facultyName: 'Mrs. Shweta Naik / Nitesh / Ms. Shreekshitha', room: 'AI Lab', type: 'lab' },
    { id: '5B-H6', semester: 5, section: 'B', day: 'Thursday', startTime: '15:30', endTime: '16:30', courseId: 'BAI503T', courseName: 'Automata Theory (Tutorial)', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'tutorial' },
    { id: '5B-F1', semester: 5, section: 'B', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
    { id: '5B-F2', semester: 5, section: 'B', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'TUT', courseName: 'Tutorial Hour', facultyName: 'Course Faculty', room: 'Room 407', type: 'tutorial' },
    { id: '5B-F3', semester: 5, section: 'B', day: 'Friday', startTime: '10:45', endTime: '11:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mrs. Chaitrika Aditya (CA)', room: 'Room 407', type: 'lecture' },
    { id: '5B-F4', semester: 5, section: 'B', day: 'Friday', startTime: '11:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-F5', semester: 5, section: 'B', day: 'Friday', startTime: '13:30', endTime: '15:30', courseId: 'BAI501G', courseName: 'CV Lab (CA / AK)', facultyName: 'Mrs. Chaitrika Aditya / Mr. Ashok', room: 'Computer Vision Lab', type: 'lab' },
    { id: '5B-F6', semester: 5, section: 'B', day: 'Friday', startTime: '15:30', endTime: '16:30', courseId: 'BAI504T', courseName: 'Machine Learning (Tutorial)', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'tutorial' },
    { id: '5B-S1', semester: 5, section: 'B', day: 'Saturday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Mrs. Sangeetha M S (SM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-S2', semester: 5, section: 'B', day: 'Saturday', startTime: '09:30', endTime: '10:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Mr. Ranjith (RJ)', room: 'Room 407', type: 'lecture' },
    { id: '5B-S3', semester: 5, section: 'B', day: 'Saturday', startTime: '10:45', endTime: '11:45', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Anmol (AM)', room: 'Room 407', type: 'lecture' },
    { id: '5B-S4', semester: 5, section: 'B', day: 'Saturday', startTime: '11:45', endTime: '12:45', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Mrs. Shweta Naik (SN)', room: 'Room 407', type: 'lecture' },
  ],
  '5C': [
    { id: '5C-M1', semester: 5, section: 'C', day: 'Monday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mr. Ashok (AK)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M2', semester: 5, section: 'C', day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M3', semester: 5, section: 'C', day: 'Monday', startTime: '10:45', endTime: '11:45', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M4', semester: 5, section: 'C', day: 'Monday', startTime: '11:45', endTime: '12:45', courseId: 'BBS509TK', courseName: 'Environmental Studies', facultyName: 'Ms. Monisha (MO)', room: 'Room 314', type: 'lecture' },
    { id: '5C-M5', semester: 5, section: 'C', day: 'Monday', startTime: '13:30', endTime: '15:30', courseId: 'BAI501G', courseName: 'CV Lab (AK / SO)', facultyName: 'Mr. Ashok / Ms. Soumya', room: 'Computer Vision Lab', type: 'lab' },
    { id: '5C-M6', semester: 5, section: 'C', day: 'Monday', startTime: '15:30', endTime: '17:30', courseId: 'REM', courseName: 'Remedial Class', facultyName: 'Course Faculty', room: 'Room 314', type: 'remedial' },
    { id: '5C-T1', semester: 5, section: 'C', day: 'Tuesday', startTime: '08:30', endTime: '10:30', courseId: 'BAI505L', courseName: 'ML Lab (SM / SR / NI)', facultyName: 'Dr. Sadhana Rai / Mrs. Sangeetha / Mr. Nitesh', room: 'AI Lab 3', type: 'lab' },
    { id: '5C-T2', semester: 5, section: 'C', day: 'Tuesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Dr. Jayashree T R (JTR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-T3', semester: 5, section: 'C', day: 'Tuesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 314', type: 'lecture' },
    { id: '5C-T4', semester: 5, section: 'C', day: 'Tuesday', startTime: '13:30', endTime: '15:30', courseId: 'PRAC', courseName: '10 Seconds Practice Session', facultyName: 'Training Team', room: 'Seminar Hall', type: 'skill' },
    { id: '5C-T5', semester: 5, section: 'C', day: 'Tuesday', startTime: '15:30', endTime: '16:30', courseId: 'MENT', courseName: 'Student Mentoring', facultyName: 'Mr. Ashok', room: 'Room 314', type: 'mentoring' },
    { id: '5C-W1', semester: 5, section: 'C', day: 'Wednesday', startTime: '08:30', endTime: '09:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W2', semester: 5, section: 'C', day: 'Wednesday', startTime: '09:30', endTime: '10:30', courseId: 'BBS508AK', courseName: 'Research Methodology and IPR', facultyName: 'Dr. Gurusiddayya H (GH)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W3', semester: 5, section: 'C', day: 'Wednesday', startTime: '10:45', endTime: '11:45', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W4', semester: 5, section: 'C', day: 'Wednesday', startTime: '11:45', endTime: '12:45', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W5', semester: 5, section: 'C', day: 'Wednesday', startTime: '13:30', endTime: '14:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Dr. Jayashree T R (JTR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-W6', semester: 5, section: 'C', day: 'Wednesday', startTime: '14:30', endTime: '16:30', courseId: 'PRAC', courseName: '10 Secs Practice Session', facultyName: 'Training Cell', room: 'Auditorium', type: 'skill' },
    { id: '5C-H1', semester: 5, section: 'C', day: 'Thursday', startTime: '08:30', endTime: '09:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H2', semester: 5, section: 'C', day: 'Thursday', startTime: '09:30', endTime: '10:30', courseId: 'BAI503T', courseName: 'Automata Theory and Computability', facultyName: 'Ms. Deeksha J S (DJ)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H3', semester: 5, section: 'C', day: 'Thursday', startTime: '10:45', endTime: '11:45', courseId: 'MENT', courseName: 'Mentoring Session', facultyName: 'Class Mentor', room: 'Room 314', type: 'mentoring' },
    { id: '5C-H4', semester: 5, section: 'C', day: 'Thursday', startTime: '11:45', endTime: '12:45', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mr. Ashok (AK)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H5', semester: 5, section: 'C', day: 'Thursday', startTime: '13:30', endTime: '14:30', courseId: 'BAI504T', courseName: 'Machine Learning', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H6', semester: 5, section: 'C', day: 'Thursday', startTime: '14:30', endTime: '15:30', courseId: 'BAI502G', courseName: 'Computer Network and its Applications', facultyName: 'Dr. Jayashree T R (JTR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-H7', semester: 5, section: 'C', day: 'Thursday', startTime: '15:30', endTime: '16:30', courseId: 'BAI504T', courseName: 'Machine Learning (Tutorial)', facultyName: 'Dr. Sadhana Rai (SR)', room: 'Room 314', type: 'tutorial' },
    { id: '5C-F1', semester: 5, section: 'C', day: 'Friday', startTime: '08:30', endTime: '09:30', courseId: 'BAI501G', courseName: 'Computer Vision', facultyName: 'Mr. Ashok (AK)', room: 'Room 314', type: 'lecture' },
    { id: '5C-F2', semester: 5, section: 'C', day: 'Friday', startTime: '09:30', endTime: '10:30', courseId: 'BAI506E2', courseName: 'Intelligent Process Automation', facultyName: 'Mr. Sharathchandra N R (SNR)', room: 'Room 314', type: 'lecture' },
    { id: '5C-F3', semester: 5, section: 'C', day: 'Friday', startTime: '10:45', endTime: '12:45', courseId: 'BAI502G', courseName: 'CN Lab (JTR / RS)', facultyName: 'Dr. Jayashree / Mrs. Rajeshwari', room: 'Networks Lab', type: 'lab' },
    { id: '5C-F4', semester: 5, section: 'C', day: 'Friday', startTime: '13:30', endTime: '15:30', courseId: 'BAI507P', courseName: 'Mini-Project Work', facultyName: 'Project Guides', room: 'Project Lab', type: 'project' },
    { id: '5C-F5', semester: 5, section: 'C', day: 'Friday', startTime: '15:30', endTime: '16:30', courseId: 'TUT', courseName: 'Tutorial Hour', facultyName: 'Course Faculty', room: 'Room 314', type: 'tutorial' },
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
