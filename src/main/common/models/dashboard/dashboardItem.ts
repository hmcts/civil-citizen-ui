import config from 'config';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

export interface StatusTranslation {
  translationKey: string;
  parameter?: {
    name?: string;
    value?: string;
  };
}

type DashboardDefendantStatus = {
  [propKey: string]: StatusTranslation
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
  translatedStatus: string;
  numberOfDays?: string;
  paymentDate? : Date;

  constructor() {
    super();
    this.url = '/dashboard/:claimId/defendant';
  }

  getStatus() {

    const paramNumberOfDays = {name: 'numberOfDays', value: this.numberOfDays};
    const paramPaymentDate = {name: 'paymentDate', value: formatDateToFullDate(this.paymentDate)};
    const paramClaimantName = {name: 'claimantName', value: this.claimantName};
    const paramResponseDeadline = {name: 'responseDeadline', value: formatDateToFullDate(this.responseDeadline)};
    const dashboardStatus: DashboardDefendantStatus =  {
      NO_STATUS: {translationKey:''},
      NO_RESPONSE: {translationKey:'PAGES.DASHBOARD.STATUS.NO_RESPONSE_ON_TIME', parameter: paramNumberOfDays},
      RESPONSE_OVERDUE: {translationKey: 'PAGES.DASHBOARD.STATUS.NO_RESPONSE_OVERDUE', parameter: paramNumberOfDays},
      RESPONSE_DUE_NOW: {translationKey: 'PAGES.DASHBOARD.STATUS.NO_RESPONSE_DUE_TODAY'},
      ADMIT_PAY_IMMEDIATELY: {translationKey:'PAGES.DASHBOARD.STATUS.ADMIT_PAY_IMMEDIATELY'},
      ADMIT_PAY_BY_SET_DATE: {translationKey:'PAGES.DASHBOARD.STATUS.ADMIT_PAY_BY_SET_DATE', parameter: paramPaymentDate},
      ADMIT_PAY_INSTALLMENTS: {translationKey: 'PAGES.DASHBOARD.STATUS.ADMIT_PAY_BY_INSTALLMENTS'} ,
      ELIGIBLE_FOR_CCJ: {translationKey: 'PAGES.DASHBOARD.STATUS.NO_RESPONSE_ELIGIBLE_CCJ', parameter: paramClaimantName},
      MORE_TIME_REQUESTED: {translationKey: 'PAGES.DASHBOARD.STATUS.REQUESTED_MORE_TIME_TO_RESPOND', parameter: paramResponseDeadline},
      CLAIMANT_ACCEPTED_STATES_PAID: {translationKey:'PAGES.DASHBOARD.STATUS.CLAIMANT_CONFIRMED_PAYMENT', parameter: paramClaimantName},
      TRANSFERRED: {translationKey: 'PAGES.DASHBOARD.STATUS.CASE_SENT_TO_COURT'},
      REQUESTED_COUNTRY_COURT_JUDGEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_REQUESTED_CCJ', parameter: paramClaimantName},
      SETTLED: {translationKey:'PAGES.DASHBOARD.STATUS.CLAIM_SETTLED'},
    };
    return (dashboardStatus[this.status]);
  }
}

