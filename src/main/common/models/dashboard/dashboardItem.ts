import config from 'config';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

type DashboardDefendantStatus = {
  [propKey: string]: string
}
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
  status: string;
  constructor() {
    super();
    this.url = '/dashboard/:claimId/defendant';
  }

  getStatus() {
    const dashboardStatus: DashboardDefendantStatus =  {
      NO_STATUS:'',
      NO_RESPONSE: 'DASHBOARD.STATUS.NO_RESPONSE_ON_TIME',
      RESPONSE_OVERDUE: 'DASHBOARD.STATUS.NO_RESPONSE_OVERDUE',
      RESPONSE_DUE_NOW: 'DASHBOARD.STATUS.NO_RESPONSE_DUE_TODAY',
      ADMIT_PAY_IMMEDIATELY: 'DASHBOARD.STATUS.ADMIT_PAY_IMMEDIATELY',
      ADMIT_PAY_BY_SET_DATE: 'DASHBOARD.STATUS.ADMIT_PAY_BY_SET_DATE',
      ADMIT_PAY_INSTALLMENTS: 'DASHBOARD.STATUS.ADMIT_PAY_BY_INSTALLMENTS',
      ELIGIBLE_FOR_CCJ: 'DASHBOARD.STATUS.NO_RESPONSE_ELIGIBLE_CCJ',
      MORE_TIME_REQUESTED: 'DASHBOARD.STATUS.REQUESTED_MORE_TIME_TO_RESPOND',
      CLAIMANT_ACCEPTED_STATES_PAID: 'DASHBOARD.STATUS.CLAIMANT_CONFIRMED_PAYMENT',
      TRANSFERRED: 'DASHBOARD.STATUS.CASE_SENT_TO_COURT',
      REQUESTED_COUNTRY_COURT_JUDGEMENT: 'DASHBOARD.STATUS.CLAIMANT_REQUESTED_CCJ',
      SETTLED: 'DASHBOARD.STATUS.CLAIM_SETTLED',
    };
    return dashboardStatus[this.status];
  }
}

