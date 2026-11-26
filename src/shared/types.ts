export type Direction = 'N' | 'E' | 'S' | 'W';

export type TileType =
  | 'empty'
  | 'wall'
  | 'source'
  | 'mirror'
  | 'gate'
  | 'switch'
  | 'crystal';

export type MirrorKind = '/' | '\\';

export type Tile = {
  id: string;
  type: TileType;
  x: number;
  y: number;
  /** Emission direction for energy sources. */
  direction?: Direction;
  /** Reflection shape for mirrors. */
  mirror?: MirrorKind;
  /** Whether a gate currently allows the beam through. */
  open?: boolean;
  /** Gate tile id controlled by a switch. */
  targetId?: string;
};

export type Board = {
  width: number;
  height: number;
  tiles: Tile[];
};

export type Position = {
  x: number;
  y: number;
};

export type BeamSegment = {
  from: Position;
  to: Position;
};

export type BeamTermination =
  | 'crystal'
  | 'wall'
  | 'gate'
  | 'boundary'
  | 'loop';

export type BeamResult = {
  segments: BeamSegment[];
  hitCrystal: boolean;
  terminatedBy: BeamTermination;
};

export type MoveAction =
  | {
      type: 'ROTATE_MIRROR';
      tileId: string;
    }
  | {
      type: 'TOGGLE_SWITCH';
      tileId: string;
    };

export type PuzzleStatus = 'active' | 'solved' | 'expired';

export type GameSnapshot = {
  puzzleId: string;
  version: number;
  board: Board;
  status: PuzzleStatus;
  movesRemaining: number;
  totalMoves: number;
};

export type BoardValidationIssue = {
  code:
    | 'INVALID_SIZE'
    | 'WRONG_TILE_COUNT'
    | 'DUPLICATE_ID'
    | 'DUPLICATE_COORDINATE'
    | 'OUT_OF_BOUNDS'
    | 'MISSING_SOURCE'
    | 'MULTIPLE_SOURCES'
    | 'MISSING_CRYSTAL'
    | 'MULTIPLE_CRYSTALS'
    | 'INVALID_SOURCE'
    | 'INVALID_MIRROR'
    | 'INVALID_GATE'
    | 'INVALID_SWITCH';
  message: string;
};

export type BoardValidationResult =
  | { ok: true }
  | { ok: false; issues: BoardValidationIssue[] };
