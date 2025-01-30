import {CaseEvent} from './caseEvent';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {CCDClaimantPayBySetDate} from '../ccdResponse/ccdPayBySetDate';
import {CcdMediationCarm} from 'models/ccdResponse/ccdMediationCarm';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';
import {CaseQueries} from 'models/queryManagement/caseQueries';

export interface EventDto {
  event: CaseEvent,
  caseDataUpdate?: ClaimUpdate
}

export interface ClaimUpdate {
  respondentSolicitor1AgreedDeadlineExtension?:Date;
  respondent1LiPResponse?: CCDRespondentLiPResponse;
  respondent1LiPResponseCarm?: CcdMediationCarm;
  applicant1LiPResponseCarm?: CcdMediationCarm;
  issueDate?: Date;
  respondent1ResponseDeadline?: Date;
  applicant1RepaymentOptionForDefendantSpec?: CCDClaimantPaymentOption;
  applicant1PartAdmitConfirmAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1PartAdmitIntentionToSettleClaimSpec?: YesNoUpperCamelCase;
  respondentSignSettlementAgreement? : YesNoUpperCamelCase;
  applicant1RequestedPaymentDateForDefendantSpec?: CCDClaimantPayBySetDate;
  applicant1AcceptAdmitAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1SuggestInstalmentsPaymentAmountForDefendantSpec?: number;
  applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec?: string;
  applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec?: CCDRepaymentPlanFrequency;
  applicant1SuggestPayImmediatelyPaymentDateForDefendantSpec?: Date;
  applicant1ClaimSettledDate?: Date;
  qmApplicantCitizenQueries?: CaseQueries;
}
