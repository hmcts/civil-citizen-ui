import config from 'config';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {noGroupingCurrencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

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
  defaultJudgementIssuedDate?: string;
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
      ADMIT_PAY_BY_SET_DATE: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.OFFERED_SET_DATE'},
      ADMIT_PAY_INSTALLMENTS : { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.OFFERED_INSTALMENTS'},
      ADMIT_PAY_IMMEDIATELY: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.ADMIT_PAY_IMMEDIATELY_CLAIMANT'},
      CLAIM_ENDED: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIM_ENDED' },
      CLAIMANT_ACCEPTED_PARTIAL_ADMISSION:{translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.ACCEPTED_PARTIAL_ADMISSION'},
      CLAIMANT_REJECTED_PAYMENT_PLAN:{translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIMANT_REJECTED_PAYMENT_PLAN'},
      CLAIMANT_REJECTED_PAYMENT_PLAN_REQ_JUDGE_DECISION: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.REJECTED_PAYMENT_PLAN_REQUEST_JUDGE_DECISION'},
      DEFENDANT_PART_ADMIT: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      DEFENDANT_PART_ADMIT_PAID: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      HEARING_FORM_GENERATED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.PAY_HEARING_FEE'},
      HEARING_FORM_GENERATED_RELISTING: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.TRIAL_OR_HEARING_SCHEDULED'},
      TRIAL_ARRANGEMENTS_REQUIRED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.TRIAL_ARRANGEMENTS_REQUIRED'},
      TRIAL_ARRANGEMENTS_SUBMITTED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.TRIAL_ARRANGEMENTS_SUBMITTED'},
      BUNDLE_CREATED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.BUNDLE_CREATED'},
      HEARING_SUBMIT_HWF: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HEARING_SUBMIT_HWF'},
      AWAITING_JUDGMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.AWAITING_JUDGMENT'},
      ORDER_MADE: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.ORDER_MADE'},
      RESPONSE_BY_POST: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.RESPONSE_BY_POST'},
      WAITING_FOR_CLAIMANT_TO_RESPOND: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.NOT_ADMITTED_CLAIMANT'},
      WAITING_COURT_REVIEW: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.WAITING_COURT_REVIEW'},
      DEFAULT_JUDGEMENT: {
        translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIMANT_REQUESTED_CCJ',
        parameter: [paramDefendantName],
      },
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
      HWF_MORE_INFORMATION_NEEDED:  {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HWF_MORE_INFORMATION_NEEDED'},
      CLAIM_SUBMIT_HWF : {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIM_SUBMIT_HWF'},
      CLAIMANT_REJECT_PARTIAL_ADMISSION : {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.WAITING_COURT_REVIEW'},
      CLAIMANT_HWF_NO_REMISSION : {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HWF_NO_REMISSION'},
      CLAIMANT_HWF_PARTIAL_REMISSION : {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HWF_PARTIAL_REMISSION'},
      CLAIMANT_HWF_FULL_REMISSION : {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HWF_FULL_REMISSION'},
      CLAIMANT_HWF_UPDATED_REF_NUMBER: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HWF_UPDATED_REF_NUMBER'},
      CLAIMANT_HWF_INVALID_REF_NUMBER: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HWF_INVALID_REF_NUMBER'},
      CLAIMANT_HWF_FEE_PAYMENT_OUTCOME: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HWF_FEE_PAYMENT_OUTCOME'},
      SETTLED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIM_SETTLED'},
      SDO_ORDER_CREATED_PRE_CP: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_STATUS_PRE_CP' },
      SDO_ORDER_CREATED_CP: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_STATUS_CP' },
      SDO_ORDER_LEGAL_ADVISER_CREATED: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_LEGAL_ADVISER_STATUS' },
      SDO_ORDER_IN_REVIEW: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_IN_REVIEW' },
      SDO_ORDER_IN_REVIEW_OTHER_PARTY: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_IN_REVIEW_OTHER_PARTY_DEFENDANT' },
      CLAIMANT_DOCUMENTS_BEING_TRANSLATED: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.DOCUMENTS_BEING_TRANSLATED' },
      WAITING_FOR_CLAIMANT_INTENT_DOC_UPLOAD_PRE_DEF_NOC_ONLINE: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.WAITING_CLAIMANT_INTENT_DOC_UPLOAD_PRE_DEF_NOC_ONLINE'},
      WAITING_FOR_CLAIMANT_INTENT_DOC_UPLOAD_POST_DEF_NOC_ONLINE: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.WAITING_CLAIMANT_INTENT_DOC_UPLOAD_POST_DEF_NOC_ONLINE'},
      CLAIM_SUBMITTED_NOT_PAID_OR_FAILED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CLAIM_FEE_NOT_PAID'},
      CLAIM_SUBMITTED_WAITING_TRANSLATED_DOCUMENTS: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.DOCUMENTS_BEING_TRANSLATED'},
      DEFENDANT_APPLY_NOC: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.RESPONSE_BY_POST'},
      DECISION_FOR_RECONSIDERATION_MADE: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.DECISION_ON_RECONSIDERATION' },
      HEARING_FEE_UNPAID: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.HEARING_FEE_UNPAID'},
      CASE_DISMISSED: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CASE_DISMISSED' },
      CASE_STAYED: {translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CASE_STAYED'},
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
    const paramDefaultJudgementIssuedDate = { key: 'defaultJudgementIssuedDate', value: formatDateToFullDate(this.defaultJudgementIssuedDate as unknown as Date, lang) };
    const displayedAmount = noGroupingCurrencyFormatWithNoTrailingZeros(this.respondToAdmittedClaimOwingAmountPounds ?? this.admittedAmount);
    const paramAdmittedAmount = {key: 'amount', value: displayedAmount};

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
      CLAIMANT_ACCEPTED_PARTIAL_ADMISSION: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_ACCEPTED_PART_ADMIT_PAYMENT',
        parameter: [paramClaimantName, paramAdmittedAmount],
      },
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
      HEARING_FORM_GENERATED_RELISTING: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.TRIAL_OR_HEARING_SCHEDULED'},
      TRIAL_ARRANGEMENTS_REQUIRED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.TRIAL_ARRANGEMENTS_REQUIRED'},
      TRIAL_ARRANGEMENTS_SUBMITTED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.TRIAL_ARRANGEMENTS_SUBMITTED'},
      AWAITING_JUDGMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.AWAITING_JUDGMENT'},
      BUNDLE_CREATED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.BUNDLE_CREATED'},
      ORDER_MADE: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.ORDER_MADE'},
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
      SDO_ORDER_CREATED_PRE_CP: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.SDO_ORDER_STATUS_PRE_CP' },
      SDO_ORDER_CREATED_CP: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.SDO_ORDER_STATUS_CP' },
      SDO_ORDER_LEGAL_ADVISER_CREATED: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_LEGAL_ADVISER_STATUS' },
      SDO_ORDER_IN_REVIEW: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_IN_REVIEW' },
      SDO_ORDER_IN_REVIEW_OTHER_PARTY: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.SDO_ORDER_IN_REVIEW_OTHER_PARTY_CLAIMANT' },
      CLAIMANT_AND_DEFENDANT_SIGNED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.BOTH_SIGNED_SETTLEMENT_AGREEMENT' },
      CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT', parameter: [paramClaimantName] },
      CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT_DEADLINE_EXPIRED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_SIGNED_SETTLEMENT_AGREEMENT', parameter: [paramClaimantName] },
      DEFENDANT_REJECTED_SETTLEMENT_AGREEMENT: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.DEFENDANT_REJECTED_SETTLEMENT_AGREEMENT' },
      CLAIMANT_DOCUMENTS_BEING_TRANSLATED: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.DOCUMENTS_BEING_TRANSLATED' },
      DEFENDANT_APPLY_NOC: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.RESPONSE_BY_POST'},
      DECISION_FOR_RECONSIDERATION_MADE: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.DECISION_ON_RECONSIDERATION' },
      HEARING_FEE_UNPAID: { translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.HEARING_FEE_UNPAID'},
      DEFAULT_JUDGEMENT_ISSUED: {
        translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.DEFAULT_JUDGEMENT_ISSUED_STATUS',
        parameter: [paramDefaultJudgementIssuedDate],
      },
      WAITING_FOR_CLAIMANT_INTENT_DOC_UPLOAD_PRE_DEF_NOC_ONLINE: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.WAITING_CLAIMANT_INTENT_DOC_UPLOAD_PRE_DEF_NOC_ONLINE'},
      WAITING_FOR_CLAIMANT_INTENT_DOC_UPLOAD_POST_DEF_NOC_ONLINE: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.WAITING_CLAIMANT_INTENT_DOC_UPLOAD_POST_DEF_NOC_ONLINE'},
      CASE_DISMISSED: { translationKey: 'PAGES.DASHBOARD.STATUS_CLAIMANT.CASE_DISMISSED' },
      CASE_STAYED: {translationKey: 'PAGES.DASHBOARD.STATUS_DEFENDANT.CASE_STAYED'},
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
  if (claim?.isDraftClaim()) {
    const draftClaim = new DashboardClaimantItem();
    draftClaim.claimId = 'draft';
    draftClaim.draft = true;
    draftClaim.ocmc = false;
    draftClaim.status = 'NO_STATUS';
    draftClaim.claimNumber = 'PAGES.DASHBOARD.DRAFT_CLAIM_NUMBER';
    draftClaim.claimantName = claim.getClaimantFullName();
    draftClaim.defendantName = claim.getDefendantFullName();
    draftClaim.url = DASHBOARD_CLAIMANT_URL.replace(':id', 'draft');
    return draftClaim;
  } else {
    return undefined;
  }
};
