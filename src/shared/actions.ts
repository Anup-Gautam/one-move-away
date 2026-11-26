import type { Board, MoveAction, Tile } from './types.ts';

function updateTiles(
  board: Board,
  changes: Map<string, Partial<Tile>>
): Board {
  return {
    ...board,
    tiles: board.tiles.map((tile) => {
      const patch = changes.get(tile.id);
      if (!patch) {
        return tile;
      }
      return { ...tile, ...patch };
    }),
  };
}

/**
 * Applies a single player action and returns a new board.
 * Does not mutate the input and does not enforce move budgets.
 */
export function applyMove(board: Board, action: MoveAction): Board {
  const selected = board.tiles.find((tile) => tile.id === action.tileId);

  if (!selected) {
    throw new Error('INVALID_TILE');
  }

  const changes = new Map<string, Partial<Tile>>();

  if (action.type === 'ROTATE_MIRROR') {
    if (selected.type !== 'mirror' || !selected.mirror) {
      throw new Error('INVALID_ACTION');
    }

    changes.set(selected.id, {
      mirror: selected.mirror === '/' ? '\\' : '/',
    });
  } else if (action.type === 'TOGGLE_SWITCH') {
    if (selected.type !== 'switch' || !selected.targetId) {
      throw new Error('INVALID_ACTION');
    }

    const gate = board.tiles.find((tile) => tile.id === selected.targetId);
    if (!gate || gate.type !== 'gate') {
      throw new Error('INVALID_GATE');
    }

    changes.set(gate.id, {
      open: !gate.open,
    });
  } else {
    const _exhaustive: never = action;
    throw new Error(`INVALID_ACTION: ${JSON.stringify(_exhaustive)}`);
  }

  return updateTiles(board, changes);
}
