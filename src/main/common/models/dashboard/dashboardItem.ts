export class DashboardItem {
  claimId: string;
  claimNumber: string;
  claimAmount: number;
  claimantName: string;
  defendantName: string;
  responseDeadline?: Date;
}

export class DashboardClaimantItem extends DashboardItem {
  status: string;// TODO: this is only a placeholder. To be revisited in a separate story
}

export class DashboardDefendantItem extends DashboardItem {
  nextSteps: string;// TODO: this is only a placeholder. To be revisited in a separate story
  actions: string;// TODO: this is only a placeholder. To be revisited in a separate story
}
