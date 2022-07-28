import config from 'config';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

export class DashboardItem {
  claimId: string;
  claimNumber: string;
  claimAmount: number;
  claimantName: string;
  defendantName: string;
  responseDeadline?: Date;
  ocmc?: boolean;
  draft?: boolean;
  url: string;

  getHref (){
    return this.ocmc? `${ocmcBaseUrl}${this.url.replace(':claimId', this.claimId)}` : this.url.replace(':claimId', this.claimId);
  }
}

export class DashboardClaimantItem extends DashboardItem {
  constructor() {
    super();
    this.url = '/dashboard/:claimId/claimant';
  }
  nextSteps: string;// TODO: this is only a placeholder. To be revisited in a separate story
  actions: string;// TODO: this is only a placeholder. To be revisited in a separate story

}

export class DashboardDefendantItem extends DashboardItem {
  status: string;// TODO: this is only a placeholder. To be revisited in a separate story
  constructor() {
    super();
    this.url = '/dashboard/:claimId/defendant';
  }
}
