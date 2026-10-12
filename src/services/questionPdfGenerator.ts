import type { Question } from '../types/quiz';

interface GeneratePdfOptions {
  title?: string;
  subtitle?: string;
  filterSummary?: string;
}

export const downloadQuestionsPdf = (
  questions: Question[],
  options: GeneratePdfOptions = {}
) => {
  if (!questions || questions.length === 0) {
    throw new Error('No questions available to download.');
  }

  const title = options.title || 'Acadexa Academic Question Bank';
  const subtitle = options.subtitle || 'Department of Computer Science & Engineering';
  const filterSummary = options.filterSummary || `Generated for ${questions.length} questions`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Build clean academic HTML
  const questionsHtml = questions
    .map((q, idx) => {
      const optionsHtml = q.options && q.options.length > 0
        ? `<div class="options-grid">
            ${q.options
              .map((opt, oIdx) => {
                const optLetter = String.fromCharCode(65 + oIdx);
                return `
                  <div class="option-item ${opt.isCorrect ? 'correct-option' : ''}">
                    <span class="opt-letter">(${optLetter})</span>
                    <span class="opt-text">${escapeHtml(opt.text)}</span>
                    ${opt.isCorrect ? '<span class="correct-badge">✓ Key</span>' : ''}
                  </div>
                `;
              })
              .join('')}
          </div>`
        : '';

      const explanationHtml = q.explanation
        ? `<div class="explanation-box">
            <strong>Solution Note:</strong> ${escapeHtml(q.explanation)}
          </div>`
        : '';

      return `
        <div class="question-card">
          <div class="question-header">
            <span class="q-number">Q${idx + 1}.</span>
            <div class="q-meta">
              <span class="tag subject-tag">${escapeHtml(q.courseName)}</span>
              <span class="tag unit-tag">${escapeHtml(q.unitName || 'Unit')}</span>
              <span class="tag topic-tag">${escapeHtml(q.topicName || 'Topic')}</span>
              <span class="tag exam-tag">${formatExamType(q.examType)}</span>
              <span class="tag marks-tag">[${q.marks || 2} Marks]</span>
            </div>
          </div>
          <div class="question-body">
            <p class="question-text">${escapeHtml(q.text)}</p>
            ${optionsHtml}
            ${explanationHtml}
          </div>
        </div>
      `;
    })
    .join('');

  const printableHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.5;
          margin: 0;
          padding: 20px;
          background: #fff;
          font-size: 13px;
        }
        .header-container {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .institution-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .institution-sub {
          font-size: 13px;
          color: #475569;
          margin: 2px 0 0 0;
        }
        .header-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .summary-banner {
          background: #f1f5f9;
          border-left: 4px solid #6366f1;
          padding: 8px 12px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #334155;
          display: flex;
          justify-content: space-between;
        }
        .question-card {
          margin-bottom: 18px;
          padding-bottom: 16px;
          border-bottom: 1px dashed #cbd5e1;
          page-break-inside: avoid;
        }
        .question-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }
        .q-number {
          font-weight: 800;
          font-size: 14px;
          color: #1e293b;
        }
        .q-meta {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 4px;
          font-size: 10px;
        }
        .tag {
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .subject-tag { background: #e0e7ff; color: #3730a3; }
        .unit-tag { background: #f1f5f9; color: #475569; }
        .topic-tag { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        .exam-tag { background: #fef3c7; color: #92400e; }
        .marks-tag { background: #dcfce7; color: #166534; font-weight: 700; }
        .question-text {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px 0;
        }
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 12px;
          margin-top: 6px;
        }
        .option-item {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .correct-option {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #065f46;
          font-weight: 600;
        }
        .opt-letter {
          font-weight: 700;
          color: #64748b;
        }
        .correct-badge {
          margin-left: auto;
          font-size: 10px;
          color: #059669;
          font-weight: 700;
        }
        .explanation-box {
          margin-top: 8px;
          padding: 6px 10px;
          background: #fafaf9;
          border-left: 3px solid #cbd5e1;
          font-size: 11px;
          color: #475569;
        }
        .footer-note {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div>
          <h1 class="institution-title">${escapeHtml(title)}</h1>
          <p class="institution-sub">${escapeHtml(subtitle)}</p>
        </div>
        <div class="header-meta">
          <p style="margin: 0;"><strong>Date:</strong> ${escapeHtml(dateStr)}</p>
          <p style="margin: 2px 0 0 0;"><strong>Total Questions:</strong> ${questions.length}</p>
        </div>
      </div>

      <div class="summary-banner">
        <span><strong>Selection:</strong> ${escapeHtml(filterSummary)}</span>
        <span>Acadexa Student Assessment Repository</span>
      </div>

      <div class="questions-container">
        ${questionsHtml}
      </div>

      <div class="footer-note">
        Page generated by Acadexa Learning Platform · Confidential for Academic Evaluation
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  // Open in a new hidden print window or pop-up
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Pop-up was blocked by the browser. Please allow pop-ups for PDF downloads.');
  }

  printWindow.document.open();
  printWindow.document.write(printableHtml);
  printWindow.document.close();
};

const escapeHtml = (str: string = ''): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatExamType = (type?: string): string => {
  switch (type) {
    case 'cie':
      return 'CIE / Internal';
    case 'see':
      return 'SEE / Semester End';
    case 'model':
      return 'Model Exam';
    case 'practice':
      return 'Practice Test';
    default:
      return 'Assessment';
  }
};
