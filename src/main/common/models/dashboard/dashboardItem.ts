import config from 'config';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

export interface DashboardStatusTranslationParam {
  key: string;
  value: string;
}

export interface StatusTranslation {
  translationKey: string;
  parameter?: DashboardStatusTranslationParam [];
}

type DashboardStatus = {
  [propKey: string]: StatusTranslation
};
export abstract class DashboardItem {
  status: string;
  claimId: string;
  claimNumber: string;
  claimAmount: number;
  claimantName: string;
  defendantName: string;
  responseDeadline?: Date;
  numberOfDays?: string;
  numberOfDaysOverdue?: string;
  paymentDate?: Date;
  ccjRequestedDate?: Date;
  admittedAmount?: number;
  ocmc?: boolean;
  draft?: boolean;
  url: string;

  getHref() {
    return this.ocmc ? `${ocmcBaseUrl}${this.url.replace(':claimId', this.claimId)}` : this.url.replace(':claimId', this.claimId);
  }

  getStatus(lang: string ): string {
    const dashboardStatus = this.getDashboardStatus(lang);
    const currentStatus = dashboardStatus[this.status];
    return currentStatus? translate(currentStatus?.translationKey, currentStatus?.parameter, lang): '';
  }
  abstract getDashboardStatus(lang: string): DashboardStatus;
}

export class DashboardClaimantItem extends DashboardItem {
  constructor() {
    super();
    this.url = '/dashboard/:claimId/claimant';

  }

  getDashboardStatus(lang: string ): DashboardStatus {
    const paramDefendantName = {key: 'defendantName', value: this.defendantName};

    return {
      NO_STATUS: {translationKey: ''},
      NO_RESPONSE: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NO_RESPONSE_ON_TIME'},
      ELIGIBLE_FOR_CCJ: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NO_RESPONSE_ELIGIBLE_CCJ'},
      MORE_TIME_REQUESTED: {
        translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.REQUESTED_MORE_TIME_TO_RESPOND',
        parameter: [paramDefendantName],
      },
      REQUESTED_COUNTRY_COURT_JUDGEMENT: {
        translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIMANT_REQUESTED_CCJ',
        parameter: [paramDefendantName],
      },
      ADMIT_PAY_BY_SET_DATE: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      ADMIT_PAY_INSTALLMENTS : { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      ADMIT_PAY_IMMEDIATELY: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.ADMIT_PAY_IMMEDIATELY_CLAIMANT'},
      CLAIM_ENDED: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIM_ENDED' },
      CLAIMANT_ACCEPTED_PARTIAL_ADMISSION:{translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.ACCEPTED_PARTIAL_ADMISSION'},
      CLAIMANT_REJECTED_PAYMENT_PLAN:{translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIMANT_REJECTED_PAYMENT_PLAN'},
      DEFENDANT_PART_ADMIT: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      DEFENDANT_PART_ADMIT_PAID: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      RESPONSE_BY_POST: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.RESPONSE_BY_POST'},
      WAITING_FOR_CLAIMANT_TO_RESPOND: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      WAITING_COURT_REVIEW: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.WAITING_COURT_REVIEW'},
      DEFAULT_JUDGEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIMANT_REQUESTED_CCJ'},
      CLAIMANT_AND_DEFENDANT_SIGNED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.BOTH_SIGNED_SETTLEMENT_AGREEMENT'},
      CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT'},
      CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT_DEADLINE_EXPIRED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT_DEADLINE_EXPIRED'},
      DEFENDANT_REJECTED_SETTLEMENT_AGREEMENT: {
        translationKey:
          'PAGES.DASHBOARD.STATUS_CLAIMANT.DEFENDANT_REJECTED_SETTLEMENT_AGREEMENT',
        parameter: [paramDefendantName],
      },
      IN_MEDIATION:  {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.IN_MEDIATION'},
      MEDIATION_SUCCESSFUL:  {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.MEDIATION_SUCCESSFUL'},
      MEDIATION_UNSUCCESSFUL:  {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.MEDIATION_UNSUCCESSFUL'},
      CLAIMANT_REJECT_PARTIAL_ADMISSION : {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.WAITING_COURT_REVIEW'},
    };
  }

}

export class DashboardDefendantItem extends DashboardItem {

  createdDate?: Date;
  respondToAdmittedClaimOwingAmountPounds?:number;

  constructor() {
    super();
    this.url = '/dashboard/:claimId/defendant';
  }

  getDashboardStatus(lang: string ): DashboardStatus {
    const paramNumberOfDays = {key: 'numberOfDays', value: this.numberOfDays};
    const paramNumberOfDaysOverdue = {key: 'numberOfDays', value: this.numberOfDaysOverdue};
    const paramPaymentDate = {key: 'paymentDate', value: formatDateToFullDate(this.paymentDate, lang)};
    const paramClaimantName = {key: 'claimantName', value: this.claimantName};
    const paramCCJRequestedDate = {key: 'ccjRequestedDate', value: formatDateToFullDate(this.ccjRequestedDate, lang)};
    const paramResponseDeadline = {key: 'responseDeadline', value: formatDateToFullDate(this.responseDeadline, lang)};
    const paramAdmittedAmount = {key: 'amount', value: this.respondToAdmittedClaimOwingAmountPounds?.toString() ?? this.admittedAmount?.toString()};

    return {
      NO_STATUS: {translationKey: ''},
      NO_RESPONSE: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.NO_RESPONSE_ON_TIME', parameter: [paramNumberOfDays]},
      RESPONSE_OVERDUE: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.NO_RESPONSE_OVERDUE',
        parameter: [paramNumberOfDaysOverdue],
      },
      RESPONSE_DUE_NOW: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.NO_RESPONSE_DUE_TODAY'},
      ADMIT_PAY_IMMEDIATELY: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.ADMIT_PAY_IMMEDIATELY'},
      ADMIT_PAY_BY_SET_DATE: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.ADMIT_PAY_BY_SET_DATE',
        parameter: [paramPaymentDate],
      },
      ADMIT_PAY_INSTALLMENTS: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.ADMIT_PAY_BY_INSTALLMENTS'},
      ELIGIBLE_FOR_CCJ: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.NO_RESPONSE_ELIGIBLE_CCJ',
        parameter: [paramClaimantName],
      },
      DEFAULT_JUDGEMENT: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.NO_RESPONSE_ELIGIBLE_CCJ',
        parameter: [paramClaimantName],
      },
      MORE_TIME_REQUESTED: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.REQUESTED_MORE_TIME_TO_RESPOND',
        parameter: [paramResponseDeadline],
      },
      CLAIMANT_ACCEPTED_STATES_PAID: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_CONFIRMED_PAYMENT',
        parameter: [paramClaimantName],
      },
      TRANSFERRED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CASE_SENT_TO_COURT'},
      REQUESTED_COUNTRY_COURT_JUDGEMENT: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_REQUESTED_CCJ',
        parameter: [paramClaimantName, paramCCJRequestedDate],
      },
      REQUESTED_CCJ_BY_REDETERMINATION: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_REQUESTED_CCJ_BY_DETERMINATION',
        parameter: [paramClaimantName],
      },
      SETTLED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIM_SETTLED'},
      RESPONSE_BY_POST: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.RESPONSE_BY_POST'},
      CHANGE_BY_DEFENDANT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.REQUESTED_CHANGE_BY_DEFENDANT'},
      CHANGE_BY_CLAIMANT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.REQUESTED_CHANGE_BY_CLAIMANT'},
      WAITING_FOR_CLAIMANT_TO_RESPOND: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.AWAITING_CLAIMANT_RESPONSE'},
      CLAIMANT_ASKED_FOR_SETTLEMENT: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_ASKED_TO_SIGN_AGREEMENT',
        parameter: [paramClaimantName],
      },
      PASSED_TO_COUNTRY_COURT_BUSINESS_CENTRE: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CASE_PASSED_TO_COURT_ORDER_BUSINESS_CENTRE'},
      CLAIMANT_ACCEPTED_ADMISSION_OF_AMOUNT: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_ACCEPTED_PART_ADMIT_PAYMENT',
        parameter: [paramClaimantName, paramAdmittedAmount],
      },
      SETTLEMENT_SIGNED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.SETTLEMENT_SIGNED'},
      DEFENDANT_PART_ADMIT_PAID: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.PART_ADMIT_STATES_PAID',
        parameter: [paramClaimantName],
      },
      DEFENDANT_PART_ADMIT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.PART_ADMIT_NOT_PAID'},
      HEARING_FORM_GENERATED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.TRIAL_OR_HEARING_SCHEDULED'},
      MORE_DETAILS_REQUIRED: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.MORE_DETAILS_REQUIRED' },
      MEDIATION_SUCCESSFUL: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.MEDIATION_SUCCESSFUL' },
      MEDIATION_UNSUCCESSFUL: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.MEDIATION_UNSUCCESSFUL' },
      IN_MEDIATION: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.IN_MEDIATION' },
      WAITING_COURT_REVIEW: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.WAITING_COURT_REVIEW' },
      CLAIM_ENDED: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIM_ENDED' },
      CLAIM_REJECTED_OFFER_SETTLE_OUT_OF_COURT: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIM_SENT_TO_CLAIMANT'},
      CLAIMANT_REJECT_OFFER_OUT_OF_COURT: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_REJECT_OFFER'},
      CLAIMANT_ACCEPTED_OFFER_OUT_OF_COURT: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_ACCEPTED_SETTLE_IN_COURT' },
      CLAIMANT_REJECT_PARTIAL_ADMISSION: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_REJECT_PARTIAL_ADMISSION',
        parameter: [paramClaimantName, paramAdmittedAmount],
      },
      SDO_ORDER_CREATED: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.SDO_ORDER_STATUS' },
      CLAIMANT_AND_DEFENDANT_SIGNED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.BOTH_SIGNED_SETTLEMENT_AGREEMENT' },
      CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT', parameter: [paramClaimantName] },
      CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT_DEADLINE_EXPIRED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT', parameter: [paramClaimantName] },
      DEFENDANT_REJECTED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.DEFENDANT_REJECTED_SETTLEMENT_AGREEMENT' },
    };
  }
}

export const translate = (translationKey: string, params?: DashboardStatusTranslationParam[], lang?: string ) => {
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

export const toDraftClaimDashboardItem = (claim: Claim): DashboardClaimantItem | undefined => {
  if (!claim || !claim?.isDraftClaim()) {
    return undefined;
  }
  const draftClaim = new DashboardClaimantItem();
  draftClaim.claimId = 'draft';
  draftClaim.draft = true;
  draftClaim.ocmc = false;
  draftClaim.status = 'NO_STATUS';
  draftClaim.claimNumber = 'PAGES.DASHBOARD.DRAFT_CLAIM_NUMBER';
  draftClaim.claimantName = claim.getClaimantFullName();
  draftClaim.defendantName = claim.getDefendantFullName();
  draftClaim.url = CLAIMANT_TASK_LIST_URL;
  return draftClaim;
};
