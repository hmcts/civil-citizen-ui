import {CaseEvent} from './caseEvent';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDDJPaymentOption} from 'models/ccdResponse/ccdDJPaymentOption';

export interface EventDto {
  event: CaseEvent,
  caseDataUpdate?: ClaimUpdate
}

export interface ClaimUpdate {
  respondentSolicitor1AgreedDeadlineExtension?:Date;
  respondent1LiPResponse?: CCDRespondentLiPResponse;
  issueDate?: Date;
  respondent1ResponseDeadline?: Date;
  applicant1RepaymentOptionForDefendantSpec?: CCDDJPaymentOption;
  applicant1PartAdmitConfirmAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1PartAdmitIntentionToSettleClaimSpec?: YesNoUpperCamelCase;
}
