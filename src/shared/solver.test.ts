import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyMove } from './actions.ts';
import { createMinimalBoard, replaceTiles } from './board.ts';
import { MOVES_PER_PLAYER, MIN_SOLUTION_MOVES } from './constants.ts';
import { isSolved, shortestSolution } from './solver.ts';
import { PUZZLES } from './puzzles.ts';

describe('shortestSolution', () => {
  it('returns an empty path when the board is already solved', () => {
    const board = createMinimalBoard({
      source: { x: 0, y: 3, direction: 'E' },
      crystal: { x: 6, y: 3 },
    });

    assert.equal(isSolved(board), true);
    assert.deepEqual(shortestSolution(board), []);
  });

  it('finds a one-move mirror fix', () => {
    const board = replaceTiles(
      createMinimalBoard({
        source: { x: 0, y: 3, direction: 'E' },
        crystal: { x: 3, y: 0 },
      }),
      [{ id: 'M1', type: 'mirror', x: 3, y: 3, mirror: '\\' }]
    );

    const solution = shortestSolution(board);
    assert.ok(solution);
    assert.equal(solution.length, 1);
    assert.deepEqual(solution[0], {
      type: 'ROTATE_MIRROR',
      tileId: 'M1',
    });

    const solved = applyMove(board, solution[0]!);
    assert.equal(isSolved(solved), true);
  });

  it('returns null for an unsolvable board', () => {
    const board = replaceTiles(
      createMinimalBoard({
        source: { x: 0, y: 3, direction: 'E' },
        crystal: { x: 6, y: 0 },
      }),
      [{ id: 'W1', type: 'wall', x: 1, y: 3 }]
    );

    assert.equal(shortestSolution(board), null);
  });
});

describe('daily puzzles', () => {
  it('publishes at least three verified boards', () => {
    assert.ok(PUZZLES.length >= 3);
  });

  for (const puzzle of PUZZLES) {
    it(`${puzzle.id} starts unsolved and needs >= ${MIN_SOLUTION_MOVES} moves`, () => {
      assert.equal(isSolved(puzzle.board), false);
      assert.ok(puzzle.minSolutionMoves >= MIN_SOLUTION_MOVES);
      assert.ok(puzzle.minSolutionMoves > MOVES_PER_PLAYER);

      const solution = shortestSolution(puzzle.board);
      assert.ok(solution);
      assert.equal(solution.length, puzzle.minSolutionMoves);

      const solved = solution.reduce(
        (board, action) => applyMove(board, action),
        puzzle.board
      );
      assert.equal(isSolved(solved), true);
    });
  }
});
