export class DashboardItem {
  claimId: string;
  claimNumber: string;
  claimAmount: number;
  claimantName: string;
  defendantName: string;
  responseDeadline?: Date;
  ocmc?: boolean;
}

export class DashboardClaimantItem extends DashboardItem  {
  nextSteps: string;// TODO: this is only a placeholder. To be revisited in a separate story
  actions: string;// TODO: this is only a placeholder. To be revisited in a separate story
  getHref() {
    return `/dashboard/${this.claimId}/claimant`;
  }
}

export class DashboardDefendantItem extends DashboardItem {
  status: string;// TODO: this is only a placeholder. To be revisited in a separate story
  getHref() {
    return this.ocmc? '#' : `/dashboard/${this.claimId}/defendant`;
  }
}
