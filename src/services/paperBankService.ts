import { paperBankGroups, type SubjectPaperGroup, type PreviousYearPaper } from '../data/paperBank';
import type { AuthUser } from './authService';

const PAPER_BANK_STORAGE_KEY = 'acadexa_paper_bank_groups_v1';

// Convert base64 data URL to Blob
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].replace('data:', '') || 'application/pdf';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

// Generate an authentic PDF Blob for seed papers that don't have stored base64 payloads
function generateAcademicPaperPdfBlob(paper: PreviousYearPaper): Blob {
  const sanitize = (text: string) => text.replace(/[()\\\/]/g, ' ');
  const examLabel =
    paper.examType === 'end-sem'
      ? 'SEMESTER END EXAMINATION'
      : paper.examType === 'mid-sem'
      ? 'MID SEMESTER EXAMINATION'
      : 'CONTINUOUS INTERNAL EVALUATION';

  // Construct valid PDF byte stream (PDF 1.4 specification)
  const lines: string[] = [
    `%PDF-1.4`,
    `%`,
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj`,
    `4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`,
    `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
  ];

  // Content stream text
  const textCommands = [
    `BT`,
    `/F1 15 Tf 50 740 Td (ACADEXA INSTITUTE OF TECHNOLOGY & HIGHER STUDIES) Tj`,
    `/F1 11 Tf 0 -22 Td (DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING) Tj`,
    `/F2 10 Tf 0 -18 Td (${sanitize(examLabel)} - ACADEMIC YEAR ${sanitize(paper.year)}) Tj`,
    `/F1 10 Tf 0 -20 Td (Course: ${sanitize(paper.subject)} [${sanitize(paper.subjectCode)}]) Tj`,
    `/F2 9 Tf 0 -16 Td (Semester: ${sanitize(paper.semester)}    |    Duration: ${sanitize(paper.duration)}    |    Max Marks: ${paper.totalMarks}) Tj`,
    `/F2 8 Tf 0 -14 Td (Faculty Uploaded by: ${sanitize(paper.uploadedBy)}    |    Date: ${paper.uploadedAt}) Tj`,
    `0 -10 Td (________________________________________________________________________________________) Tj`,
    `/F1 10 Tf 0 -22 Td (INSTRUCTIONS TO CANDIDATES:) Tj`,
    `/F2 9 Tf 0 -14 Td (1. Answer all questions from Part-A and any four full questions from Part-B.) Tj`,
    `0 -12 Td (2. Illustrate your answers with neat diagrams and pseudo-code wherever necessary.) Tj`,
    `0 -12 Td (3. Assume suitable missing data if any, and state your assumptions clearly.) Tj`,
    `0 -10 Td (________________________________________________________________________________________) Tj`,
    `/F1 11 Tf 0 -24 Td (PART - A  [Compulsory Conceptual Questions - 20 Marks]) Tj`,
    `/F2 9 Tf 0 -16 Td (Q1. Explain the fundamental principles and asymptotic complexity for ${sanitize(paper.tags[0] || 'Core Structures')}.) Tj`,
    `0 -15 Td (Q2. Compare and contrast iterative versus recursive formulations with state stack analysis.) Tj`,
    `0 -15 Td (Q3. Formulate the boundary constraints and edge case invariants for ${sanitize(paper.tags[1] || 'Key Algorithms')}.) Tj`,
    `0 -15 Td (Q4. State the trade-offs between memory footprint and execution runtime across target architectures.) Tj`,
    `/F1 11 Tf 0 -26 Td (PART - B  [Analytical and Problem Solving Questions - 80 Marks]) Tj`,
    `/F2 9 Tf 0 -18 Td (Q5. (a) Design an optimal algorithm for ${sanitize(paper.tags[2] || 'Unit Analysis')} with rigorous proof of correctness.) Tj`,
    `0 -15 Td (    (b) Trace the step-by-step state execution on an input array of size N = 16.) Tj`,
    `0 -18 Td (Q6. (a) Analyze worst-case and amortized bounds for ${sanitize(paper.tags[0] || 'Topics')} operations.) Tj`,
    `0 -15 Td (    (b) Propose an auxiliary storage strategy to minimize dynamic cache miss ratios.) Tj`,
    `0 -18 Td (Q7. (a) Construct a formal model addressing the synchronization and concurrency constraints.) Tj`,
    `0 -15 Td (    (b) Provide detailed comparative complexity tables for balanced and unbalanced states.) Tj`,
    `0 -18 Td (Q8. (a) Formulate the dynamic programming or greedy optimal substructure equations.) Tj`,
    `0 -15 Td (    (b) Demonstrate optimal schedule construction using the given state transition matrix.) Tj`,
    `0 -25 Td (________________________________________________________________________________________) Tj`,
    `/F2 8 Tf 0 -14 Td (*** END OF QUESTION PAPER - ACADEXA ACADEMIC REPOSITORY ***) Tj`,
    `ET`,
  ].join('\n');

  const streamContent = textCommands;
  const streamLength = streamContent.length;

  lines.push(`6 0 obj << /Length ${streamLength} >> stream`);
  lines.push(streamContent);
  lines.push(`endstream endobj`);

  // Cross-reference table
  const bodyText = lines.join('\n') + '\n';
  const xrefOffset = bodyText.length;

  const fullPdf = [
    bodyText,
    `xref`,
    `0 7`,
    `0000000000 65535 f `,
    `0000000015 00000 n `,
    `0000000074 00000 n `,
    `0000000133 00000 n `,
    `0000000281 00000 n `,
    `0000000360 00000 n `,
    `0000000434 00000 n `,
    `trailer << /Size 7 /Root 1 0 R >>`,
    `startxref`,
    `${xrefOffset}`,
    `%%EOF`,
  ].join('\n');

  return new Blob([fullPdf], { type: 'application/pdf' });
}

export const paperBankService = {
  getGroups: (): SubjectPaperGroup[] => {
    try {
      const stored = localStorage.getItem(PAPER_BANK_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse paper bank from localStorage:', e);
    }
    // Initialize default seed groups
    localStorage.setItem(PAPER_BANK_STORAGE_KEY, JSON.stringify(paperBankGroups));
    return paperBankGroups;
  },

  saveGroups: (groups: SubjectPaperGroup[]): void => {
    try {
      localStorage.setItem(PAPER_BANK_STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {
      console.warn('Failed to save paper bank groups:', e);
    }
  },

  uploadPaper: async (
    data: {
      file: File;
      subject: string;
      subjectCode: string;
      semester: string;
      year: string;
      examType: 'mid-sem' | 'end-sem' | 'internal';
      totalMarks: number;
      duration: string;
      questionCount: number;
      tags: string[];
    },
    facultyUser?: AuthUser | null
  ): Promise<{ paper: PreviousYearPaper; groups: SubjectPaperGroup[] }> => {
    // 1. Validation
    if (!data.file) {
      throw new Error('Please select a question paper file.');
    }

    const isPdf =
      data.file.type === 'application/pdf' ||
      data.file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      throw new Error('Only PDF files (.pdf) are supported for question paper bank uploads.');
    }

    const maxSizeInBytes = 25 * 1024 * 1024; // 25 MB
    if (data.file.size > maxSizeInBytes) {
      throw new Error('File exceeds maximum allowed size of 25 MB.');
    }

    if (!data.subject.trim() || !data.subjectCode.trim()) {
      throw new Error('Subject name and Subject Code are required.');
    }

    // 2. Read file to Base64 data URL
    const fileData: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read uploaded file.'));
      reader.readAsDataURL(data.file);
    });

    // Format human-readable file size
    const sizeInKb = Math.round(data.file.size / 1024);
    const fileSizeFormatted =
      sizeInKb >= 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    // 3. Construct new paper object
    const newPaper: PreviousYearPaper = {
      id: `p_up_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subject: data.subject.trim(),
      subjectCode: data.subjectCode.trim().toUpperCase(),
      semester: data.semester.trim() || '5th Sem',
      year: data.year.trim() || `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
      examType: data.examType,
      totalMarks: Number(data.totalMarks) || 100,
      duration: data.duration.trim() || '3 Hours',
      questionCount: Number(data.questionCount) || 10,
      uploadedBy: facultyUser?.name || 'Dr. Ramesh Kumar (Faculty)',
      uploadedAt: new Date().toISOString().split('T')[0],
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Unit Topics', 'Model Exam'],
      fileSize: fileSizeFormatted,
      fileName: data.file.name,
      fileData,
      fileType: 'application/pdf',
    };

    // 4. Update groups in storage
    const currentGroups = paperBankService.getGroups();
    const existingGroupIndex = currentGroups.findIndex(
      g => g.subjectCode.toLowerCase() === newPaper.subjectCode.toLowerCase()
    );

    let updatedGroups: SubjectPaperGroup[];
    if (existingGroupIndex >= 0) {
      updatedGroups = currentGroups.map((g, idx) => {
        if (idx === existingGroupIndex) {
          return {
            ...g,
            papers: [newPaper, ...g.papers],
          };
        }
        return g;
      });
    } else {
      // New subject group
      const newGroup: SubjectPaperGroup = {
        subject: newPaper.subject,
        subjectCode: newPaper.subjectCode,
        semester: newPaper.semester,
        accentColor: '#4f46e5',
        papers: [newPaper],
      };
      updatedGroups = [newGroup, ...currentGroups];
    }

    paperBankService.saveGroups(updatedGroups);

    return { paper: newPaper, groups: updatedGroups };
  },

  downloadPaper: async (paper: PreviousYearPaper): Promise<void> => {
    let blob: Blob;
    let filename = paper.fileName;

    if (!filename) {
      const sanitizedSubject = paper.subjectCode.replace(/[^a-zA-Z0-9]/g, '_');
      const sanitizedYear = paper.year.replace(/[^a-zA-Z0-9]/g, '_');
      filename = `${sanitizedSubject}_${paper.examType.toUpperCase()}_${sanitizedYear}.pdf`;
    }

    if (paper.fileData && paper.fileData.startsWith('data:')) {
      try {
        blob = dataUrlToBlob(paper.fileData);
      } catch (e) {
        console.warn('Error parsing stored file data, falling back to structured PDF:', e);
        blob = generateAcademicPaperPdfBlob(paper);
      }
    } else {
      // Real PDF blob for default examination papers
      blob = generateAcademicPaperPdfBlob(paper);
    }

    // Trigger browser download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  },

  downloadBulkPapers: async (papers: PreviousYearPaper[]): Promise<number> => {
    if (!papers || papers.length === 0) return 0;

    for (let i = 0; i < papers.length; i++) {
      await paperBankService.downloadPaper(papers[i]);
      // Small pause between multiple trigger clicks so browser allows consecutive downloads
      if (i < papers.length - 1) {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    return papers.length;
  },
};
