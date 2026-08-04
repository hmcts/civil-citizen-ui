export interface DraftClaimRequest {
  caseId?: string;
  payload: Record<string, unknown>;
}

export interface DraftClaimResponse {
  draftId: string;
  userId: string;
  caseId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}
