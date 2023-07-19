import config from 'config';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

export interface DashboardStatusTranslationParam {
  key: string;
  value: string;
}

export interface StatusTranslation {
  translationKey: string;
  parameter?: DashboardStatusTranslationParam [];
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

  getHref() {
    return this.ocmc ? `${ocmcBaseUrl}${this.url.replace(':claimId', this.claimId)}` : this.url.replace(':claimId', this.claimId);
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
  numberOfDays?: string;
  numberOfDaysOverdue?: string;
  paymentDate?: Date;
  ccjRequestedDate?: Date;
  admittedAmount?: number;
  createdDate?: Date;
  respondToAdmittedClaimOwingAmountPounds?:number;

  constructor() {
    super();
    this.url = '/dashboard/:claimId/defendant';
  }

  getStatus(lang: string | unknown) {
    const paramNumberOfDays = {key: 'numberOfDays', value: this.numberOfDays};
    const paramNumberOfDaysOverdue = {key: 'numberOfDays', value: this.numberOfDaysOverdue};
    const paramPaymentDate = {key: 'paymentDate', value: formatDateToFullDate(this.paymentDate, lang)};
    const paramClaimantName = {key: 'claimantName', value: this.claimantName};
    const paramCCJRequestedDate = {key: 'ccjRequestedDate', value: formatDateToFullDate(this.ccjRequestedDate, lang)};
    const paramResponseDeadline = {key: 'responseDeadline', value: formatDateToFullDate(this.responseDeadline, lang)};
    const paramAdmittedAmount = {key: 'amount', value: this.respondToAdmittedClaimOwingAmountPounds?.toString() ?? this.admittedAmount?.toString()};

    const dashboardStatus: DashboardDefendantStatus = {
      NO_STATUS: {translationKey: ''},
      NO_RESPONSE: {translationKey: 'PAGES.DASHBOARD.STATUS.NO_RESPONSE_ON_TIME', parameter: [paramNumberOfDays]},
      RESPONSE_OVERDUE: {
        translationKey: 'PAGES.DASHBOARD.STATUS.NO_RESPONSE_OVERDUE',
        parameter: [paramNumberOfDaysOverdue],
      },
      RESPONSE_DUE_NOW: {translationKey: 'PAGES.DASHBOARD.STATUS.NO_RESPONSE_DUE_TODAY'},
      ADMIT_PAY_IMMEDIATELY: {translationKey: 'PAGES.DASHBOARD.STATUS.ADMIT_PAY_IMMEDIATELY'},
      ADMIT_PAY_BY_SET_DATE: {
        translationKey: 'PAGES.DASHBOARD.STATUS.ADMIT_PAY_BY_SET_DATE',
        parameter: [paramPaymentDate],
      },
      ADMIT_PAY_INSTALLMENTS: {translationKey: 'PAGES.DASHBOARD.STATUS.ADMIT_PAY_BY_INSTALLMENTS'},
      ELIGIBLE_FOR_CCJ: {
        translationKey: 'PAGES.DASHBOARD.STATUS.NO_RESPONSE_ELIGIBLE_CCJ',
        parameter: [paramClaimantName],
      },
      MORE_TIME_REQUESTED: {
        translationKey: 'PAGES.DASHBOARD.STATUS.REQUESTED_MORE_TIME_TO_RESPOND',
        parameter: [paramResponseDeadline],
      },
      CLAIMANT_ACCEPTED_STATES_PAID: {
        translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_CONFIRMED_PAYMENT',
        parameter: [paramClaimantName],
      },
      TRANSFERRED: {translationKey: 'PAGES.DASHBOARD.STATUS.CASE_SENT_TO_COURT'},
      REQUESTED_COUNTRY_COURT_JUDGEMENT: {
        translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_REQUESTED_CCJ',
        parameter: [paramClaimantName, paramCCJRequestedDate],
      },
      REQUESTED_CCJ_BY_REDETERMINATION: {
        translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_REQUESTED_CCJ_BY_DETERMINATION',
        parameter: [paramClaimantName],
      },
      SETTLED: {translationKey: 'PAGES.DASHBOARD.STATUS.CLAIM_SETTLED'},
      RESPONSE_BY_POST: {translationKey: 'PAGES.DASHBOARD.STATUS.RESPONSE_BY_POST'},
      CHANGE_BY_DEFENDANT: {translationKey: 'PAGES.DASHBOARD.STATUS.REQUESTED_CHANGE_BY_DEFENDANT'},
      CHANGE_BY_CLAIMANT: {translationKey: 'PAGES.DASHBOARD.STATUS.REQUESTED_CHANGE_BY_CLAIMANT'},
      WAITING_FOR_CLAIMANT_TO_RESPOND: {translationKey: 'PAGES.DASHBOARD.STATUS.AWAITING_CLAIMANT_RESPONSE'},
      CLAIMANT_ASKED_FOR_SETTLEMENT: {
        translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_ASKED_TO_SIGN_AGREEMENT',
        parameter: [paramClaimantName],
      },
      PASSED_TO_COUNTRY_COURT_BUSINESS_CENTRE: {translationKey: 'PAGES.DASHBOARD.STATUS.CASE_PASSED_TO_COURT_ORDER_BUSINESS_CENTRE'},
      CLAIMANT_ACCEPTED_ADMISSION_OF_AMOUNT: {
        translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_ACCEPTED_PART_ADMIT_PAYMENT',
        parameter: [paramClaimantName, paramAdmittedAmount],
      },
      SETTLEMENT_SIGNED: {translationKey: 'PAGES.DASHBOARD.STATUS.SETTLEMENT_SIGNED'},
      DEFENDANT_PART_ADMIT_PAID: {
        translationKey: 'PAGES.DASHBOARD.STATUS.PART_ADMIT_STATES_PAID',
        parameter: [paramClaimantName],
      },
      DEFENDANT_PART_ADMIT: {translationKey: 'PAGES.DASHBOARD.STATUS.PART_ADMIT_NOT_PAID'},
      HEARING_FORM_GENERATED: {translationKey: 'PAGES.DASHBOARD.STATUS.TRIAL_OR_HEARING_SCHEDULED'},
      MORE_DETAILS_REQUIRED: { translationKey: 'PAGES.DASHBOARD.STATUS.MORE_DETAILS_REQUIRED' },
      MEDIATION_SUCCESSFUL: { translationKey: 'PAGES.DASHBOARD.STATUS.MEDIATION_SUCCESSFUL' },
      MEDIATION_UNSUCCESSFUL: { translationKey: 'PAGES.DASHBOARD.STATUS.MEDIATION_UNSUCCESSFUL' },
      IN_MEDIATION: { translationKey: 'PAGES.DASHBOARD.STATUS.IN_MEDIATION' },
      WAITING_COURT_REVIEW: { translationKey: 'PAGES.DASHBOARD.STATUS.WAITING_COURT_REVIEW' },
      CLAIM_ENDED: { translationKey: 'PAGES.DASHBOARD.STATUS.CLAIM_ENDED' },
      CLAIM_SENT_TO_CLAIMANT: { translationKey: 'PAGES.DASHBOARD.STATUS.CLAIM_SENT_TO_CLAIMANT'},
      CLAIMANT_REJECT_OFFER: { translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_REJECT_OFFER'},
      CLAIMANT_ACCEPTED_SETTLE_IN_COURT: { translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_ACCEPTED_SETTLE_IN_COURT' },
      CLAIMANT_REJECT_PARTIAL_ADMISSION: {
        translationKey: 'PAGES.DASHBOARD.STATUS.CLAIMANT_REJECT_PARTIAL_ADMISSION',
        parameter: [paramClaimantName],
      },

    };
    const currentStatus = dashboardStatus[this.status];
    return translate(currentStatus.translationKey, currentStatus.parameter, lang);
  }
}

export const translate = (translationKey: string, params?: DashboardStatusTranslationParam[], lang?: string | unknown) => {
  if (params && params.length) {
    const keyValue: { [k: string]: string } = {};
    params.forEach(param => {
      keyValue[param.key] = param.value;
    });
    keyValue.lng = getLng(lang);
    return t(translationKey, keyValue);
  }
  return t(translationKey, {lng:getLng(lang)} );
};
