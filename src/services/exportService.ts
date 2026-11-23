import type { ExportFormat } from '../types/settings';

export type ExportRow = (string | number)[];

const escapeCsv = (value: string | number) => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Serialize tabular report data in the format chosen in Settings. */
export const serializeRows = (
  rows: ExportRow[],
  format: ExportFormat,
  meta: Record<string, unknown> = {},
) => {
  if (format === 'json') {
    return {
      content: JSON.stringify({ ...meta, exportedAt: new Date().toISOString(), rows }, null, 2),
      mime: 'application/json;charset=utf-8;',
      extension: 'json',
    };
  }
  return {
    content: '\uFEFF' + rows.map(row => row.map(escapeCsv).join(',')).join('\r\n'),
    mime: 'text/csv;charset=utf-8;',
    extension: 'csv',
  };
};

/** Build and download a report file using the user's preferred export format. */
export const downloadRows = (
  rows: ExportRow[],
  format: ExportFormat,
  baseName: string,
  meta: Record<string, unknown> = {},
) => {
  const { content, mime, extension } = serializeRows(rows, format, meta);
  const filename = `${baseName}_${new Date().toISOString().split('T')[0]}.${extension}`;
  const blob = new Blob([content], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  return filename;
};
