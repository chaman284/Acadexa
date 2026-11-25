// ============================================
// CHAT DISPLAY FORMATTING
// ============================================

/**
 * Chat replies arrive as markdown (bold `**`, headings `###`, links, etc.)
 * but the chat window renders plain text. Convert them to clean readable text
 * so raw markdown markers never appear in the UI.
 */
export function stripChatMarkdown(content: string): string {
  if (!content) return '';

  return content
    // [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Bold: **text** and __text__ (allow line breaks inside)
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/__([\s\S]*?)__/g, '$1')
    // Italic: *text* (single markers only; underscores are left alone for identifiers)
    .replace(/\*([^*\n]+)\*/g, '$1')
    // Markdown headings and blockquotes -> plain text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    // Code fences / inline code backticks
    .replace(/```[\w-]*/g, '')
    .replace(/`/g, '')
    // Safety net for any unpaired double markers from malformed replies
    .replace(/\*\*|__/g, '');
}
