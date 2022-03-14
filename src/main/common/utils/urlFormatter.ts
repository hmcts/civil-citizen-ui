export function getBaseUrlWithIdParam(id: string): string {
  return `/case/${id}/response`;
}

export function getFinancialDetailsUrlWithIdParam(id: string): string {
  return `/case/${id}/response/financial-details`;
}

export function getCitizenBankAccountUrlWithIdParam(id: string): string {
  return `/case/${id}/response/bank-accounts`;
}

export function getClaimTaskListAccountUrlWithIdParam(id: string): string {
  return `/case/${id}/response/claim-task-list`;
}
