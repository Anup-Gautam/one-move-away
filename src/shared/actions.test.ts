import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyMove } from './actions.ts';
import { createMinimalBoard, replaceTiles } from './board.ts';
import { traceBeam } from './beamEngine.ts';

describe('applyMove', () => {
  it('rotates a mirror between / and \\ without mutating the input', () => {
    const board = replaceTiles(
      createMinimalBoard({
        source: { x: 0, y: 3, direction: 'E' },
        crystal: { x: 6, y: 0 },
      }),
      [{ id: 'M1', type: 'mirror', x: 2, y: 3, mirror: '/' }]
    );

    const next = applyMove(board, {
      type: 'ROTATE_MIRROR',
      tileId: 'M1',
    });

    const original = board.tiles.find((tile) => tile.id === 'M1');
    const updated = next.tiles.find((tile) => tile.id === 'M1');
    assert.equal(original?.mirror, '/');
    assert.equal(updated?.mirror, '\\');
  });

  it('toggles a switch-linked gate', () => {
    const board = replaceTiles(
      createMinimalBoard({
        source: { x: 0, y: 3, direction: 'E' },
        crystal: { x: 6, y: 3 },
      }),
      [
        { id: 'G1', type: 'gate', x: 3, y: 3, open: false },
        { id: 'SW1', type: 'switch', x: 0, y: 0, targetId: 'G1' },
      ]
    );

    const next = applyMove(board, {
      type: 'TOGGLE_SWITCH',
      tileId: 'SW1',
    });

    assert.equal(
      next.tiles.find((tile) => tile.id === 'G1')?.open,
      true
    );
    assert.equal(traceBeam(next).hitCrystal, true);
  });

  it('rejects rotating a non-mirror tile', () => {
    const board = createMinimalBoard();
    assert.throws(
      () =>
        applyMove(board, {
          type: 'ROTATE_MIRROR',
          tileId: 'source',
        }),
      /INVALID_ACTION/
    );
  });

  it('rejects unknown tile ids', () => {
    const board = createMinimalBoard();
    assert.throws(
      () =>
        applyMove(board, {
          type: 'ROTATE_MIRROR',
          tileId: 'missing',
        }),
      /INVALID_TILE/
    );
  });
});
