import { createTileMap, findTilesByType, isInBounds } from './board.ts';
import type {
  BeamResult,
  Board,
  Direction,
  MirrorKind,
} from './types.ts';

export const STEP: Record<Direction, readonly [number, number]> = {
  N: [0, -1],
  E: [1, 0],
  S: [0, 1],
  W: [-1, 0],
};

/**
 * Slash `/` and backslash `\` reflection table.
 * Example: `/` turns eastbound light north.
 */
export const REFLECTION: Record<
  MirrorKind,
  Record<Direction, Direction>
> = {
  '/': {
    N: 'E',
    E: 'N',
    S: 'W',
    W: 'S',
  },
  '\\': {
    N: 'W',
    W: 'N',
    S: 'E',
    E: 'S',
  },
};

export function reflectDirection(
  mirror: MirrorKind,
  direction: Direction
): Direction {
  return REFLECTION[mirror][direction];
}

/**
 * Deterministic single-beam ray tracer.
 * Given the same board, always returns the same path and termination.
 */
export function traceBeam(board: Board): BeamResult {
  const sources = findTilesByType(board, 'source');
  const source = sources[0];

  if (!source || sources.length !== 1 || !source.direction) {
    throw new Error('Board must contain exactly one directed source');
  }

  const cells = createTileMap(board);

  let x = source.x;
  let y = source.y;
  let direction = source.direction;

  const segments: BeamResult['segments'] = [];
  const visited = new Set<string>();

  while (true) {
    const visitKey = `${x},${y},${direction}`;
    if (visited.has(visitKey)) {
      return {
        segments,
        hitCrystal: false,
        terminatedBy: 'loop',
      };
    }
    visited.add(visitKey);

    const step = STEP[direction];
    const nx = x + step[0];
    const ny = y + step[1];

    if (!isInBounds(board, nx, ny)) {
      return {
        segments,
        hitCrystal: false,
        terminatedBy: 'boundary',
      };
    }

    segments.push({
      from: { x, y },
      to: { x: nx, y: ny },
    });

    const tile = cells.get(`${nx},${ny}`);

    if (tile?.type === 'wall') {
      return {
        segments,
        hitCrystal: false,
        terminatedBy: 'wall',
      };
    }

    if (tile?.type === 'gate' && tile.open !== true) {
      return {
        segments,
        hitCrystal: false,
        terminatedBy: 'gate',
      };
    }

    if (tile?.type === 'crystal') {
      return {
        segments,
        hitCrystal: true,
        terminatedBy: 'crystal',
      };
    }

    if (tile?.type === 'mirror') {
      if (!tile.mirror) {
        throw new Error(`Mirror "${tile.id}" is missing a mirror kind`);
      }
      direction = reflectDirection(tile.mirror, direction);
    }

    x = nx;
    y = ny;
  }
}
