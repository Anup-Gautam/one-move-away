import {
  BOARD_CELL_COUNT,
  BOARD_HEIGHT,
  BOARD_WIDTH,
} from './constants.ts';
import type {
  Board,
  BoardValidationIssue,
  BoardValidationResult,
  Direction,
  Tile,
} from './types.ts';

export function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function createTileMap(board: Board): Map<string, Tile> {
  return new Map(board.tiles.map((tile) => [tileKey(tile.x, tile.y), tile]));
}

export function getTileAt(
  board: Board,
  x: number,
  y: number
): Tile | undefined {
  return board.tiles.find((tile) => tile.x === x && tile.y === y);
}

export function findTilesByType(
  board: Board,
  type: Tile['type']
): Tile[] {
  return board.tiles.filter((tile) => tile.type === type);
}

export function isInBounds(board: Board, x: number, y: number): boolean {
  return x >= 0 && x < board.width && y >= 0 && y < board.height;
}

/** Replaces the tile occupying (next.x, next.y). */
export function replaceTile(board: Board, next: Tile): Board {
  return {
    ...board,
    tiles: board.tiles.map((tile) =>
      tile.x === next.x && tile.y === next.y ? next : tile
    ),
  };
}

/** Applies several tile replacements in order. */
export function replaceTiles(board: Board, nextTiles: Tile[]): Board {
  return nextTiles.reduce(
    (current, tile) => replaceTile(current, tile),
    board
  );
}

/**
 * Builds a complete 7×7 board of empty cells, then places a directed
 * source and a crystal. Useful for Day 1 validation and later tests.
 */
export function createMinimalBoard(options?: {
  source?: { x: number; y: number; direction: Direction };
  crystal?: { x: number; y: number };
}): Board {
  const source = options?.source ?? { x: 0, y: 3, direction: 'E' as const };
  const crystal = options?.crystal ?? { x: 6, y: 3 };

  const tiles: Tile[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (x === source.x && y === source.y) {
        tiles.push({
          id: 'source',
          type: 'source',
          x,
          y,
          direction: source.direction,
        });
        continue;
      }

      if (x === crystal.x && y === crystal.y) {
        tiles.push({
          id: 'crystal',
          type: 'crystal',
          x,
          y,
        });
        continue;
      }

      tiles.push({
        id: `empty_${x}_${y}`,
        type: 'empty',
        x,
        y,
      });
    }
  }

  return {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    tiles,
  };
}

export function validateBoard(board: Board): BoardValidationResult {
  const issues: BoardValidationIssue[] = [];

  if (board.width !== BOARD_WIDTH || board.height !== BOARD_HEIGHT) {
    issues.push({
      code: 'INVALID_SIZE',
      message: `Board must be ${BOARD_WIDTH}×${BOARD_HEIGHT}, got ${board.width}×${board.height}`,
    });
  }

  if (board.tiles.length !== BOARD_CELL_COUNT) {
    issues.push({
      code: 'WRONG_TILE_COUNT',
      message: `Board must contain exactly ${BOARD_CELL_COUNT} tiles, got ${board.tiles.length}`,
    });
  }

  const seenIds = new Set<string>();
  const seenCoords = new Set<string>();
  const sources: Tile[] = [];
  const crystals: Tile[] = [];

  for (const tile of board.tiles) {
    if (seenIds.has(tile.id)) {
      issues.push({
        code: 'DUPLICATE_ID',
        message: `Duplicate tile id "${tile.id}"`,
      });
    } else {
      seenIds.add(tile.id);
    }

    const coord = tileKey(tile.x, tile.y);
    if (seenCoords.has(coord)) {
      issues.push({
        code: 'DUPLICATE_COORDINATE',
        message: `Duplicate tile at (${tile.x}, ${tile.y})`,
      });
    } else {
      seenCoords.add(coord);
    }

    if (!isInBounds(board, tile.x, tile.y)) {
      issues.push({
        code: 'OUT_OF_BOUNDS',
        message: `Tile "${tile.id}" is out of bounds at (${tile.x}, ${tile.y})`,
      });
    }

    if (tile.type === 'source') {
      sources.push(tile);
      if (!tile.direction) {
        issues.push({
          code: 'INVALID_SOURCE',
          message: `Source "${tile.id}" must define a direction`,
        });
      }
    }

    if (tile.type === 'crystal') {
      crystals.push(tile);
    }

    if (tile.type === 'mirror' && !tile.mirror) {
      issues.push({
        code: 'INVALID_MIRROR',
        message: `Mirror "${tile.id}" must define a mirror kind`,
      });
    }

    if (tile.type === 'gate' && typeof tile.open !== 'boolean') {
      issues.push({
        code: 'INVALID_GATE',
        message: `Gate "${tile.id}" must define open: boolean`,
      });
    }

    if (tile.type === 'switch') {
      if (!tile.targetId) {
        issues.push({
          code: 'INVALID_SWITCH',
          message: `Switch "${tile.id}" must define targetId`,
        });
      } else {
        const target = board.tiles.find((candidate) => candidate.id === tile.targetId);
        if (!target || target.type !== 'gate') {
          issues.push({
            code: 'INVALID_SWITCH',
            message: `Switch "${tile.id}" must target an existing gate`,
          });
        }
      }
    }
  }

  if (sources.length === 0) {
    issues.push({
      code: 'MISSING_SOURCE',
      message: 'Board must contain exactly one source',
    });
  } else if (sources.length > 1) {
    issues.push({
      code: 'MULTIPLE_SOURCES',
      message: `Board must contain exactly one source, found ${sources.length}`,
    });
  }

  if (crystals.length === 0) {
    issues.push({
      code: 'MISSING_CRYSTAL',
      message: 'Board must contain exactly one crystal',
    });
  } else if (crystals.length > 1) {
    issues.push({
      code: 'MULTIPLE_CRYSTALS',
      message: `Board must contain exactly one crystal, found ${crystals.length}`,
    });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true };
}
