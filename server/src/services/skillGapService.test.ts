import test from 'node:test';
import assert from 'node:assert/strict';
import {
  diagnoseSubtopic,
  DIAG_CONFIG,
  BandStats,
} from './skillGapService';

test('Row 1: 1/3, 0/1, 1/1 -> FOUNDATION_GAP with guessingSuspected=true', () => {
  const stats: BandStats = {
    EASY: { correct: 1, total: 3 },
    MEDIUM: { correct: 0, total: 1 },
    HARD: { correct: 1, total: 1 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.diagnosis, 'FOUNDATION_GAP');
  assert.equal(res.guessingSuspected, true);
  assert.equal(res.startDifficulty, 'EASY');
  assert.equal(res.missingBands.length, 0);
  assert.equal(res.bands.EASY.passed, false);
  assert.equal(res.bands.HARD.passed, true);
});

test('Row 2: 2/2, 0/2, 0/1 -> APPLICATION_GAP with guessingSuspected=false', () => {
  const stats: BandStats = {
    EASY: { correct: 2, total: 2 },
    MEDIUM: { correct: 0, total: 2 },
    HARD: { correct: 0, total: 1 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.diagnosis, 'APPLICATION_GAP');
  assert.equal(res.guessingSuspected, false);
  assert.equal(res.startDifficulty, 'MEDIUM');
  assert.equal(res.bands.EASY.passed, true);
  assert.equal(res.bands.MEDIUM.passed, false);
});

test('Row 3: 2/2, 2/2, 0/1 -> EDGE_CASE_ONLY with startDifficulty=HARD', () => {
  const stats: BandStats = {
    EASY: { correct: 2, total: 2 },
    MEDIUM: { correct: 2, total: 2 },
    HARD: { correct: 0, total: 1 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.diagnosis, 'EDGE_CASE_ONLY');
  assert.equal(res.guessingSuspected, false);
  assert.equal(res.startDifficulty, 'HARD');
  assert.equal(res.bands.EASY.passed, true);
  assert.equal(res.bands.MEDIUM.passed, true);
  assert.equal(res.bands.HARD.passed, false);
});

test('Row 4: 2/2, 1/2, 1/1 -> MASTERED (medium 0.5 passes)', () => {
  const stats: BandStats = {
    EASY: { correct: 2, total: 2 },
    MEDIUM: { correct: 1, total: 2 },
    HARD: { correct: 1, total: 1 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.diagnosis, 'MASTERED');
  assert.equal(res.guessingSuspected, false);
  assert.equal(res.startDifficulty, null);
  assert.equal(res.bands.EASY.passed, true);
  assert.equal(res.bands.MEDIUM.passed, true);
  assert.equal(res.bands.HARD.passed, true);
});

test('Row 5: 1/1, 1/1, 0/0 -> INSUFFICIENT_DATA (total 2 < 4)', () => {
  const stats: BandStats = {
    EASY: { correct: 1, total: 1 },
    MEDIUM: { correct: 1, total: 1 },
    HARD: { correct: 0, total: 0 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.diagnosis, 'INSUFFICIENT_DATA');
  assert.equal(res.guessingSuspected, false);
  assert.equal(res.startDifficulty, null);
  assert.deepEqual(res.missingBands, ['HARD']);
});

test('Row 6: 0/0, 2/2, 1/2 -> MASTERED (missingBands=[EASY], hard 0.5 passes)', () => {
  const stats: BandStats = {
    EASY: { correct: 0, total: 0 },
    MEDIUM: { correct: 2, total: 2 },
    HARD: { correct: 1, total: 2 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.diagnosis, 'MASTERED');
  assert.equal(res.guessingSuspected, false);
  assert.equal(res.startDifficulty, null);
  assert.deepEqual(res.missingBands, ['EASY']);
  assert.equal(res.bands.EASY.passed, null);
  assert.equal(res.bands.EASY.accuracy, null);
  assert.equal(res.bands.MEDIUM.passed, true);
  assert.equal(res.bands.HARD.passed, true);
});

test('Row 7: 0/2, 0/2, 0/1 -> FOUNDATION_GAP (easy checked first)', () => {
  const stats: BandStats = {
    EASY: { correct: 0, total: 2 },
    MEDIUM: { correct: 0, total: 2 },
    HARD: { correct: 0, total: 1 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.diagnosis, 'FOUNDATION_GAP');
  assert.equal(res.guessingSuspected, false);
  assert.equal(res.startDifficulty, 'EASY');
});

test('Missing band check: total === 0 yields accuracy: null and passed: null', () => {
  const stats: BandStats = {
    EASY: { correct: 0, total: 0 },
    MEDIUM: { correct: 3, total: 4 },
    HARD: { correct: 0, total: 0 },
  };
  const res = diagnoseSubtopic(stats);
  assert.equal(res.bands.EASY.accuracy, null);
  assert.equal(res.bands.EASY.passed, null);
  assert.equal(res.bands.EASY.total, 0);
  assert.equal(res.bands.HARD.accuracy, null);
  assert.equal(res.bands.HARD.passed, null);
  assert.equal(res.bands.HARD.total, 0);
  assert.deepEqual(res.missingBands, ['EASY', 'HARD']);
});

test('Configuration override: BAND_PASS_AT: 0.7 turns 2/2, 1/2, 1/1 into APPLICATION_GAP', () => {
  const stats: BandStats = {
    EASY: { correct: 2, total: 2 },
    MEDIUM: { correct: 1, total: 2 },
    HARD: { correct: 1, total: 1 },
  };
  const res = diagnoseSubtopic(stats, { ...DIAG_CONFIG, BAND_PASS_AT: 0.7 });
  assert.equal(res.diagnosis, 'APPLICATION_GAP');
  assert.equal(res.startDifficulty, 'MEDIUM');
  assert.equal(res.bands.MEDIUM.passed, false);
});
