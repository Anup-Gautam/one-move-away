import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BOARD_CELL_COUNT,
  BOARD_HEIGHT,
  BOARD_WIDTH,
} from './constants.ts';
import {
  createMinimalBoard,
  findTilesByType,
  validateBoard,
} from './board.ts';

describe('createMinimalBoard', () => {
  it('creates a full 7×7 board with 49 tiles', () => {
    const board = createMinimalBoard();

    assert.equal(board.width, BOARD_WIDTH);
    assert.equal(board.height, BOARD_HEIGHT);
    assert.equal(board.tiles.length, BOARD_CELL_COUNT);
  });

  it('places exactly one source and one crystal', () => {
    const board = createMinimalBoard();

    assert.equal(findTilesByType(board, 'source').length, 1);
    assert.equal(findTilesByType(board, 'crystal').length, 1);
  });

  it('passes validation', () => {
    const result = validateBoard(createMinimalBoard());
    assert.equal(result.ok, true);
  });
});

describe('validateBoard', () => {
  it('rejects boards that are not 7×7', () => {
    const board = createMinimalBoard();
    board.width = 5;
    board.height = 5;

    const result = validateBoard(board);
    assert.equal(result.ok, false);
    assert.ok(!result.ok);
    assert.ok(result.issues.some((issue) => issue.code === 'INVALID_SIZE'));
  });

  it('rejects boards missing a source', () => {
    const board = createMinimalBoard();
    const source = findTilesByType(board, 'source')[0];
    assert.ok(source);
    source.type = 'empty';

    const result = validateBoard(board);
    assert.equal(result.ok, false);
    assert.ok(!result.ok);
    assert.ok(result.issues.some((issue) => issue.code === 'MISSING_SOURCE'));
  });

  it('rejects boards missing a crystal', () => {
    const board = createMinimalBoard();
    const crystal = findTilesByType(board, 'crystal')[0];
    assert.ok(crystal);
    crystal.type = 'empty';

    const result = validateBoard(board);
    assert.equal(result.ok, false);
    assert.ok(!result.ok);
    assert.ok(
      result.issues.some((issue) => issue.code === 'MISSING_CRYSTAL')
    );
  });

  it('rejects duplicate tile ids', () => {
    const board = createMinimalBoard();
    const first = board.tiles[0];
    const second = board.tiles[1];
    assert.ok(first);
    assert.ok(second);
    second.id = first.id;

    const result = validateBoard(board);
    assert.equal(result.ok, false);
    assert.ok(!result.ok);
    assert.ok(result.issues.some((issue) => issue.code === 'DUPLICATE_ID'));
  });

  it('rejects switches that do not target a gate', () => {
    const board = createMinimalBoard();
    const empty = board.tiles.find(
      (tile) => tile.type === 'empty' && tile.x === 1 && tile.y === 1
    );
    assert.ok(empty);
    empty.type = 'switch';
    empty.id = 'switch_1';
    empty.targetId = 'missing_gate';

    const result = validateBoard(board);
    assert.equal(result.ok, false);
    assert.ok(!result.ok);
    assert.ok(result.issues.some((issue) => issue.code === 'INVALID_SWITCH'));
  });
});
