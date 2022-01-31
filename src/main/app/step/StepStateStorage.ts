export interface StepStateStorage {

  getCurrentState(): SessionState,
  store(state: SessionState): Promise<void>

}

export type SessionState = Record<string, unknown>;
