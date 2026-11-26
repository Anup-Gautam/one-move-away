import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMinimalBoard } from './board.ts';
import {
  REFLECTION,
  reflectDirection,
  traceBeam,
} from './beamEngine.ts';
import type { Board, Tile } from './types.ts';

function replaceTile(board: Board, next: Tile): Board {
  return {
    ...board,
    tiles: board.tiles.map((tile) =>
      tile.x === next.x && tile.y === next.y ? next : tile
    ),
  };
}

describe('reflectDirection', () => {
  it('maps slash reflections', () => {
    assert.equal(reflectDirection('/', 'E'), 'N');
    assert.equal(reflectDirection('/', 'N'), 'E');
    assert.equal(reflectDirection('/', 'W'), 'S');
    assert.equal(reflectDirection('/', 'S'), 'W');
  });

  it('maps backslash reflections', () => {
    assert.equal(reflectDirection('\\', 'E'), 'S');
    assert.equal(reflectDirection('\\', 'S'), 'E');
    assert.equal(reflectDirection('\\', 'W'), 'N');
    assert.equal(reflectDirection('\\', 'N'), 'W');
  });

  it('covers every direction for both mirror kinds', () => {
    for (const kind of Object.keys(REFLECTION) as Array<keyof typeof REFLECTION>) {
      for (const direction of Object.keys(REFLECTION[kind]) as Array<
        keyof (typeof REFLECTION)[typeof kind]
      >) {
        assert.ok(reflectDirection(kind, direction));
      }
    }
  });
});

describe('traceBeam', () => {
  it('sends a straight beam to the grid boundary', () => {
    const board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 0 },
    });

    const result = traceBeam(board);

    assert.equal(result.hitCrystal, false);
    assert.equal(result.terminatedBy, 'boundary');
    assert.deepEqual(result.segments[0]?.from, { x: 0, y: 3 });
    assert.deepEqual(result.segments.at(-1)?.to, { x: 6, y: 3 });
    assert.equal(result.segments.length, 6);
  });

  it('reflects eastbound light north with a slash mirror', () => {
    let board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 0 },
    });
    board = replaceTile(board, {
      id: 'mirror_1',
      type: 'mirror',
      x: 2,
      y: 3,
      mirror: '/',
    });

    const result = traceBeam(board);

    assert.equal(result.terminatedBy, 'boundary');
    assert.ok(
      result.segments.some(
        (segment) =>
          segment.from.x === 2 &&
          segment.from.y === 3 &&
          segment.to.x === 2 &&
          segment.to.y === 2
      )
    );
  });

  it('reflects eastbound light south with a backslash mirror', () => {
    let board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 0 },
    });
    board = replaceTile(board, {
      id: 'mirror_1',
      type: 'mirror',
      x: 2,
      y: 3,
      mirror: '\\',
    });

    const result = traceBeam(board);

    assert.ok(
      result.segments.some(
        (segment) =>
          segment.from.x === 2 &&
          segment.from.y === 3 &&
          segment.to.x === 2 &&
          segment.to.y === 4
      )
    );
  });

  it('stops at a closed gate', () => {
    let board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 3 },
    });
    board = replaceTile(board, {
      id: 'gate_1',
      type: 'gate',
      x: 2,
      y: 3,
      open: false,
    });

    const result = traceBeam(board);

    assert.equal(result.hitCrystal, false);
    assert.equal(result.terminatedBy, 'gate');
    assert.deepEqual(result.segments.at(-1)?.to, { x: 2, y: 3 });
  });

  it('passes through an open gate', () => {
    let board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 3 },
    });
    board = replaceTile(board, {
      id: 'gate_1',
      type: 'gate',
      x: 2,
      y: 3,
      open: true,
    });

    const result = traceBeam(board);

    assert.equal(result.hitCrystal, true);
    assert.equal(result.terminatedBy, 'crystal');
  });

  it('stops at a wall', () => {
    let board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 3 },
    });
    board = replaceTile(board, {
      id: 'wall_1',
      type: 'wall',
      x: 3,
      y: 3,
    });

    const result = traceBeam(board);

    assert.equal(result.hitCrystal, false);
    assert.equal(result.terminatedBy, 'wall');
  });

  it('marks the puzzle solved when the beam reaches the crystal', () => {
    const board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 3 },
    });

    const result = traceBeam(board);

    assert.equal(result.hitCrystal, true);
    assert.equal(result.terminatedBy, 'crystal');
    assert.deepEqual(result.segments.at(-1)?.to, { x: 6, y: 3 });
  });

  it('terminates safely when a reflection loop is detected', () => {
    // Rectangle loop: source sits on the bottom edge of the cycle.
    let board = createMinimalBoard({
      source: { x: 2, y: 3, direction: 'E' },
      crystal: { x: 6, y: 0 },
    });

    board = replaceTile(board, {
      id: 'm1',
      type: 'mirror',
      x: 3,
      y: 3,
      mirror: '/',
    });
    board = replaceTile(board, {
      id: 'm2',
      type: 'mirror',
      x: 3,
      y: 1,
      mirror: '\\',
    });
    board = replaceTile(board, {
      id: 'm3',
      type: 'mirror',
      x: 1,
      y: 1,
      mirror: '/',
    });
    board = replaceTile(board, {
      id: 'm4',
      type: 'mirror',
      x: 1,
      y: 3,
      mirror: '\\',
    });

    const result = traceBeam(board);

    assert.equal(result.hitCrystal, false);
    assert.equal(result.terminatedBy, 'loop');
    assert.ok(result.segments.length > 0);
  });

  it('is deterministic for the same board', () => {
    let board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 3 },
    });
    board = replaceTile(board, {
      id: 'mirror_1',
      type: 'mirror',
      x: 4,
      y: 3,
      mirror: '/',
    });

    assert.deepEqual(traceBeam(board), traceBeam(board));
  });
});
