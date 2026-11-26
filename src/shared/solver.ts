import { applyMove } from './actions.ts';
import { traceBeam } from './beamEngine.ts';
import type { Board, MoveAction } from './types.ts';

function encodeBoard(board: Board): string {
  return board.tiles
    .filter((tile) => tile.type === 'mirror' || tile.type === 'gate')
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((tile) =>
      tile.type === 'mirror'
        ? `${tile.id}:${tile.mirror}`
        : `${tile.id}:${tile.open ? 1 : 0}`
    )
    .join('|');
}

export function availableActions(board: Board): MoveAction[] {
  return board.tiles.flatMap((tile): MoveAction[] => {
    if (tile.type === 'mirror') {
      return [{ type: 'ROTATE_MIRROR', tileId: tile.id }];
    }
    if (tile.type === 'switch') {
      return [{ type: 'TOGGLE_SWITCH', tileId: tile.id }];
    }
    return [];
  });
}

/**
 * Breadth-first search for a shortest solution.
 * Returns null if unsolvable within maxStates explored boards.
 */
export function shortestSolution(
  initial: Board,
  maxStates = 100_000
): MoveAction[] | null {
  if (traceBeam(initial).hitCrystal) {
    return [];
  }

  const queue: Array<{ board: Board; path: MoveAction[] }> = [
    { board: initial, path: [] },
  ];
  const seen = new Set([encodeBoard(initial)]);
  let head = 0;

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    if (!current) {
      break;
    }

    for (const action of availableActions(current.board)) {
      const nextBoard = applyMove(current.board, action);
      const key = encodeBoard(nextBoard);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      if (seen.size > maxStates) {
        throw new Error('SOLVER_STATE_LIMIT');
      }

      const nextPath = [...current.path, action];
      if (traceBeam(nextBoard).hitCrystal) {
        return nextPath;
      }

      queue.push({ board: nextBoard, path: nextPath });
    }
  }

  return null;
}

export function isSolved(board: Board): boolean {
  return traceBeam(board).hitCrystal;
}
