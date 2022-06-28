export class DashboardItem {
  claimId: string;
  claimNumber: string;
  claimAmount: number;
}

export class DashboardClaimantItem extends DashboardItem {
  claimantName: string;
  nextSteps: string;// TODO: this is only a placeholder. To be revisited in a separate story
  responseDeadline?: Date;
  actions: string;// TODO: this is only a placeholder. To be revisited in a separate story
}

export class DashboardDefendantItem extends DashboardItem {
  defendantName: string;
  status: string;// TODO: this is only a placeholder. To be revisited in a separate story
}
