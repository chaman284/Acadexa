// Shared types for the fine-grained Computer Vision tutor pipeline.

export type ChunkType =
  | 'topic_definition'
  | 'term_definition'
  | 'explanation'
  | 'formula'
  | 'worked_example'
  | 'mistakes'
  | 'exam_points'
  | 'mcq';

export type Intent =
  | 'definition'
  | 'explanation'
  | 'formula'
  | 'numerical'
  | 'example'
  | 'difference'
  | 'exam_question'
  | 'mcq_quiz'
  | 'common_mistakes'
  | 'application'
  | 'advantages'
  | 'out_of_scope'
  | 'chitchat'
  | 'topic_switch'
  | 'meta'
  | 'acknowledgement'
  | 'clarification';

export interface TutorChunk {
  chunk_id: string;
  topic_id: string;
  topic_title: string;
  module: string;
  section: string;
  subsection: string | null;
  chunk_type: ChunkType;
  keywords: string[];
  aliases: string[];
  text: string;
  embedded_text: string;
  term?: string | null;
  definition?: string | null;
  linked_chunk_ids: string[];
  example_chunk_id?: string | null;
  word_count: number;
}

export interface ChatMessageItem {
  sender: 'user' | 'model' | 'assistant';
  text: string;
}

export type PendingOffer =
  | 'example'
  | 'numerical'
  | 'formula'
  | 'comparison'
  | 'quiz'
  | 'exam_question'
  | null;

export interface TutorState {
  last_topic_id?: string;
  last_concept?: string;
  last_intent?: Intent;
  pending_offer?: PendingOffer;
  /** chunk ids already shown, keyed by topic id */
  shown_chunks?: Record<string, string[]>;
  /** last offer text, so the same offer is not repeated twice in a row */
  last_offer_text?: string | null;
  last_offer_kind?: PendingOffer;
}

export interface RankedChunk {
  chunk: TutorChunk;
  bm25: number;
  embedding: number;
  rrf: number;
  metadata: number;
  exact: number;
  rerank: number;
}

export interface RetrievalDebug {
  original_message: string;
  rewritten_question: string;
  intent: Intent;
  followup: boolean;
  declined: boolean;
  focus_concept: string | null;
  pending_offer: PendingOffer;
  detected_concepts: string[];
  detected_topic_id: string | null;
  ranked: { chunk_id: string; chunk_type: ChunkType; scores: Omit<RankedChunk, 'chunk'> }[];
  kept_chunk_ids: string[];
  threshold: number;
  decision: 'kept' | 'below_threshold' | 'no_match' | 'skipped' | 'topic_switch';
  topic_switch?: boolean;
  topic_target?: string | null;
}

export interface RetrievalResult {
  chunks: TutorChunk[];
  rewrittenQuestion: string;
  intent: Intent;
  concepts: string[];
  topicId: string | null;
  focusConcept: string;
  followup: boolean;
  previousInScope: boolean;
  closing: boolean;
  declined: boolean;
  topicSwitch: boolean;
  topicSwitchTarget: string | null;
  /** the selected example/numerical was already shown, so give a variant */
  repeatContent: boolean;
  debug: RetrievalDebug;
}
