import assert from 'node:assert/strict';
import test from 'node:test';
import { foldIntensityOf, keepProseOf } from '../src/client/fold-intensity.js';
import { presentLiveTurn, settledFoldItems, splitChainKeepingBody, type LiveStep } from '../src/client/live-turn.js';

/** Minimal step factories: only the fields the splitter reads. */
const reasoning = (n: number): LiveStep => ({ kind: 'reasoning', key: `r${n}`, nodeKey: 'a', start: n, blocks: [], step: 0 });
const body = (n: number): LiveStep => ({ kind: 'body', key: `b${n}`, nodeKey: 'a', start: n, blocks: [], step: 0 });
const tool = (n: number): LiveStep => ({ kind: 'tool', key: `t${n}`, entry: { callId: `c${n}` } as never });
const other = (n: number): LiveStep => ({ kind: 'other', key: `o${n}`, nodeKey: 'a' });

const openBoundary = { status: 'open' } as never;

test('the three fold stops keep their contract values', () => {
  // A wrong literal here compiles clean and silently disables a stop, so the
  // values the settings control writes are pinned down explicitly.
  assert.equal(foldIntensityOf({ foldIntensity: 0 }), 0);
  assert.equal(foldIntensityOf({ foldIntensity: 1 }), 1);
  assert.equal(foldIntensityOf({ foldIntensity: 2 }), 2);
  // Level 2 has to survive a round trip: it is the stop that means
  // "fold the process, keep the prose".
  assert.equal(foldIntensityOf({ foldIntensity: foldIntensityOf({ foldIntensity: 2 }) }), 2);
  // Legacy snapshots map onto the stop with the same meaning.
  assert.equal(foldIntensityOf({ processOnly: true }), 2);
  assert.equal(foldIntensityOf({ autoFold: false }), 0);
});

test('keepProseOf defaults to off and reads only an explicit true', () => {
  assert.equal(keepProseOf(undefined), false);
  assert.equal(keepProseOf({}), false);
  assert.equal(keepProseOf({ keepProse: false }), false);
  assert.equal(keepProseOf({ keepProse: 'yes' }), false);
  assert.equal(keepProseOf({ keepProse: true }), true);
});

test('a think/tool/think/tool turn folds into one digest per thought', () => {
  // The shape the reader expects: every stretch between two thoughts collapses
  // into its own digest, and the user-facing answer is never folded. A turn
  // like this has no body step until the very end, which is exactly why the
  // splitter must flush on a *new reasoning* step and not only on a body.
  const segments = splitChainKeepingBody([reasoning(0), tool(1), tool(2), reasoning(3), tool(4), body(5)]);
  assert.deepEqual(segments.map(s => ({ fold: s.fold?.map(x => x.key) ?? null, open: s.open.map(x => x.key) })), [
    { fold: ['r0', 't1', 't2'], open: [] },
    { fold: ['r3', 't4'], open: [] },
    { fold: null, open: ['b5'] },
  ]);
});

test('a unit closes on the next thought, not on the first tool', () => {
  // A unit runs from one thought up to the next one. A tool arriving in the
  // trailing block does not close it: more tools — and then another thought —
  // may still land inside the block the reader is watching.
  const toolsOnly = [reasoning(0), tool(1), tool(2)];
  assert.deepEqual(splitChainKeepingBody(toolsOnly).map(s => s.fold?.map(x => x.key) ?? null),
    [null], 'tools alone do not close the open block');

  const nextThought = [reasoning(0), tool(1), reasoning(2)];
  assert.deepEqual(splitChainKeepingBody(nextThought).map(s => s.fold?.map(x => x.key) ?? null),
    [['r0', 't1'], null], 'the next thought closes the block before it');
});

test('a finished turn segments when either opt-in switch is on', () => {
  const steps = [reasoning(0), tool(1), reasoning(2), tool(3)];
  const closed = { status: 'closed', reason: 'completed', latestStep: 9 } as never;
  // Both switches off: the author's own summary owns the finished turn.
  assert.equal(settledFoldItems(steps, closed, false, false), null);
  // Either switch on: the per-run splitter takes over, sealed so the tail folds.
  assert.ok(settledFoldItems(steps, closed, true, false), 'keepProse alone');
  assert.ok(settledFoldItems(steps, closed, false, true), 'tool naming alone');
});

test('naming the tools also switches the turn to per-run digests', () => {
  // The tool-named digest describes one run, so it only lines up with the
  // content when the per-run splitter is in charge. Turning that switch on
  // alone must not leave the author's single-run split in place.
  const steps = [reasoning(0), tool(1), reasoning(2), tool(3)];
  const named = presentLiveTurn(steps, openBoundary, true, false, true);
  assert.deepEqual(named.filter(item => item.kind === 'fold').length, 1,
    'the trailing block is still open, so only the closed unit folds');
  const plain = presentLiveTurn(steps, openBoundary, true, false, false);
  assert.deepEqual(plain.map(item => item.kind), named.map(item => item.kind),
    'the digest shape does not depend on the switch');
});

test('a sealed turn folds its trailing unit, a live one keeps it open', () => {
  const chain = [reasoning(0), tool(1), reasoning(2), tool(3)];
  // Live: the last unit is the one still being written, so it stays readable.
  assert.deepEqual(splitChainKeepingBody(chain).map(s => s.fold?.map(x => x.key) ?? null),
    [['r0', 't1'], null]);
  // Sealed: nothing is arriving any more, so the tail folds too.
  assert.deepEqual(splitChainKeepingBody(chain, true).map(s => s.fold?.map(x => x.key) ?? null),
    [['r0', 't1'], ['r2', 't3']]);
});

test('splitChainKeepingBody folds process runs and never a body step', () => {
  const segments = splitChainKeepingBody([reasoning(0), tool(1), body(2), reasoning(3), tool(4)]);
  assert.deepEqual(segments.map(s => ({ fold: s.fold?.map(x => x.key) ?? null, open: s.open.map(x => x.key) })), [
    { fold: ['r0', 't1'], open: [] },
    { fold: null, open: ['b2'] },
    { fold: null, open: ['r3', 't4'] },
  ]);
});

test('splitChainKeepingBody leaves the trailing unit open', () => {
  // The last unit is still streaming, so it must stay readable as it arrives.
  const segments = splitChainKeepingBody([body(0), reasoning(1), tool(2), tool(3)]);
  assert.deepEqual(segments.map(s => s.fold?.length ?? 0), [0, 0]);
  assert.deepEqual(segments[1]!.open.map(s => s.key), ['r1', 't2', 't3']);
});

test('splitChainKeepingBody keeps a single-step run so a lone tool row keeps its name', () => {
  const segments = splitChainKeepingBody([tool(0), body(1)]);
  assert.equal(segments[0]!.fold, null);
  assert.deepEqual(segments[0]!.open.map(s => s.key), ['t0']);
});

test('splitChainKeepingBody treats non-body process kinds as foldable', () => {
  const segments = splitChainKeepingBody([reasoning(0), other(1), body(2)]);
  assert.deepEqual(segments[0]!.fold?.map(s => s.key), ['r0', 'o1']);
});

test('presentLiveTurn keepProse folds process but leaves every body step open', () => {
  const steps = [reasoning(0), tool(1), body(2), body(3), reasoning(4), tool(5), body(6)];
  const items = presentLiveTurn(steps, openBoundary, true, true);
  const kinds = items.map(i => (i.kind === 'open' ? `open:${i.step.key}` : `fold:${i.summary}`));
  assert.deepEqual(kinds, ['fold:思考×1 · 工具×1', 'open:b2', 'open:b3', 'fold:思考×1 · 工具×1', 'open:b6']);
});

test('presentLiveTurn without keepProse keeps the existing fold shape', () => {
  // Legacy splitChain folds everything before the LAST reasoning step, so the
  // reasoning step must not be first for a fold to happen at all.
  const steps = [body(0), tool(1), reasoning(2)];
  const items = presentLiveTurn(steps, openBoundary, true, false);
  assert.equal(items[0]!.kind, 'fold');
  assert.deepEqual(items[0]!.kind === 'fold' ? items[0]!.steps.map(s => s.key) : [], ['b0', 't1']);
  assert.equal(items.filter(i => i.kind === 'open' && i.step.kind === 'body').length, 0);
});

test('presentLiveTurn keepProse is inert when auto-fold is off', () => {
  const steps = [reasoning(0), tool(1), body(2)];
  const items = presentLiveTurn(steps, openBoundary, false, true);
  assert.equal(items.every(i => i.kind === 'open'), true);
});
