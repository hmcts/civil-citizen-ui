export interface DraftClaimRequest {
  caseId?: string;
  payload: Record<string, unknown>;
}

export interface DraftClaimResponse {
  draftId: string;
  caseId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}
