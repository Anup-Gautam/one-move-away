/** Launch board size for daily machines. */
export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 7;
export const BOARD_CELL_COUNT = BOARD_WIDTH * BOARD_HEIGHT;

/** Each Reddit account gets this many accepted moves per daily puzzle. */
export const MOVES_PER_PLAYER = 3;

/**
 * Shortest solution from the published starting board must be at least
 * this many moves so one player cannot finish alone.
 */
export const MIN_SOLUTION_MOVES = 6;

export const DIRECTIONS = ['N', 'E', 'S', 'W'] as const;

export const MIRROR_KINDS = ['/', '\\'] as const;
