export interface DashboardItem {
  claimNumber: string;
  claimAmount: number;
}

export interface DashboardClaimantItem extends DashboardItem {
  claimantName: string;
  nextSteps: string;// TODO: this is only a placeholder. To be revisited in a separate story
  responseDeadline?: Date;
  actions: string;// TODO: this is only a placeholder. To be revisited in a separate story
}

export interface DashboardDefendantItem extends DashboardItem {
  defendantName: string;
  status: string;// TODO: this is only a placeholder. To be revisited in a separate story
}
