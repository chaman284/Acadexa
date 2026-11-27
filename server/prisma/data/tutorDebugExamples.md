# Tutor debug log — failures and topic-switch regressions found and fixed

Captured with `TUTOR_DEBUG=true`, `TUTOR_USE_GEMINI_EMBEDDINGS=false`, and `embeddings: {}` (local-only). Scores below are the values printed in `RetrievalDebug.ranked`.

---

## 1. Formula request lost its concept

**Student:** `formula for Michelson contrast`

**Before**
```json
{
  "rewritten_question": "Give the formula for this topic.",
  "intent": "formula",
  "kept_chunk_ids": ["CV-M1-02-formula-weber-s-law-for-brightness-discrimination"]
}
```
The short-reply rewrite pattern did not recognise `formula for ...` as a full question, and formula intent had no concept guard, so Weber's law was substituted.

**Fix**
- Anchored/expanded the short-reply recogniser and added `give formula` / `give the formula` handling in `rewriteQuery`.
- Added `matchesFormulaConcept()` so a `formula` or `numerical` question only keeps formula chunks whose term, subsection, aliases or keywords match the asked concept. Tokens like `imax`/`imin` are ignored because they appear in several formulas.

**After**
```json
{
  "rewritten_question": "formula for Michelson contrast",
  "intent": "formula",
  "detected_concepts": ["michelson contrast", "michelson", "contrast"],
  "kept_chunk_ids": ["CV-M1-02-formula-michelson-contrast"]
}
```
Answer now starts `Michelson Contrast: C = (I_max - I_min) / (I_max + I_min) ...`.

---

## 2. Unsupported topic retrieved a plausible chunk

**Student:** `what is edge detection?`

**Before**
```json
{
  "intent": "definition",
  "detected_concepts": [],
  "ranked": [
    {
      "chunk_id": "CV-M1-01-simple",
      "scores": { "bm25": 0, "embedding": 0.3259, "rrf": 0.0305, "metadata": 0.06, "rerank": 0.0905 }
    }
  ],
  "kept_chunk_ids": ["CV-M1-01-simple"],
  "decision": "kept"
}
```
Local embeddings gave a moderate similarity to the DIP overview even though no note token matched `edge detection`.

**Fix**
Added an evidence floor: `bm25 <= 0 && embedding < 0.5` means `no_match`.

**After**
```json
{
  "intent": "definition",
  "detected_concepts": [],
  "kept_chunk_ids": [],
  "decision": "no_match"
}
```
Answer: `That is not covered in your Computer Vision Module 1 notes...` plus a clearly labelled general note.

---

## 3. Follow-up formula on rods and cones fetched Weber's law

**Conversation:** `explain rods and cones` → `give formula`

**Before**
```json
{
  "original_message": "give formula",
  "rewritten_question": "Give an example of rods and cones.",
  "intent": "example",
  "kept_chunk_ids": ["CV-M1-02-rods-cones"]
}
```
Earlier variants rewrote to `Give the formula for this topic.` and returned the Weber formula. Both were wrong: the student asked for a formula of a concept that has none in these notes.

**Fix**
- `give formula` now rewrites to `Give the formula for rods and cones.`
- Formula guard rejects every formula chunk because none mentions rods/cones.

**After**
```json
{
  "rewritten_question": "Give the formula for rods and cones.",
  "intent": "formula",
  "detected_concepts": ["rods and cones", "cones", "rods"],
  "ranked": [],
  "kept_chunk_ids": [],
  "decision": "no_match"
}
```
Answer: `There is no specific formula for rods and cones in your notes...` — no Weber/DIP formula leaked in.

---

## 4. `and CMOS?` dropped the first sensor

**Conversation:** `what is CCD?` → `and CMOS?`

**Before**
```json
{
  "rewritten_question": "What is CMOS (compare with CCD)?",
  "intent": "difference",
  "detected_concepts": ["cmos", "ccd"],
  "ranked": [
    { "chunk_id": "CV-M1-03-term-cmos", "scores": { "rerank": 0.5282 } }
  ],
  "kept_chunk_ids": ["CV-M1-03-term-cmos"]
}
```
The old difference splitter removed `(compare with CCD)` before splitting, so CCD was never retrieved.

**Fix**
Added `differenceTerms()` which parses both `difference between X and Y` and `X (compare with Y)`, then retrieves the best chunk for each term and merges them.

**After**
```json
{
  "kept_chunk_ids": ["CV-M1-03-term-ccd", "CV-M1-03-term-cmos"]
}
```
Answer now gives both definitions and no `not covered` message.

---

## 5. `yes` after a definition produced a 4×4 numerical

**Conversation:** `what is a pixel?` → `yes`

**Before**
```json
{
  "rewritten_question": "Give a numerical on pixel.",
  "intent": "numerical",
  "kept_chunk_ids": ["CV-M1-01-example"],
  "answer": "Consider a grayscale digital image with a resolution of 4 x 4 pixels... Final Answer: 16 bytes"
}
```
The definition answer offered `an example or a quick numerical`; `offerFromAnswer()` saw `numerical on this` and stored `pending_offer: numerical` even though `example` appeared first.

**Fix**
- `offerFromAnswer()` picks the earliest offer in the answer text.
- Example answers now select sentence-level examples that mention the requested concept, instead of the first three sentences of the chunk.

**After**
```json
{
  "rewritten_question": "Give an example of pixel.",
  "intent": "example",
  "kept_chunk_ids": ["CV-M1-01-simple"],
  "ranked_top": {
    "chunk_id": "CV-M1-01-simple",
    "scores": { "bm25": 2.8323, "embedding": 0.2526, "rerank": 0.3272 }
  }
}
```
Answer: `A digital image consists of small elements called pixels. For example, a photograph taken with a mobile phone can be processed to improve brightness, remove unwanted noise...` — no `Final Answer`, no `16 bytes`.

---

---

## 6. `yes bro send` failed and `yes` repeated the definition

**Conversation:** `what is DIP?` → `yes` → `yes bro send`

**Before** — the first acceptance started by replaying the definition:

```json
{
  "stateBefore": {
    "last_topic_id": "CV-M1-01",
    "last_concept": "dip",
    "last_intent": "definition",
    "pending_offer": "example"
  },
  "rewrite": "Give an example of dip.",
  "intent": "example",
  "kept_chunk_ids": ["CV-M1-01-simple"],
  "answer": "Digital Image Processing (DIP) is the process of using computers to modify, improve, analyse and extract useful information from digital images. For example, a photograph taken with a mobile phone can be processed to improve brightness, remove unwanted noise, sharpen details ..."
}
```

The next acceptance was searched as raw text and fell outside the notes:

```json
{
  "stateBefore": {
    "last_topic_id": "CV-M1-01",
    "last_concept": "dip",
    "last_intent": "example",
    "pending_offer": "numerical"
  },
  "rewrite": "yes bro send",
  "intent": "definition",
  "concepts": [],
  "detected_concepts": [],
  "decision": "no_match",
  "kept_chunk_ids": [],
  "answer": "That is not covered in your Computer Vision Module 1 notes, so this answer is **not from your notes**.\nI can help with digital image processing, visual perception, image sensing and acquisition."
}
```

**Fix**
- `offerFromAnswer()` now parses `example`, `numerical`, `formula`, `comparison` and `quiz` from the final offer paragraph.
- `rewriteQuery()` strips fillers (`bro`, `da`, `pls`, `please`, `hey`, `hi`), and resolves short affirmatives/requests from `pending_offer` **before** retrieval. The display concept is stored as `Digital Image Processing`, not the lowercase alias `dip`.
- In-scope follow-ups no longer produce a `not covered` answer. Negative replies close the offer with no retrieval.
- Example answers selected in response to an accepted offer use only the sentence containing the example; the definition is not repeated.
- Prompt addition: “When the student accepts an offer, give ONLY what was offered. Do not repeat the definition or anything already said in this conversation.”

**After** — `yes` gives only the example:

```json
{
  "stateBefore": {
    "last_topic_id": "CV-M1-01",
    "last_concept": "Digital Image Processing",
    "last_intent": "definition",
    "pending_offer": "example"
  },
  "rewrite": "Give an example of Digital Image Processing.",
  "intent": "example",
  "followup": true,
  "focus_concept": "Digital Image Processing",
  "kept_chunk_ids": ["CV-M1-01-simple"],
  "answer": "For example, a photograph taken with a mobile phone can be processed to improve brightness, remove unwanted noise, sharpen details or identify objects.\n\nWant a numerical on this?"
}
```

`yes bro send` resolves the pending numerical directly:

```json
{
  "stateBefore": {
    "last_topic_id": "CV-M1-01",
    "last_concept": "Digital Image Processing",
    "last_intent": "example",
    "pending_offer": "numerical"
  },
  "rewrite": "Give a numerical example on Digital Image Processing.",
  "intent": "numerical",
  "followup": true,
  "previous_in_scope": true,
  "focus_concept": "Digital Image Processing",
  "detected_concepts": [
    "digital image processing",
    "image processing",
    "digital image",
    "processing",
    "digital",
    "image"
  ],
  "decision": "kept",
  "kept_chunk_ids": [
    "CV-M1-01-example",
    "CV-M1-01-formula-digital-image-representation"
  ],
  "answer": "Consider a grayscale digital image with a resolution of 4 x 4 pixels. Intensity matrix:\n0 50 100 150\n20 70 120 170\n40 90 140 190\n60 110 160 255\nStep 1: Rows = 4, Columns = 4.\nStep 2: Total pixels = 4 x 4 = 16.\nStep 3: For an 8-bit grayscale image, 0 <= f(x,y) <= 255, where 0 is black, 255 is white and intermediate values are shades of gray.\nStep 4: Each pixel requires 8 bits, so 16 x 8 = 128 bits = 128/8 = 16 bytes.\nFinal Answer: the image contains 16 pixels and requires 16 bytes of raw pixel storage, excluding file headers and metadata.\n\nWant a quick quiz on this?"
}
```

---

## 7. Stale state survived a topic switch

**Repro:** `what is DIP?` → `yes` → `yes` → `"noo.. other topic"` answered Image Sensing/Acquisition, then the next `yes` returned the DIP example, and the following `yes` returned the DIP 4×4 numerical instead of the 640×480 acquisition numerical.

**Causes**
- `rewriteQuery()` checked `pending_offer` before checking for a topic switch, so `"other topic"` was treated as an acceptance of the last offer.
- Follow-up concepts were recovered from older history, so a newly selected topic could inherit `Pixel` or `Digital Image Processing`.
- Example/numerical retrieval was not scoped to the current `last_topic_id`.
- State was inferred from the question instead of the chunks actually used to answer.

**Fixes**
- Added `topic_switch` intent and `src/services/topicMetadata.ts`. Topic-switch phrases and bare topic names are detected before closing/offer logic; a real question such as `"what is image acquisition?"` is still treated as a definition request.
- An unnamed switch asks exactly `Sure! Which topic? Intro to DIP, Visual Perception, or Image Sensing and Acquisition?` with no retrieval. It clears `last_concept`, `pending_offer`, `shown_chunks` and the last offer.
- A named switch resolves the target from chunk metadata and retrieves only that topic's `topic_definition`.
- `selectTopicExampleChunks()` scopes examples/numericals to the current topic, skips already-shown chunk ids, prefers the topic's `Simple Explanation` for a generic example and its `worked_example` for a numerical.
- `deriveTurnState()` is shared by the live route and tests; it derives state from the used chunks and verifies a concept against the used topic.
- `shown_chunks` and offer cycling prevent an identical example/numerical or offer from repeating; a repeated numerical is recomputed with fresh values.

**Captured logs** (local-only: `TUTOR_USE_GEMINI_EMBEDDINGS=false`, `embeddings: {}`; the `state` shown is the state after that turn):

### `what is DIP?` → `yes` → `yes` → `other topic`

```json
{
  "message": "other topic",
  "rewrite": "Switch to another topic.",
  "intent": "topic_switch",
  "topic_switch": true,
  "topic_target": null,
  "focus_concept": null,
  "kept_chunk_ids": [],
  "decision": "topic_switch",
  "answer": "Sure! Which topic? Intro to DIP, Visual Perception, or Image Sensing and Acquisition?",
  "state": {
    "last_intent": "topic_switch",
    "pending_offer": null,
    "shown_chunks": {},
    "last_offer_text": null,
    "last_offer_kind": null
  }
}
```

The old `Digital Image Processing` concept and the DIP example/numerical are gone; no chunks were retrieved.

### Named switch → `yes`

```json
{
  "message": "image acquisition",
  "rewrite": "Switch to Image Sensing and Acquisition.",
  "intent": "topic_switch",
  "topic_target": "CV-M1-03",
  "focus_concept": "Image Sensing and Acquisition",
  "kept_chunk_ids": ["CV-M1-03-topic-definition"],
  "decision": "topic_switch",
  "answer": "Sure, switching to Image Sensing and Acquisition. Image sensing and acquisition is the process of capturing an image from the real world and converting it into a digital image that a computer can understand and process. A camera captures light reflected from objects using an image sensor.\n\nWant an example?",
  "state": {
    "last_topic_id": "CV-M1-03",
    "last_concept": "Image Sensing and Acquisition",
    "pending_offer": "example"
  }
}
```

```json
{
  "message": "yes",
  "rewrite": "Give an example of Image Sensing and Acquisition.",
  "intent": "example",
  "focus_concept": "Image Sensing and Acquisition",
  "kept_chunk_ids": ["CV-M1-03-simple"],
  "decision": "kept",
  "answer": "In a smartphone, the lens focuses light onto an image sensor, and the signals become the final photograph. Image acquisition can be performed using cameras, scanners, satellite sensors, medical imaging devices and other sensing equipment.\n\nWant a numerical on this?",
  "state": {
    "last_topic_id": "CV-M1-03",
    "last_concept": "Image Sensing and Acquisition",
    "pending_offer": "numerical"
  }
}
```

The example is `CV-M1-03-simple` (smartphone camera), not the DIP photograph example.

### Next `yes` → the acquisition numerical

```json
{
  "message": "yes",
  "rewrite": "Give a numerical example on Image Sensing and Acquisition.",
  "intent": "numerical",
  "focus_concept": "Image Sensing and Acquisition",
  "kept_chunk_ids": ["CV-M1-03-example"],
  "decision": "kept",
  "answer": "A digital camera captures an image with dimensions 640 x 480 pixels. Each pixel is represented using 8 bits. Calculate the raw storage requirement.\nStep 1: M = 640, N = 480.\nStep 2: Total pixels = 640 x 480 = 307200.\nStep 3: Total bits = 307200 x 8 = 2457600 bits.\nStep 4: Bytes = 2457600/8 = 307200 bytes.\nStep 5: KB = 307200/1024 = 300 KB.\nFinal Answer: 300 KB of raw storage, excluding metadata and file-format overhead.\n\nWant a quick quiz on this?",
  "state": {
    "last_topic_id": "CV-M1-03",
    "last_concept": "Image Sensing and Acquisition",
    "pending_offer": "quiz"
  }
}
```

No `4 x 4` matrix or `16 bytes` from `CV-M1-01-example`.

### `what is a pixel?` → `next topic`

```json
{
  "message": "next topic",
  "rewrite": "Switch to another topic.",
  "intent": "topic_switch",
  "topic_switch": true,
  "topic_target": null,
  "focus_concept": null,
  "kept_chunk_ids": [],
  "decision": "topic_switch",
  "answer": "Sure! Which topic? Intro to DIP, Visual Perception, or Image Sensing and Acquisition?",
  "state": {
    "last_intent": "topic_switch",
    "pending_offer": null,
    "shown_chunks": {},
    "last_offer_text": null,
    "last_offer_kind": null
  }
}
```

The stale `Pixel` concept was cleared; the tutor asked which topic instead of guessing.

### DIP numerical → `noo`

```json
{
  "message": "noo",
  "rewrite": "noo",
  "intent": "chitchat",
  "kept_chunk_ids": [],
  "decision": "skipped",
  "answer": "No problem — ask me anytime.",
  "state": {
    "last_topic_id": "CV-M1-01",
    "last_intent": "chitchat",
    "pending_offer": null,
    "last_offer_text": null,
    "last_offer_kind": null
  }
}
```

### State after switching

```json
{
  "message": "image acquisition",
  "intent": "topic_switch",
  "topic_target": "CV-M1-03",
  "state": {
    "last_topic_id": "CV-M1-03",
    "last_concept": "Image Sensing and Acquisition",
    "pending_offer": "example",
    "shown_chunks": {
      "CV-M1-03": ["CV-M1-03-topic-definition"]
    }
  }
}
```

Neither `Digital Image Processing` nor `Pixel` survives the switch. The test suite also asserts that the rewritten follow-up always contains the current `last_concept`.

---

## 8. Meta questions, acknowledgements and the dead-end fallback

**Repro**

```text
(after a 640x480 / 300 KB numerical on Image Sensing and Acquisition)
"goof"                       -> "I don't have another chunk for Image Sensing and Acquisition ..."
"wht data u r trained on?"   -> "I don't have another chunk for Image Sensing and Acquisition ..."
(after "Want a numerical on this?")
"haa"                        -> the same dead-end message instead of the numerical
```

**Root cause**

Short replies were classified as normal follow-ups. With no fresh chunk left, `inScopeFallback()` returned a fixed dead-end sentence. Meta questions and acknowledgements also entered the offer/retrieval path, so a pending quiz or concept got in the way.

**Fix**

- Removed `inScopeFallback()` and the exact dead-end string. `nextActionFallback()` now offers a quiz, the formula, exam questions or another topic.
- Added `meta`, `acknowledgement` and `clarification` intents. Priority is `meta` → topic-switch → negative/close → clarification → acknowledgement → affirmative → normal question.
- Added `messageNorms.ts`: lowercase, repeated-letter collapse, slang map (`u`, `r`, `ur`, `wht`, `gud`, `goof`, `k`, `kk`) and token-level fuzzy matching. Multi-word phrases require the same word count, so `ok` remains an affirmative rather than matching `ok cool`.
- Meta uses the fixed honest template in `tutorAnswer.metaAnswer()`, retrieves nothing, and calls `deriveTurnState({ preserveState: true })`. A configured `MODEL_NAME` is the only way to name a model.
- An acknowledgement after an unaccepted quiz offer clears that offer; other acknowledgements answer in one friendly line without retrieval.
- A whole-topic definition now reports its own display concept (`CV-M1-03` → `Image Sensing and Acquisition`) instead of the ambiguous DIP component alias `Image Acquisition`. Generic quiz requests choose that topic's MCQs in note order, starting with `CV-M1-03-mcq-1`.

**After — captured local debug log** (`TUTOR_USE_GEMINI_EMBEDDINGS=false`, `embeddings: {}`; `ranked` omitted for `skipped` turns)

### Typed meta question with fresh state

```json
{
  "message": "wht data u r trained on?",
  "debug": {
    "original_message": "wht data u r trained on?",
    "rewritten_question": "wht data u r trained on?",
    "intent": "meta",
    "followup": false,
    "focus_concept": null,
    "pending_offer": null,
    "detected_concepts": [],
    "kept_chunk_ids": [],
    "decision": "skipped"
  },
  "state_before": { "pending_offer": null, "last_concept": null },
  "state_after": { "pending_offer": null, "last_concept": null },
  "answer": "I'm an AI tutor for your VTU Computer Vision course. I answer using the Module 1 notes loaded here ... The language model behind me was trained by its provider on general text, and I don't have details about that training data. ..."
}
```

`who are you?` and `what can you do?` produce the same `intent: "meta"`, `kept_chunk_ids: []`, `decision: "skipped"` result.

### Meta preserves a pending quiz offer

```json
{
  "message": "wht data u r trained on?",
  "debug": {
    "intent": "meta",
    "pending_offer": "quiz",
    "kept_chunk_ids": [],
    "decision": "skipped"
  },
  "state_before": {
    "pending_offer": "quiz",
    "last_concept": "Image Sensing and Acquisition",
    "last_topic_id": "CV-M1-03"
  },
  "state_after": {
    "pending_offer": "quiz",
    "last_concept": "Image Sensing and Acquisition",
    "last_topic_id": "CV-M1-03"
  }
}
```

The next `yes` still resolves the original offer:

```json
{
  "message": "yes",
  "debug": {
    "rewritten_question": "Give me a quiz on Image Sensing and Acquisition.",
    "intent": "mcq_quiz",
    "focus_concept": "Image Sensing and Acquisition",
    "pending_offer": "quiz",
    "kept_chunk_ids": ["CV-M1-03-mcq-1", "CV-M1-03-mcq-2"],
    "decision": "kept"
  },
  "state_after": { "pending_offer": "comparison", "last_concept": "Image Sensing and Acquisition" }
}
```

### `goof` after the numerical

```json
{
  "message": "goof",
  "debug": {
    "intent": "acknowledgement",
    "followup": false,
    "pending_offer": "quiz",
    "kept_chunk_ids": [],
    "decision": "skipped"
  },
  "state_before": { "pending_offer": "quiz", "last_concept": "Image Sensing and Acquisition" },
  "state_after": { "pending_offer": null, "last_concept": "Image Sensing and Acquisition" },
  "answer": "Glad it helped! Want to try a quiz, see the formula, or switch topic?"
}
```

No 640×480 text is repeated and no dead-end message is returned.

### `haa` after a numerical offer

```json
{
  "message": "haa",
  "debug": {
    "rewritten_question": "Give a numerical example on Digital Image Processing.",
    "intent": "numerical",
    "followup": true,
    "focus_concept": "Digital Image Processing",
    "pending_offer": "numerical",
    "kept_chunk_ids": ["CV-M1-01-example", "CV-M1-01-formula-digital-image-representation"],
    "decision": "kept"
  },
  "state_before": { "pending_offer": "numerical" },
  "state_after": { "pending_offer": "quiz", "last_concept": "Digital Image Processing" },
  "answer": "Consider a grayscale digital image with a resolution of 4 x 4 pixels ... Final Answer: the image contains 16 pixels and requires 16 bytes ... Want a quick quiz on this?"
}
```

Every captured answer passes the global assertion `!answer.includes("I don't have another chunk")`.

---

All eight regression groups are covered by `src/services/tutorRetrieval.test.ts`; current report: **64/64 passed**.
