// Local-only evaluation of the Computer Vision tutor pipeline.
// Run with: npm run test:tutor
// Uses deterministic local embeddings; no Gemini calls and no database.

process.env.TUTOR_USE_GEMINI_EMBEDDINGS = 'false';

import {
  classifyIntent,
  retrieveForMessage,
  rewriteQuery,
  type Intent,
} from './curriculumRetrieval';
import { loadChunksFromJson } from './chunkStore';
import { answerSentenceCount, buildLocalAnswer } from './tutorAnswer';
import { deriveTurnState } from './tutorMemory';
import type { ChatMessageItem, ChunkType, TutorState } from './tutorTypes';

interface SingleCase {
  name: string;
  message: string;
  intent: Intent;
  topic?: string;
  firstChunk?: string;
  includesChunks?: string[];
  types?: ChunkType[];
  answerIncludes?: string[];
  answerExcludes?: string[];
  maxSentences?: number;
  expectNoChunks?: boolean;
}

interface TurnExpectation {
  message: string;
  rewrite?: string;
  intent?: Intent;
  firstChunk?: string;
  includesChunks?: string[];
  answerIncludes?: string[];
  answerExcludes?: string[];
  expectNoChunks?: boolean;
  statePending?: TutorState['pending_offer'];
  stateConcept?: string;
  stateTopic?: string;
  stateConceptChanged?: boolean;
  stateConceptNot?: string[];
}

interface MultiCase {
  name: string;
  turns: TurnExpectation[];
}

const SINGLE_CASES: SingleCase[] = [
  {
    name: 'DIP full name gets its own topic definition',
    message: 'what is Digital Image Processing?',
    intent: 'definition',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-topic-definition',
    answerIncludes: ['Digital Image Processing (DIP)'],
    maxSentences: 6,
  },
  {
    name: 'DIP alias resolves to the same topic definition',
    message: 'what is DIP?',
    intent: 'definition',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-topic-definition',
    answerIncludes: ['Digital Image Processing (DIP)'],
    maxSentences: 6,
  },
  {
    name: 'visual perception definition stays in CV-M1-02',
    message: 'define visual perception.',
    intent: 'definition',
    topic: 'CV-M1-02',
    includesChunks: ['CV-M1-02-topic-definition'],
    maxSentences: 6,
  },
  {
    name: 'pixel term definition is returned alone',
    message: 'what is a pixel?',
    intent: 'definition',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-term-pixel',
    answerIncludes: ['smallest individual element'],
    maxSentences: 6,
  },
  {
    name: 'colour vision question returns cones, not a topic dump',
    message: 'which cells are responsible for color vision?',
    intent: 'definition',
    topic: 'CV-M1-02',
    includesChunks: ['CV-M1-02-rods-cones'],
    answerIncludes: ['cones'],
    maxSentences: 6,
  },
  {
    name: 'two-term definition merges both term chunks',
    message: 'what is sampling and quantization?',
    intent: 'definition',
    topic: 'CV-M1-03',
    includesChunks: ['CV-M1-03-term-sampling', 'CV-M1-03-term-quantization'],
    answerIncludes: ['Sampling:', 'Quantization:'],
    maxSentences: 6,
  },
  {
    name: 'CCD and CMOS definition retrieves both terms',
    message: 'what is CCD and CMOS?',
    intent: 'difference',
    topic: 'CV-M1-03',
    includesChunks: ['CV-M1-03-term-ccd', 'CV-M1-03-term-cmos'],
    maxSentences: 6,
  },
  {
    name: 'rods vs cones returns both isolated term definitions',
    message: 'difference between rods and cones',
    intent: 'difference',
    topic: 'CV-M1-02',
    includesChunks: ['CV-M1-02-term-rods', 'CV-M1-02-term-cones'],
    answerIncludes: ['Rods:', 'Cones:'],
    maxSentences: 6,
  },
  {
    name: 'differentiate sampling and quantization',
    message: 'differentiate sampling and quantization',
    intent: 'difference',
    topic: 'CV-M1-03',
    includesChunks: ['CV-M1-03-term-sampling', 'CV-M1-03-term-quantization'],
    maxSentences: 6,
  },
  {
    name: 'Michelson formula is one chunk',
    message: 'formula for Michelson contrast',
    intent: 'formula',
    topic: 'CV-M1-02',
    firstChunk: 'CV-M1-02-formula-michelson-contrast',
    answerIncludes: ['C = (I_max - I_min) / (I_max + I_min)'],
    maxSentences: 6,
  },
  {
    name: "Weber's law formula is one chunk",
    message: "state Weber's law",
    intent: 'formula',
    topic: 'CV-M1-02',
    firstChunk: 'CV-M1-02-formula-weber-s-law-for-brightness-discrimination',
    answerIncludes: ['ΔI / I = k'],
    maxSentences: 6,
  },
  {
    name: 'total pixels formula is one chunk',
    message: 'what is the formula for total pixels?',
    intent: 'formula',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-formula-total-pixels-m-x-n',
    maxSentences: 6,
  },
  {
    name: 'raw storage formula is one chunk',
    message: 'write the raw image storage formula.',
    intent: 'formula',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-formula-digital-image-representation',
    maxSentences: 6,
  },
  {
    name: 'Michelson numerical uses the student values',
    message: 'solve Michelson contrast with Imax 180 and Imin 60.',
    intent: 'numerical',
    topic: 'CV-M1-02',
    includesChunks: ['CV-M1-02-example', 'CV-M1-02-formula-michelson-contrast'],
    answerIncludes: ['180', '60', 'C = 0.50'],
  },
  {
    name: 'storage numerical returns 300 KB',
    message: 'storage of 640x480 8-bit image',
    intent: 'numerical',
    topic: 'CV-M1-01',
    answerIncludes: ['300 KB'],
  },
  {
    name: 'storage numerical returns 128 KB',
    message: 'find the raw storage for a 256 x 512 image with 8 bits per pixel.',
    intent: 'numerical',
    topic: 'CV-M1-03',
    answerIncludes: ['128 KB'],
  },
  {
    name: 'total pixels numerical returns 262144',
    message: 'calculate total pixels for a 512 x 512 image',
    intent: 'numerical',
    topic: 'CV-M1-01',
    answerIncludes: ['262144'],
  },
  {
    name: 'brightness adaptation explanation prefers its subsection',
    message: 'explain brightness adaptation.',
    intent: 'explanation',
    topic: 'CV-M1-02',
    firstChunk: 'CV-M1-02-adaptation',
    answerIncludes: ['adjust its sensitivity'],
    maxSentences: 6,
  },
  {
    name: 'objectives explanation stays in DIP topic',
    message: 'explain the objectives of digital image processing.',
    intent: 'explanation',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-objectives',
    maxSentences: 6,
  },
  {
    name: 'image acquisition process stays in CV-M1-03',
    message: 'describe the image acquisition process.',
    intent: 'explanation',
    topic: 'CV-M1-03',
    answerIncludes: ['sensor', 'image'],
    maxSentences: 6,
  },
  {
    name: 'contrast sensitivity question stays on contrast',
    message: 'why is contrast sensitivity important in DIP?',
    intent: 'explanation',
    topic: 'CV-M1-02',
    answerIncludes: ['contrast'],
    answerExcludes: ['not from your notes'],
    maxSentences: 6,
  },
  {
    name: 'applications question returns the applications subsection',
    message: 'what are the applications of DIP?',
    intent: 'application',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-applications',
    answerIncludes: ['Medical imaging'],
    maxSentences: 6,
  },
  {
    name: 'advantages question returns an explanation chunk',
    message: 'what are the advantages of CCD sensors?',
    intent: 'advantages',
    topic: 'CV-M1-03',
    types: ['explanation', 'term_definition'],
    answerExcludes: ['not covered'],
    maxSentences: 6,
  },
  {
    name: 'exam points are isolated from the rest of the topic',
    message: 'important 5 mark questions on image acquisition',
    intent: 'exam_question',
    topic: 'CV-M1-03',
    firstChunk: 'CV-M1-03-exam',
    types: ['exam_points'],
    answerIncludes: ['(5 Marks)'],
  },
  {
    name: 'visual perception quiz returns only MCQs',
    message: 'quiz me on visual perception',
    intent: 'mcq_quiz',
    topic: 'CV-M1-02',
    types: ['mcq'],
    answerIncludes: ['Correct Answer:'],
  },
  {
    name: 'DIP practice questions return only MCQs',
    message: 'give me 3 practice questions on DIP',
    intent: 'mcq_quiz',
    topic: 'CV-M1-01',
    types: ['mcq'],
  },
  {
    name: 'common mistakes return only the mistakes chunk',
    message: 'what are the common mistakes in visual perception?',
    intent: 'common_mistakes',
    topic: 'CV-M1-02',
    firstChunk: 'CV-M1-02-mistakes',
    types: ['mistakes'],
    maxSentences: 6,
  },
  {
    name: '2 marks question uses exam points only',
    message: '2 marks: define image enhancement.',
    intent: 'exam_question',
    topic: 'CV-M1-01',
    types: ['exam_points'],
  },
  {
    name: '5 marks question uses exam points only',
    message: '5 marks: explain the components of a DIP system.',
    intent: 'exam_question',
    topic: 'CV-M1-01',
    firstChunk: 'CV-M1-01-exam',
    types: ['exam_points'],
  },
  {
    name: 'out-of-topic general knowledge is labelled',
    message: 'what is the capital of France?',
    intent: 'out_of_scope',
    expectNoChunks: true,
    answerIncludes: ['not from your notes'],
  },
  {
    name: 'unsupported topic is not answered from nearby chunks',
    message: 'what is edge detection?',
    intent: 'definition',
    expectNoChunks: true,
    answerIncludes: ['not covered'],
    answerExcludes: ['Digital Image Processing (DIP) is the process'],
  },
  {
    name: 'greeting is chitchat with no retrieval',
    message: 'hello',
    intent: 'chitchat',
    expectNoChunks: true,
    answerIncludes: ['Hello'],
  },
  {
    name: 'closing reply clears retrieval',
    message: 'no thanks',
    intent: 'chitchat',
    expectNoChunks: true,
    answerIncludes: ['No problem'],
  },
  {
    name: 'thanks is a friendly acknowledgement, not a closing reply',
    message: 'thanks',
    intent: 'acknowledgement',
    expectNoChunks: true,
    answerIncludes: ['Glad it helped', 'quiz'],
    answerExcludes: ["You're welcome"],
  },
  {
    name: 'worked example request returns one example chunk',
    message: 'give me a worked example on visual perception',
    intent: 'example',
    topic: 'CV-M1-02',
    includesChunks: ['CV-M1-02-example'],
    answerIncludes: ['Calculate'],
  },
  {
    name: 'human eye explanation returns the eye structure subsection',
    message: 'tell me about the human eye',
    intent: 'explanation',
    topic: 'CV-M1-02',
    firstChunk: 'CV-M1-02-eye-structure',
    answerIncludes: ['Retina'],
    maxSentences: 6,
  },
  {
    name: 'quantization definition is a single term chunk',
    message: 'define quantization.',
    intent: 'definition',
    topic: 'CV-M1-03',
    firstChunk: 'CV-M1-03-term-quantization',
    answerIncludes: ['discrete levels'],
    maxSentences: 6,
  },
  {
    name: 'typed meta question about training data uses a fixed answer',
    message: 'wht data u r trained on?',
    intent: 'meta',
    expectNoChunks: true,
    answerIncludes: [
      'AI tutor for your VTU Computer Vision course',
      'Module 1 notes',
      "don't have details",
      'What would you like to continue with?',
    ],
    answerExcludes: ['not covered in your', 'I don\'t have another chunk'],
  },
  {
    name: 'who are you is meta, not chitchat',
    message: 'who are you?',
    intent: 'meta',
    expectNoChunks: true,
    answerIncludes: ["I'm an AI tutor", 'Intro to DIP', 'Visual Perception'],
  },
  {
    name: 'what can you do is meta, not chitchat',
    message: 'what can you do?',
    intent: 'meta',
    expectNoChunks: true,
    answerIncludes: ['I answer using the Module 1 notes', 'What would you like to continue with?'],
  },
  {
    name: 'typo acknowledgement is friendly small talk with no retrieval',
    message: 'gud',
    intent: 'acknowledgement',
    expectNoChunks: true,
    answerIncludes: ['Glad it helped', 'quiz'],
    answerExcludes: ['I don\'t have another chunk'],
  },
];

const MULTI_CASES: MultiCase[] = [
  {
    name: 'yes after pixel definition gives a pixel example, not a numerical',
    turns: [
      {
        message: 'what is a pixel?',
        intent: 'definition',
        firstChunk: 'CV-M1-01-term-pixel',
        statePending: 'example',
        stateConcept: 'Pixel',
      },
      {
        message: 'yes',
        rewrite: 'Give an example of Pixel.',
        intent: 'example',
        firstChunk: 'CV-M1-01-simple',
        answerIncludes: ['For example', 'photograph'],
        answerExcludes: ['smallest individual element', 'Final Answer', '16 bytes'],
        statePending: 'numerical',
      },
    ],
  },
  {
    name: 'yes after DIP definition gives ONLY the example',
    turns: [
      {
        message: 'what is Digital Image Processing?',
        intent: 'definition',
        statePending: 'example',
        stateConcept: 'Digital Image Processing',
      },
      {
        message: 'yes',
        rewrite: 'Give an example of Digital Image Processing.',
        intent: 'example',
        firstChunk: 'CV-M1-01-simple',
        answerIncludes: ['For example', 'photograph'],
        answerExcludes: ['Digital Image Processing (DIP) is the process', 'Final Answer'],
        statePending: 'numerical',
      },
    ],
  },
  {
    name: 'formula follow-up on rods and cones does not fetch Weber',
    turns: [
      { message: 'explain rods and cones', intent: 'explanation' },
      {
        message: 'give formula',
        rewrite: 'Give the formula for rods and cones.',
        intent: 'formula',
        answerIncludes: ['no specific formula for rods and cones'],
        answerExcludes: ['ΔI / I', 'I_max'],
      },
    ],
  },
  {
    name: 'formula follow-up on Michelson stays on Michelson',
    turns: [
      { message: 'what is Michelson contrast?', intent: 'definition' },
      {
        message: 'formula',
        rewrite: 'Give the formula for Michelson Contrast.',
        intent: 'formula',
        firstChunk: 'CV-M1-02-formula-michelson-contrast',
        answerIncludes: ['C = (I_max - I_min) / (I_max + I_min)'],
      },
    ],
  },
  {
    name: 'and CMOS follow-up keeps both sensors',
    turns: [
      {
        message: 'what is CCD?',
        intent: 'definition',
        firstChunk: 'CV-M1-03-term-ccd',
        stateConcept: 'CCD',
      },
      {
        message: 'and CMOS?',
        rewrite: 'What is CMOS (compare with CCD)?',
        intent: 'difference',
        includesChunks: ['CV-M1-03-term-ccd', 'CV-M1-03-term-cmos'],
        answerIncludes: ['CCD:', 'CMOS:'],
        answerExcludes: ['not covered'],
      },
    ],
  },
  {
    name: 'numerical follow-up on contrast uses the worked example',
    turns: [
      { message: 'define contrast', intent: 'definition' },
      {
        message: 'numerical',
        rewrite: 'Give a numerical on Contrast.',
        intent: 'numerical',
        includesChunks: ['CV-M1-02-example', 'CV-M1-02-formula-michelson-contrast'],
        answerIncludes: ['Michelson contrast'],
        answerExcludes: ['not covered'],
      },
    ],
  },
  {
    name: 'closing reply does not produce a not-covered answer',
    turns: [
      { message: 'what is a pixel?', intent: 'definition' },
      {
        message: 'no thanks',
        rewrite: 'no thanks',
        intent: 'chitchat',
        expectNoChunks: true,
        answerIncludes: ['No problem'],
        answerExcludes: ['not covered'],
        statePending: null,
      },
    ],
  },
  {
    name: 'why follow-up keeps brightness adaptation as the first chunk',
    turns: [
      { message: 'explain brightness adaptation', intent: 'explanation', firstChunk: 'CV-M1-02-adaptation' },
      {
        message: 'why?',
        rewrite: 'Explain why Brightness Adaptation works that way.',
        intent: 'explanation',
        firstChunk: 'CV-M1-02-adaptation',
        answerIncludes: ['Brightness adaptation'],
        answerExcludes: ['Brightness discrimination refers'],
      },
    ],
  },
  {
    name: 'yes bro send resolves the pending numerical on DIP',
    turns: [
      {
        message: 'what is DIP?',
        intent: 'definition',
        statePending: 'example',
        stateConcept: 'Digital Image Processing',
      },
      {
        message: 'yes',
        rewrite: 'Give an example of Digital Image Processing.',
        intent: 'example',
        answerIncludes: ['For example'],
        answerExcludes: ['Digital Image Processing (DIP) is the process'],
        statePending: 'numerical',
      },
      {
        message: 'yes bro send',
        rewrite: 'Give a numerical example on Digital Image Processing.',
        intent: 'numerical',
        firstChunk: 'CV-M1-01-example',
        answerIncludes: ['4 x 4', 'Intensity matrix', '16 bytes'],
        statePending: 'quiz',
      },
    ],
  },
  {
    name: 'yeah -> ok -> sure pls each resolves the pending offer',
    turns: [
      {
        message: 'what is DIP?',
        intent: 'definition',
        statePending: 'example',
        stateConcept: 'Digital Image Processing',
      },
      {
        message: 'yeah',
        rewrite: 'Give an example of Digital Image Processing.',
        intent: 'example',
        answerIncludes: ['For example'],
        statePending: 'numerical',
      },
      {
        message: 'ok',
        rewrite: 'Give a numerical example on Digital Image Processing.',
        intent: 'numerical',
        firstChunk: 'CV-M1-01-example',
        answerIncludes: ['4 x 4'],
        statePending: 'quiz',
      },
      {
        message: 'sure pls',
        rewrite: 'Give me a quiz on Digital Image Processing.',
        intent: 'mcq_quiz',
        answerIncludes: ['Correct Answer:'],
        statePending: 'comparison',
      },
    ],
  },
  {
    name: 'send example after a pixel definition gives the pixel example',
    turns: [
      { message: 'what is a pixel?', intent: 'definition', statePending: 'example' },
      {
        message: 'send example',
        rewrite: 'Give an example of Pixel.',
        intent: 'example',
        firstChunk: 'CV-M1-01-simple',
        answerIncludes: ['For example', 'photograph'],
        answerExcludes: ['smallest individual element'],
      },
    ],
  },
  {
    name: 'yes after CCD definition must not say not covered',
    turns: [
      { message: 'what is CCD?', intent: 'definition', statePending: 'example', stateConcept: 'CCD' },
      {
        message: 'yes',
        rewrite: 'Give an example of CCD.',
        intent: 'example',
        answerExcludes: ['not covered', 'not from your notes'],
      },
    ],
  },
  {
    name: 'no thanks after DIP closes the offer with no retrieval',
    turns: [
      { message: 'what is DIP?', intent: 'definition', statePending: 'example' },
      {
        message: 'no thanks',
        rewrite: 'no thanks',
        intent: 'chitchat',
        expectNoChunks: true,
        answerIncludes: ['No problem'],
        answerExcludes: ['not covered', 'Digital Image Processing (DIP) is the process'],
        statePending: null,
      },
    ],
  },
  {
    name: 'other topic asks which topic and closes the DIP offer',
    turns: [
      {
        message: 'what is DIP?',
        intent: 'definition',
        statePending: 'example',
        stateConcept: 'Digital Image Processing',
        stateTopic: 'CV-M1-01',
      },
      { message: 'yes', rewrite: 'Give an example of Digital Image Processing.', statePending: 'numerical' },
      {
        message: 'yes',
        rewrite: 'Give a numerical example on Digital Image Processing.',
        firstChunk: 'CV-M1-01-example',
        statePending: 'quiz',
      },
      {
        message: 'other topic',
        rewrite: 'Switch to another topic.',
        intent: 'topic_switch',
        expectNoChunks: true,
        answerIncludes: [
          'Sure! Which topic?',
          'Intro to DIP',
          'Visual Perception',
          'Image Sensing and Acquisition?',
        ],
        answerExcludes: ['not covered', '4 x 4'],
        statePending: null,
        stateConceptChanged: true,
      },
    ],
  },
  {
    name: 'named topic switch gives an image acquisition example, not the DIP example',
    turns: [
      { message: 'what is DIP?', intent: 'definition', stateConcept: 'Digital Image Processing' },
      { message: 'yes', rewrite: 'Give an example of Digital Image Processing.' },
      { message: 'yes', rewrite: 'Give a numerical example on Digital Image Processing.' },
      { message: 'other topic', intent: 'topic_switch', expectNoChunks: true },
      {
        message: 'image acquisition',
        rewrite: 'Switch to Image Sensing and Acquisition.',
        intent: 'topic_switch',
        firstChunk: 'CV-M1-03-topic-definition',
        answerIncludes: ['Image Sensing and Acquisition'],
        stateTopic: 'CV-M1-03',
        stateConceptChanged: true,
        stateConceptNot: ['Digital Image Processing', 'Pixel'],
        statePending: 'example',
      },
      {
        message: 'yes',
        rewrite: 'Give an example of Image Sensing and Acquisition.',
        intent: 'example',
        firstChunk: 'CV-M1-03-simple',
        answerIncludes: ['smartphone', 'image sensor'],
        answerExcludes: ['photograph taken with a mobile phone', '4 x 4', '16 bytes'],
        stateTopic: 'CV-M1-03',
        stateConceptNot: ['Digital Image Processing', 'Pixel'],
      },
    ],
  },
  {
    name: 'numerical after the topic switch uses the 640x480 storage example',
    turns: [
      { message: 'what is DIP?', intent: 'definition' },
      { message: 'yes', rewrite: 'Give an example of Digital Image Processing.' },
      { message: 'yes', rewrite: 'Give a numerical example on Digital Image Processing.' },
      { message: 'other topic', intent: 'topic_switch', expectNoChunks: true },
      { message: 'image acquisition', intent: 'topic_switch', stateTopic: 'CV-M1-03' },
      { message: 'yes', rewrite: 'Give an example of Image Sensing and Acquisition.', firstChunk: 'CV-M1-03-simple' },
      {
        message: 'yes',
        rewrite: 'Give a numerical example on Image Sensing and Acquisition.',
        intent: 'numerical',
        firstChunk: 'CV-M1-03-example',
        answerIncludes: ['640 x 480', '8 bits', '300 KB'],
        answerExcludes: ['4 x 4', '16 bytes'],
        stateTopic: 'CV-M1-03',
        statePending: 'quiz',
      },
    ],
  },
  {
    name: 'next topic asks which topic after a pixel definition',
    turns: [
      { message: 'what is a pixel?', intent: 'definition', stateConcept: 'Pixel', stateTopic: 'CV-M1-01' },
      {
        message: 'next topic',
        rewrite: 'Switch to another topic.',
        intent: 'topic_switch',
        expectNoChunks: true,
        answerIncludes: ['Sure! Which topic?', 'Intro to DIP', 'Visual Perception'],
        answerExcludes: ['photograph taken with a mobile phone'],
        statePending: null,
        stateConceptChanged: true,
      },
    ],
  },
  {
    name: 'noo closes the DIP numerical offer with no retrieval',
    turns: [
      { message: 'what is DIP?', intent: 'definition', statePending: 'example' },
      { message: 'yes', rewrite: 'Give an example of Digital Image Processing.', statePending: 'numerical' },
      {
        message: 'yes',
        rewrite: 'Give a numerical example on Digital Image Processing.',
        firstChunk: 'CV-M1-01-example',
        statePending: 'quiz',
      },
      {
        message: 'noo',
        rewrite: 'noo',
        intent: 'chitchat',
        expectNoChunks: true,
        answerIncludes: ['No problem'],
        answerExcludes: ['4 x 4', 'Final Answer', 'not covered'],
        statePending: null,
      },
    ],
  },
  {
    name: 'stale concept is cleared after switching topics',
    turns: [
      { message: 'what is a pixel?', intent: 'definition', stateConcept: 'Pixel', stateTopic: 'CV-M1-01' },
      { message: 'other topic', intent: 'topic_switch', expectNoChunks: true, stateConceptChanged: true },
      {
        message: 'image acquisition',
        intent: 'topic_switch',
        firstChunk: 'CV-M1-03-topic-definition',
        stateTopic: 'CV-M1-03',
        stateConceptChanged: true,
        stateConceptNot: ['Pixel', 'Digital Image Processing'],
      },
      {
        message: 'yes',
        rewrite: 'Give an example of Image Sensing and Acquisition.',
        firstChunk: 'CV-M1-03-simple',
        answerExcludes: ['photograph taken with a mobile phone'],
        stateConceptNot: ['Pixel'],
      },
    ],
  },
  {
    name: 'a repeated numerical uses a new variant and a different offer',
    turns: [
      { message: 'what is DIP?', intent: 'definition' },
      { message: 'yes', rewrite: 'Give an example of Digital Image Processing.' },
      {
        message: 'yes',
        rewrite: 'Give a numerical example on Digital Image Processing.',
        firstChunk: 'CV-M1-01-example',
        statePending: 'quiz',
      },
      {
        message: 'give another numerical',
        rewrite: 'Give a numerical example on Digital Image Processing.',
        intent: 'numerical',
        firstChunk: 'CV-M1-01-example',
        answerIncludes: ['different version', '8 x 8'],
        answerExcludes: ['4 x 4'],
        statePending: 'formula',
      },
    ],
  },
  {
    name: 'meta question preserves the pending offer after a numerical',
    turns: [
      {
        message: 'what is image acquisition?',
        intent: 'definition',
        firstChunk: 'CV-M1-03-topic-definition',
        statePending: 'example',
        stateConcept: 'Image Sensing and Acquisition',
      },
      { message: 'yes', rewrite: 'Give an example of Image Sensing and Acquisition.', statePending: 'numerical' },
      {
        message: 'yes',
        rewrite: 'Give a numerical example on Image Sensing and Acquisition.',
        firstChunk: 'CV-M1-03-example',
        statePending: 'quiz',
        stateConcept: 'Image Sensing and Acquisition',
      },
      {
        message: 'wht data u r trained on?',
        intent: 'meta',
        expectNoChunks: true,
        answerIncludes: ['AI tutor for your VTU Computer Vision course', "don't have details"],
        answerExcludes: ['I don\'t have another chunk', 'not covered in your'],
        statePending: 'quiz',
        stateConcept: 'Image Sensing and Acquisition',
      },
      {
        message: 'yes',
        rewrite: 'Give me a quiz on Image Sensing and Acquisition.',
        intent: 'mcq_quiz',
        includesChunks: ['CV-M1-03-mcq-1'],
        stateConcept: 'Image Sensing and Acquisition',
      },
    ],
  },
  {
    name: 'goof after a numerical is a friendly acknowledgement, not a dead end',
    turns: [
      { message: 'what is image acquisition?', intent: 'definition', statePending: 'example' },
      { message: 'yes', statePending: 'numerical' },
      {
        message: 'yes',
        firstChunk: 'CV-M1-03-example',
        answerIncludes: ['640 x 480', '300 KB'],
        statePending: 'quiz',
        stateConcept: 'Image Sensing and Acquisition',
      },
      {
        message: 'goof',
        intent: 'acknowledgement',
        expectNoChunks: true,
        answerIncludes: ['Glad it helped', 'quiz'],
        answerExcludes: ['I don\'t have another chunk', 'another chunk for', '640 x 480'],
        statePending: null,
        stateConcept: 'Image Sensing and Acquisition',
      },
    ],
  },
  {
    name: 'haa after an example offer resolves the numerical',
    turns: [
      {
        message: 'what is DIP?',
        intent: 'definition',
        statePending: 'example',
        stateConcept: 'Digital Image Processing',
      },
      {
        message: 'yes',
        rewrite: 'Give an example of Digital Image Processing.',
        firstChunk: 'CV-M1-01-simple',
        statePending: 'numerical',
      },
      {
        message: 'haa',
        rewrite: 'Give a numerical example on Digital Image Processing.',
        intent: 'numerical',
        firstChunk: 'CV-M1-01-example',
        answerIncludes: ['4 x 4', '16 bytes'],
        statePending: 'quiz',
      },
    ],
  },
];

const chunks = loadChunksFromJson();
const options = { chunks, embeddings: {}, useDatabase: false as const };
let passed = 0;
let total = 0;
const failures: string[] = [];

function expect(condition: boolean, message: string, issues: string[]): void {
  if (!condition) issues.push(message);
}

function includesAll(answer: string, phrases: string[]): boolean {
  const lower = answer.toLowerCase();
  return phrases.every(phrase => lower.includes(phrase.toLowerCase()));
}

function excludesAll(answer: string, phrases: string[]): boolean {
  const lower = answer.toLowerCase();
  return phrases.every(phrase => !lower.includes(phrase.toLowerCase()));
}

function checkAnswer(answer: string, test: Pick<SingleCase, 'answerIncludes' | 'answerExcludes' | 'maxSentences'>, issues: string[]): void {
  expect(!answer.includes("I don't have another chunk"), 'dead-end fallback was returned', issues);
  if (test.answerIncludes) expect(includesAll(answer, test.answerIncludes), `answer missing: ${test.answerIncludes.join(', ')}`, issues);
  if (test.answerExcludes) expect(excludesAll(answer, test.answerExcludes), `answer contains: ${test.answerExcludes.join(', ')}`, issues);
  if (test.maxSentences) expect(answerSentenceCount(answer) <= test.maxSentences, `answer has ${answerSentenceCount(answer)} sentences`, issues);
}

function report(name: string, issues: string[], detail: string): void {
  total++;
  if (issues.length === 0) {
    passed++;
    console.log(`PASS  ${name}`);
    console.log(`      ${detail}`);
  } else {
    failures.push(name);
    console.log(`FAIL  ${name}`);
    issues.forEach(issue => console.log(`      - ${issue}`));
  }
}

async function main(): Promise<void> {
  console.log(`Loaded ${chunks.length} fine-grained chunks. Running ${SINGLE_CASES.length + MULTI_CASES.length} cases.\n`);

  for (const test of SINGLE_CASES) {
  const result = await retrieveForMessage(test.message, [], {}, options);
  const answer = buildLocalAnswer(result.rewrittenQuestion, result.chunks, result.intent, {
    topicId: result.topicId,
    concept: result.focusConcept || result.concepts[0],
  });
  const issues: string[] = [];
  const ids = result.chunks.map(chunk => chunk.chunk_id);

  expect(result.intent === test.intent, `intent ${result.intent} != ${test.intent}`, issues);
  if (test.expectNoChunks) {
    expect(result.chunks.length === 0, `expected no chunks, got ${ids.join(', ') || 'none'}`, issues);
  } else {
    expect(result.chunks.length > 0 && result.chunks.length <= 3, `retrieved ${result.chunks.length} chunks`, issues);
  }
  if (test.topic) {
    expect(result.chunks.every(chunk => chunk.topic_id === test.topic), `wrong topic: ${result.chunks.map(chunk => chunk.topic_id).join(', ') || 'none'}`, issues);
  }
  if (test.firstChunk) {
    expect(ids[0] === test.firstChunk, `first chunk ${ids[0] || 'none'} != ${test.firstChunk}`, issues);
  }
  if (test.includesChunks) {
    for (const id of test.includesChunks) expect(ids.includes(id), `missing chunk ${id} (got ${ids.join(', ') || 'none'})`, issues);
  }
  if (test.types) {
    expect(result.chunks.every(chunk => test.types!.includes(chunk.chunk_type)), `wrong types: ${result.chunks.map(chunk => chunk.chunk_type).join(', ') || 'none'}`, issues);
  }
  checkAnswer(answer, test, issues);

  const unsolicited = !['numerical', 'exam_question', 'mcq_quiz'].includes(result.intent) &&
    /Final Answer|Correct Answer|\(\d+\s*Marks?\)|\d+\s*(?:KB|MB)\b/.test(answer);
  expect(!unsolicited, 'contains unsolicited numerical/exam content', issues);

  report(test.name, issues, `${result.intent} | ${ids.join(', ') || 'no chunks'} | ${answerSentenceCount(answer)} sentences`);
}

for (const test of MULTI_CASES) {
  let history: ChatMessageItem[] = [];
  let state: TutorState = {};
  const issues: string[] = [];
  const details: string[] = [];

  for (const turn of test.turns) {
    const previousState = state;
    const rewrite = rewriteQuery(turn.message, history, state, chunks);
    const result = await retrieveForMessage(turn.message, history, state, options);
    const answer = buildLocalAnswer(result.rewrittenQuestion, result.chunks, result.intent, {
      topicId: result.topicId,
      concept: result.focusConcept || result.concepts[0],
      closing: result.closing,
      declined: result.declined,
      followup: result.followup,
      previousInScope: result.previousInScope,
      pendingOffer: state.pending_offer,
      allChunks: chunks,
      topicSwitchTarget: result.topicSwitchTarget,
      repeatContent: result.repeatContent,
      lastOfferKind: state.last_offer_kind,
      lastOfferText: state.last_offer_text,
    });
    const ids = result.chunks.map(chunk => chunk.chunk_id);

    if (turn.rewrite) expect(rewrite.question === turn.rewrite, `rewrite "${rewrite.question}" != "${turn.rewrite}"`, issues);
    if (turn.intent) expect(result.intent === turn.intent, `intent ${result.intent} != ${turn.intent}`, issues);
    if (turn.expectNoChunks) expect(ids.length === 0, `expected no chunks after "${turn.message}", got ${ids.join(', ') || 'none'}`, issues);
    if (turn.firstChunk) expect(ids[0] === turn.firstChunk, `first chunk ${ids[0] || 'none'} != ${turn.firstChunk} (after "${turn.message}")`, issues);
    if (turn.includesChunks) {
      for (const id of turn.includesChunks) expect(ids.includes(id), `missing ${id} after "${turn.message}" (got ${ids.join(', ') || 'none'})`, issues);
    }
    checkAnswer(answer, turn, issues);
    expect(!answer.includes('not covered in your') || Boolean(turn.answerIncludes?.some(phrase => phrase.includes('not covered'))), `not-covered reply after "${turn.message}"`, issues);
    details.push(`"${turn.message}" -> "${rewrite.question}" [${ids.join(', ') || 'none'}]`);
    expect(!(result.chunks.length > 3), 'retrieved more than 3 chunks', issues);
    expect(classifyIntent(result.rewrittenQuestion) === result.intent, 'classifier disagrees with pipeline intent', issues);

    // Every content follow-up must be built from the CURRENT state concept.
    if (previousState.last_concept && rewrite.followup && result.intent !== 'topic_switch' && !rewrite.closing && !rewrite.declined) {
      expect(
        rewrite.question.toLowerCase().includes(previousState.last_concept.toLowerCase()),
        `rewrite "${rewrite.question}" lost current concept "${previousState.last_concept}"`,
        issues
      );
    }

    history = [
      ...history,
      { sender: 'user' as const, text: turn.message },
      { sender: 'model' as const, text: answer },
    ].slice(-8);
    // The live route uses this same state derivation from the reply's chunks.
    state = deriveTurnState({
      previous: previousState,
      chunks: result.chunks,
      allChunks: chunks,
      topicId: result.topicId,
      concept: result.focusConcept || result.concepts[0],
      intent: result.intent,
      answer,
      closing: result.closing,
      declined: result.declined,
      // Mirrors the live route: meta is state-neutral; an unaccepted quiz
      // offer is cleared by an acknowledgement.
      preserveState: result.intent === 'meta',
      declineOffer: result.declined || (result.intent === 'acknowledgement' && previousState.pending_offer === 'quiz'),
      topicSwitch: result.topicSwitch,
      targetTopicId: result.topicSwitchTarget,
    });
    if (turn.statePending !== undefined) {
      expect(state.pending_offer === turn.statePending, `state pending_offer ${state.pending_offer || 'null'} != ${turn.statePending || 'null'} after "${turn.message}"`, issues);
    }
    if (turn.stateConcept) {
      expect(state.last_concept === turn.stateConcept, `state concept "${state.last_concept || 'none'}" != "${turn.stateConcept}"`, issues);
    }
    if (turn.stateTopic) {
      expect(state.last_topic_id === turn.stateTopic, `state topic "${state.last_topic_id || 'none'}" != "${turn.stateTopic}"`, issues);
    }
    if (turn.stateConceptChanged) {
      expect(
        !previousState.last_concept || state.last_concept !== previousState.last_concept,
        `state concept was not cleared: "${state.last_concept || 'none'}"`,
        issues
      );
    }
    for (const stale of turn.stateConceptNot || []) {
      expect(
        state.last_concept?.toLowerCase() !== stale.toLowerCase(),
        `stale concept "${stale}" survived after "${turn.message}"`,
        issues
      );
    }
  }

  report(test.name, issues, details.join(' ; '));
}

  console.log(`\n${passed}/${total} passed.`);
  if (failures.length > 0) {
    console.log(`Failed: ${failures.join(' ; ')}`);
    process.exitCode = 1;
  }
}

main();
