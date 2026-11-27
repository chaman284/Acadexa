# Computer Vision Tutor Pipeline

Fine-grained retrieval + memory for VTU 5th-semester Computer Vision. The tutor answers only what was asked from 1–3 small note chunks, and resolves short follow-ups such as `yes`, `haa`, `ok`, `yes bro send`, `send example`, `sure pls`, `formula`, `why?` and `and CMOS?`. Meta questions and casual acknowledgements are answered from fixed templates without retrieval, and meta turns leave the pending offer untouched. Accepted offers are fulfilled with only the offered content; the definition is not repeated. Topic switches close the current offer, clear stale concepts/examples, and never reuse another topic's material. There is no dead-end "I don't have another chunk" reply: if nothing new is left, the tutor offers a different action.

## What lives where

| Path | Purpose |
| --- | --- |
| `src/services/tutorTypes.ts` | Shared chunk, intent, memory and debug types |
| `src/services/textUtils.ts` | Normalisation/tokenisation shared by retrieval and answers |
| `src/services/messageNorms.ts` | Chat typo/slang normalisation and token-level fuzzy phrase matching |
| `src/services/embeddings.ts` | Gemini `text-embedding-004`, with deterministic local fallback |
| `src/services/chunkStore.ts` | JSON source of truth + raw-SQL Postgres load/seed |
| `scripts/ingestChunks.ts` | `npm run ingest`: clean-split, validate, embed, write JSON, seed DB |
| `src/services/curriculumRetrieval.ts` | rewrite → intent → aliases → BM25 + embeddings (RRF) → boosts → rerank → threshold → topic-scoped example selection |
| `src/services/topicMetadata.ts` | Topic titles, aliases and short labels from chunk metadata; topic-switch and bare-topic detection |
| `src/services/tutorMemory.ts` | Per-session last 8 messages + `last_topic_id`, `last_concept`, `last_intent`, `pending_offer`, `shown_chunks`, last offer text/kind |
| `src/services/tutorAnswer.ts` | Local fallback answer engine with strict answer scope, topic-switch confirmation and fresh variants |
| `src/services/tutorPrompt.ts` | Final Gemini system prompt and few-shot examples |
| `prisma/data/chunks.json` | Generated 82 fine-grained chunks |
| `prisma/data/chunkEmbeddings.json` | Generated embeddings keyed by `chunk_id` |
| `prisma/data/tutorDebugExamples.md` | Eight regression groups, fixes and captured logs |
| `src/services/tutorRetrieval.test.ts` | 64 deterministic single- and multi-turn cases |

## Run it

From `server/`:

```powershell
npm install
npx prisma migrate deploy
npm run ingest
npm run test:tutor
npx tsc --noEmit
```

`npm run ingest` prints a validation table (id, type, word count, flags), writes `prisma/data/chunks.json` and `prisma/data/chunkEmbeddings.json`, then seeds the `CurriculumChunk` table. Use `npm run ingest -- --no-seed` to regenerate JSON only.

`npm run test:tutor` forces local embeddings, so it makes no network or database calls. Current result: **64/64 passed**. Every answer is also asserted not to contain the dead-end "I don't have another chunk" text.

The dev server uses the same pipeline through `POST /api/chatbot`. Session memory is keyed by the JWT user id (`req.user.id`), so no frontend change is needed. The original student message stays in chat history; the rewritten question is used only for retrieval and the LLM prompt.

## Configuration

Set these in `server/.env` (see `.env.example`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `TUTOR_RELEVANCE_THRESHOLD` | `0.35` | Fraction of the best rerank score required to keep extra chunks. Raise it to be stricter. |
| `TUTOR_MAX_CHUNKS` | `3` | Hard cap for explanation-type answers; formula/difference/MCQ have their own caps. |
| `TUTOR_DEBUG` | `false` | Logs the full `RetrievalDebug` JSON: rewrite, intent, followup/declined flags, focus concept, pending offer, concepts, ranked scores, kept ids, decision. |
| `TUTOR_USE_GEMINI_EMBEDDINGS` | `true` | Set to `false` for offline/hashed embeddings. Always used by the tests. |
| `GEMINI_API_KEY` | — | Enables Gemini embeddings and the Gemini final-answer path. Without it, the local answer engine is used. |
| `MODEL_NAME` | `''` | Optional. When set, the meta answer may name the model. Otherwise it says only that the provider trained it on general text and that training-data details are unavailable. |

Useful debug command:

```powershell
$env:TUTOR_DEBUG='true'; $env:TUTOR_USE_GEMINI_EMBEDDINGS='false'; npx ts-node --transpile-only src/services/tutorRetrieval.test.ts
```

## Retrieval behaviour

1. **Rewrite** — short replies become standalone questions using the current state and pending offer. When an answer ends with an offer, `pending_offer` is stored as `example`, `numerical`, `formula`, `comparison`, `quiz` or `exam_question`; filler words (`bro`, `da`, `pls`, `please`, `hey`, `hi`) are stripped before intent classification. A short affirmative (`yes`, `yeah`, `yep`, `yup`, `haa`, `haan`, `ha`, `hmm yes`, `ya`, `ok`, `k`, `kk`, `sure`, `send`, …) resolves the offer directly: `numerical` + `Digital Image Processing` → `Give a numerical example on Digital Image Processing.`. A short negative (`no`, `nope`, `noo`, `later`, `that's all`) closes the offer with no retrieval. `messageNorms.ts` lowercases, collapses repeated letters (`nooo` → `no`, `haaa` → `haa`), maps `u`/`r`/`ur`/`wht`/`gud`/`goof`, and uses token-level fuzzy matching (edit distance ≤ 1–2). Multi-word phrases must have the same word count, so `ok` stays affirmative instead of matching `ok cool`.
2. **Intent priority** — `meta` → topic-switch → negative/close → `clarification` → `acknowledgement` → affirmative to `pending_offer` → normal question. Out-of-scope is decided only for normal questions. Intent values are `definition`, `explanation`, `formula`, `numerical`, `example`, `difference`, `exam_question`, `mcq_quiz`, `common_mistakes`, `application`, `advantages`, `out_of_scope`, `chitchat`, `topic_switch`, `meta`, `acknowledgement`, `clarification`.
3. **Aliases/entities** — longest exact phrase wins (`DIP` → digital image processing, `CCD`/`CMOS`, `pixel`, etc.).
4. **Hybrid search** — BM25 over text + keywords + aliases, combined with embeddings via reciprocal-rank fusion.
5. **Boosts/rerank** — type, section/subsection, exact-phrase and topic boosts; formulas are concept-guarded so an unrelated formula is never substituted.
6. **Threshold** — a weak lexical **and** weak vector signal produces `no_match` instead of a plausible-looking wrong answer from another topic.
7. **Answer** — at most 3 chunks go to the prompt/local engine; definitions get 1–3 sentences, explanations 4–6, and no unsolicited numericals, MCQs or exam points.
8. **State** — after every reply, the live route calls `deriveTurnState()` with the chunks that actually built that reply. `last_topic_id`, `last_concept` and `pending_offer` therefore describe what was answered, not what was asked. Tests call the same helper.

## Topic switching and repeated content

- `"other topic"`, `"next topic"`, `"something else"` and `"change topic"` close the pending offer and do no retrieval. With no topic named, the reply is exactly `Sure! Which topic? Intro to DIP, Visual Perception, or Image Sensing and Acquisition?` — the tutor never picks silently.
- A bare topic name such as `"image acquisition"` switches to that topic. A real question such as `"what is image acquisition?"` still stays a definition request. Topic names and aliases come from `topicMetadata.ts`, so new topics work without code changes.
- A named switch retrieves only that topic's `topic_definition`, clears `last_concept`, `pending_offer`, `shown_chunks` and the previous offer. Follow-ups are built only from the current state and are asserted in tests to contain the current `last_concept`.
- Generic examples prefer the current topic's `Simple Explanation` chunk; numericals prefer its `worked_example`. The CV-M1-03 numerical is the 640×480, 8-bit, 300 KB storage example, and its generic example is the smartphone camera example — never a DIP example.
- `shown_chunks` tracks ids already shown per topic. If the same example or numerical is requested again, the tutor selects another chunk from that topic or recomputes the worked example with different values. The follow-up offer also changes so the same offer text is not repeated twice in a row. Generic quiz requests choose that topic's MCQs in note order and skip ids already shown.

## Meta, acknowledgements and empty states

- `meta` covers questions about the tutor itself: `what data are you trained on`, `who are you`, `who made you`, `which model`, `what can you do`, `how do you work`, `are you chatgpt`, `can you see my notes`, plus typo forms such as `wht data u r trained on?`. It is checked before any offer/follow-up handling, retrieves nothing, and uses the fixed honest template in `tutorAnswer.metaAnswer()`. `deriveTurnState({ preserveState: true })` keeps `pending_offer`, `last_concept` and `shown_chunks` unchanged; a later `yes` still resolves the original offer. No model name or training dataset is claimed unless `MODEL_NAME` is configured.
- `acknowledgement` covers `good`, `goof`, `gud`, `nice`, `great`, `cool`, `thanks`, `thank you`, `ok cool`, `got it`, `awesome`, `super` and `everything okay`. It returns one friendly line plus a next step, retrieves nothing, never repeats the previous answer, and clears the pending offer only when it was an unaccepted `quiz` offer.
- `clarification` (`wht?`, `huh?`, `sorry`, `come again`) asks one short question without retrieval.
- The old `"I don't have another chunk for ..."` fallback was removed from `tutorAnswer.ts`. When no new chunk exists, `nextActionFallback()` offers a quiz, the formula, exam questions or another topic. Tests assert that no answer contains the dead-end text.

## Add a new topic

1. Add a JSON file under `prisma/data/notes/`, for example `cvModule2.json`, using the existing coarse shape:

```json
{
  "chunks": [
    {
      "id": "CV-M2-01-prerequisites",
      "topic_id": "CV-M2-01",
      "topic_title": "New Topic Title",
      "module": "Module 2",
      "section": "Prerequisites",
      "subsection": null,
      "keywords": ["keyword one", "two-word keyword"],
      "question_types": ["general"],
      "content": "Short note text."
    }
  ]
}
```

   Use these section names so the splitter can do its job: `Simple Explanation`, `Key Definitions and Terms` (one `Term: definition` per line), `Formulas / Algorithm Steps` (numbered, one formula per item), `Practice MCQs` (numbered, one MCQ per item), `Worked Example`, `Common Mistakes and Misconceptions`, `Important Exam Points`.

2. Run `npm run ingest`. It prefers `prisma/data/notes/*.json` over the generated `chunks.json`, creates `topic_definition`, `term_definition`, `formula`, `mcq` and `worked_example` chunks with unique ids, prepends a context header to `embedded_text`, and prints the validation table.

3. Add a few cases to `src/services/tutorRetrieval.test.ts` for the new topic and rerun `npm run test:tutor`.

If you prefer to hand-author fine-grained chunks, put them directly in `prisma/data/chunks.json` with all fields from `TutorChunk`; `npm run ingest` will treat them as already split and only regenerate embeddings/seed. Never reuse an existing `chunk_id`.

## Known constraints

- `prisma generate` fails on this machine because a Windows query-engine DLL is locked. Runtime code therefore reads/writes `CurriculumChunk` with parameterised raw SQL; no generated-client methods are used for this table.
- Session state is an in-process `Map`, so it resets on server restart. For durable, multi-instance state, add a `sessionId` column/table and persist the same `TutorState` shape.
