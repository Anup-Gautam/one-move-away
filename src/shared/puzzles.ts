import {
  createMinimalBoard,
  replaceTiles,
  validateBoard,
} from './board.ts';
import { MIN_SOLUTION_MOVES } from './constants.ts';
import { isSolved, shortestSolution } from './solver.ts';
import type { Board, Direction, Tile } from './types.ts';

export type PuzzleDefinition = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  board: Board;
  /** Verified shortest solution length from the published start state. */
  minSolutionMoves: number;
};

function buildPuzzleBoard(
  source: { x: number; y: number; direction: Direction },
  crystal: { x: number; y: number },
  overlays: Tile[]
): Board {
  return replaceTiles(createMinimalBoard({ source, crystal }), overlays);
}

/**
 * Puzzle 001 — six wrong mirrors on a forced staircase.
 * Solved orientations: / \\ \\ \\ \\ \\
 */
const puzzle001Board = buildPuzzleBoard(
  { x: 0, y: 1, direction: 'N' },
  { x: 6, y: 6 },
  [
    { id: 'M1', type: 'mirror', x: 0, y: 0, mirror: '\\' },
    { id: 'M2', type: 'mirror', x: 2, y: 0, mirror: '/' },
    { id: 'M3', type: 'mirror', x: 2, y: 2, mirror: '/' },
    { id: 'M4', type: 'mirror', x: 4, y: 2, mirror: '/' },
    { id: 'M5', type: 'mirror', x: 4, y: 4, mirror: '/' },
    { id: 'M6', type: 'mirror', x: 6, y: 4, mirror: '/' },
  ]
);

/**
 * Puzzle 002 — five mirrors plus a closed gate on the final approach.
 * Solved: all path mirrors \\, gate open.
 */
const puzzle002Board = buildPuzzleBoard(
  { x: 0, y: 0, direction: 'E' },
  { x: 6, y: 6 },
  [
    { id: 'M1', type: 'mirror', x: 2, y: 0, mirror: '/' },
    { id: 'M2', type: 'mirror', x: 2, y: 2, mirror: '/' },
    { id: 'M3', type: 'mirror', x: 4, y: 2, mirror: '/' },
    { id: 'M4', type: 'mirror', x: 4, y: 4, mirror: '/' },
    { id: 'M5', type: 'mirror', x: 6, y: 4, mirror: '/' },
    { id: 'G1', type: 'gate', x: 6, y: 5, open: false },
    { id: 'SW1', type: 'switch', x: 0, y: 6, targetId: 'G1' },
  ]
);

/**
 * Puzzle 003 — staircase with a required gate and an off-path decoy gate.
 */
const puzzle003Board = buildPuzzleBoard(
  { x: 0, y: 0, direction: 'S' },
  { x: 6, y: 6 },
  [
    { id: 'M1', type: 'mirror', x: 0, y: 2, mirror: '/' },
    { id: 'M2', type: 'mirror', x: 2, y: 2, mirror: '/' },
    { id: 'M3', type: 'mirror', x: 2, y: 4, mirror: '/' },
    { id: 'M4', type: 'mirror', x: 4, y: 4, mirror: '/' },
    { id: 'M5', type: 'mirror', x: 4, y: 6, mirror: '/' },
    { id: 'G1', type: 'gate', x: 5, y: 6, open: false },
    { id: 'G2', type: 'gate', x: 3, y: 0, open: false },
    { id: 'SW1', type: 'switch', x: 6, y: 0, targetId: 'G1' },
    { id: 'SW2', type: 'switch', x: 1, y: 0, targetId: 'G2' },
  ]
);

function assertPublishable(
  puzzle: Omit<PuzzleDefinition, 'minSolutionMoves'>
): PuzzleDefinition {
  const validation = validateBoard(puzzle.board);
  if (!validation.ok) {
    throw new Error(
      `Puzzle ${puzzle.id} failed validation: ${validation.issues
        .map((issue) => issue.message)
        .join('; ')}`
    );
  }

  if (isSolved(puzzle.board)) {
    throw new Error(`Puzzle ${puzzle.id} must start unsolved`);
  }

  const solution = shortestSolution(puzzle.board);
  if (!solution) {
    throw new Error(`Puzzle ${puzzle.id} has no solution`);
  }

  if (solution.length < MIN_SOLUTION_MOVES) {
    throw new Error(
      `Puzzle ${puzzle.id} shortest solution is ${solution.length}, need >= ${MIN_SOLUTION_MOVES}`
    );
  }

  return {
    ...puzzle,
    minSolutionMoves: solution.length,
  };
}

export const PUZZLES: PuzzleDefinition[] = [
  assertPublishable({
    id: 'puzzle-001',
    title: 'The Brass Zigzag',
    difficulty: 'easy',
    board: puzzle001Board,
  }),
  assertPublishable({
    id: 'puzzle-002',
    title: 'Gate of the Lower Crystal',
    difficulty: 'medium',
    board: puzzle002Board,
  }),
  assertPublishable({
    id: 'puzzle-003',
    title: 'Twin Lock Corridor',
    difficulty: 'medium',
    board: puzzle003Board,
  }),
];

export function getPuzzleById(id: string): PuzzleDefinition | undefined {
  return PUZZLES.find((puzzle) => puzzle.id === id);
}
