import type { ExerciseRunResult, ExerciseSpec } from '../runner/run-exercise';

export interface RunRequest {
  id: number;
  spec: ExerciseSpec;
  code: string;
}

export type RunResponse =
  { id: number; ok: true; result: ExerciseRunResult } | { id: number; ok: false; error: string };
