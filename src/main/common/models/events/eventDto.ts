import {CaseEvent} from './caseEvent';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {CCDClaimantPayBySetDate} from '../ccdResponse/ccdPayBySetDate';

export interface EventDto {
  event: CaseEvent,
  caseDataUpdate?: ClaimUpdate
}

export interface ClaimUpdate {
  respondentSolicitor1AgreedDeadlineExtension?:Date;
  respondent1LiPResponse?: CCDRespondentLiPResponse;
  issueDate?: Date;
  respondent1ResponseDeadline?: Date;
  applicant1RepaymentOptionForDefendantSpec?: CCDClaimantPaymentOption;
  applicant1PartAdmitConfirmAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1PartAdmitIntentionToSettleClaimSpec?: YesNoUpperCamelCase;
  respondentSignSettlementAgreement? : YesNoUpperCamelCase;
  applicant1RequestedPaymentDateForDefendantSpec? : CCDClaimantPayBySetDate;
}
