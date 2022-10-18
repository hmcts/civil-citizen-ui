import dayjs from 'dayjs';
import 'dayjs/locale/cy';
import currencyFormat from '../utils/currencyFormat';
import {Party} from './party';
import {StatementOfMeans} from './statementOfMeans';
import {PartyType} from './partyType';
import {RepaymentPlan} from './repaymentPlan';
import {PartialAdmission} from './partialAdmission';
import {DefendantEvidence} from './evidence/evidence';
import {Mediation} from './mediation/mediation';
import {RejectAllOfClaim} from '../form/models/rejectAllOfClaim';
import {CorrespondenceAddress} from './correspondenceAddress';
import {TimeLineOfEvents} from './timelineOfEvents/timeLineOfEvents';
import {convertDateToLuxonDate, currentDateTime, isPastDeadline} from '../utils/dateUtils';
import {StatementOfTruthForm} from '../form/models/statementOfTruth/statementOfTruthForm';
import {PaymentOptionType} from '../form/models/admission/paymentOption/paymentOptionType';
import {
  CaseState,
  ClaimAmountBreakup,
  ClaimFee,
  InterestClaimFromType,
  InterestClaimUntilType,
  SameRateInterestSelection,
  SameRateInterestType,
} from '../form/models/claimDetails';
import {YesNo} from '../form/models/yesNo';
import {ResponseType} from '../form/models/responseType';
import {Document} from '../../common/models/document/document';
import {QualifiedStatementOfTruth} from '../form/models/statementOfTruth/qualifiedStatementOfTruth';
import {SystemGeneratedCaseDocuments} from './document/systemGeneratedCaseDocuments';
import {CaseDocument} from './document/caseDocument';
import {DocumentType} from './document/documentType';
import {ResponseDeadline} from './responseDeadline';
import {getLng} from '../../common/utils/languageToggleUtils';
import {ClaimResponseStatus} from './claimResponseStatus';
import {DirectionQuestionnaire} from '../models/directionsQuestionnaire/directionQuestionnaire';
import {ResponseOptions} from '../../common/form/models/responseDeadline';
import {AdditionalTimeOptions} from '../../common/form/models/additionalTime';
import {InterestClaimOptionsType} from '../../common/form/models/claim/interest/interestClaimOptionsType';
import {Interest} from '../form/models/interest/interest';
import {RejectAllOfClaimType} from '../../common/form/models/rejectAllOfClaimType';

export class Claim {
  legacyCaseReference: string;
  applicant1?: Party;
  specApplicantCorrespondenceAddressdetails?: CorrespondenceAddress;
  applicantSolicitor1ServiceAddress?: CorrespondenceAddress;
  applicantSolicitor1ClaimStatementOfTruth?: StatementOfTruth;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;
  detailsOfClaim: string;
  respondent1?: Party;
  statementOfMeans?: StatementOfMeans;
  paymentOption?: PaymentOptionType;
  repaymentPlan?: RepaymentPlan;
  paymentDate?: Date;
  partialAdmission?: PartialAdmission; // TODO: needs refactoring, see PartialAdmission
  rejectAllOfClaim?: RejectAllOfClaim;
  mediation?: Mediation;
  evidence?: DefendantEvidence;
  timelineOfEvents?: TimeLineOfEvents[]; // TODO: probably needs refactoring in favor of Party timeline
  taskSharedFinancialDetails?: boolean;
  defendantStatementOfTruth?: StatementOfTruthForm | QualifiedStatementOfTruth;
  claimAmountBreakup?: ClaimAmountBreakup[];
  totalInterest?: number;
  claimInterest?: YesNo;
  interest?: Interest;
  interestClaimFrom?: InterestClaimFromType;
  interestClaimUntil?: InterestClaimUntilType;
  interestFromSpecificDate?: Date;
  interestClaimOptions: InterestClaimOptionsType;
  sameRateInterestSelection?: SameRateInterestSelection;
  breakDownInterestTotal?: number;
  submittedDate?: Date;
  issueDate?: Date;
  claimFee?: ClaimFee;
  specClaimTemplateDocumentFiles?: Document;
  systemGeneratedCaseDocuments?: SystemGeneratedCaseDocuments[];
  ccdState: CaseState;
  responseDeadline: ResponseDeadline;
  respondentSolicitor1AgreedDeadlineExtension?: Date;
  directionQuestionnaire?: DirectionQuestionnaire;
  respondent1ResponseDate?: Date;

  get responseStatus(): ClaimResponseStatus {
    if (this.isFullAdmission() && this.isPaymentOptionPayImmediately()) {
      return ClaimResponseStatus.FA_PAY_IMMEDIATELY;
    }

    if (this.isFullAdmission() && this.isPaymentOptionInstallments()) {
      return ClaimResponseStatus.FA_PAY_INSTALLMENTS;
    }

    if (this.isFullAdmission() && this.isPaymentOptionBySetDate()) {
      return ClaimResponseStatus.FA_PAY_BY_DATE;
    }

    if (this.isPartialAdmission() && this.partialAdmission?.alreadyPaid?.option === YesNo.YES) {
      return ClaimResponseStatus.PA_ALREADY_PAID;
    }

    if (this.isPartialAdmission() && this.isPAPaymentOptionPayImmediately()) {
      return ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY;
    }

    if (this.isPartialAdmission() && this.isPAPaymentOptionByDate()) {
      return ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE;
    }

    if (this.isPartialAdmission() && this.isPAPaymentOptionInstallments()) {
      return ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS;
    }

    if (this.isRejectAllOfClaimAlreadyPaid() && this.hasConfirmedAlreadyPaid()) {
      return this.hasPaidInFull() ? ClaimResponseStatus.RC_PAID_FULL : ClaimResponseStatus.RC_PAID_LESS;
    }

    if (this.isFullDefence() && this.isRejectAllOfClaimDispute()) {
      return ClaimResponseStatus.RC_DISPUTE;
    }

  }

  getClaimantName(): string {
    return this.applicant1.partyName;
  }

  getDefendantName(): string {
    return this.respondent1.partyName;
  }

  formattedResponseDeadline(lng?: string): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).locale(getLng(lng)).format('DD MMMM YYYY') : '';
  }

  formattedTotalClaimAmount(): string {
    return this.totalClaimAmount ? currencyFormat(this.totalClaimAmount) : '';
  }

  getRemainingDays(): number {
    const remainingDuration = convertDateToLuxonDate(this.respondent1ResponseDeadline).diff(currentDateTime(), 'days');
    return Math.trunc(remainingDuration.days);
  }

  isDeadLinePassed(): boolean {
    return isPastDeadline(this.respondent1ResponseDeadline);
  }

  isEmpty(): boolean {
    return !this.applicant1;
  }

  isPaymentOptionBySetDate(): boolean {
    return this.paymentOption === PaymentOptionType.BY_SET_DATE;
  }

  isPaymentOptionPayImmediately(): boolean {
    return this.paymentOption === PaymentOptionType.IMMEDIATELY;
  }

  isPAPaymentOptionPayImmediately(): boolean {
    return this.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY;
  }

  isPAPaymentOptionInstallments(): boolean {
    return this.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
  }

  isPAPaymentOptionByDate(): boolean {
    return this.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
  }

  isPaymentOptionInstallments(): boolean {
    return this.paymentOption === PaymentOptionType.INSTALMENTS;
  }

  isInterestClaimUntilSubmitDate(): boolean {
    return this.interestClaimUntil === InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE;
  }

  isInterestClaimOptionExists(): boolean {
    return this.interestClaimOptions?.length > 0;
  }

  isInterestFromClaimSubmitDate(): boolean {
    return this.interestClaimFrom === InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
  }

  isInterestFromASpecificDate(): boolean {
    return this.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE;
  }

  isInterestClaimOptionsSameRateInterest(): boolean {
    return this.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST;
  }

  isSameRateTypeEightPercent(): boolean {
    return this.sameRateInterestSelection?.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_8_PC;
  }

  isDefendantDisabled(): boolean {
    return this.statementOfMeans?.disability?.option === YesNo.YES;
  }

  isDefendantSeverelyDisabled(): boolean {
    return this.statementOfMeans?.severeDisability?.option === YesNo.YES;
  }

  isDefendantDisabledAndSeverelyDisabled(): boolean {
    return this.isDefendantDisabled() && this.isDefendantSeverelyDisabled();
  }

  isPartnerDisabled(): boolean {
    return this.statementOfMeans?.cohabiting?.option === YesNo.YES &&
      this.statementOfMeans?.partnerDisability?.option === YesNo.YES;
  }

  isChildrenDisabled(): boolean {
    return this.statementOfMeans?.dependants?.declared === true &&
      this.statementOfMeans?.childrenDisability?.option === YesNo.YES;
  }

  isDefendantSeverelyDisabledOrDependentsDisabled(): boolean {
    return this.isChildrenDisabled() || this.isPartnerDisabled() || this.isDefendantDisabledAndSeverelyDisabled();
  }

  isFullAdmission(): boolean {
    return this.respondent1?.responseType === ResponseType.FULL_ADMISSION;
  }

  isPartialAdmission(): boolean {
    return this.respondent1?.responseType === ResponseType.PART_ADMISSION;
  }

  isFullDefence(): boolean {
    return this.respondent1?.responseType === ResponseType.FULL_DEFENCE;
  }

  isFullAdmissionPaymentOptionExists(): boolean {
    return this.paymentOption?.length > 0;
  }

  isPartialAdmissionPaymentOptionExists(): boolean {
    return this.partialAdmission?.paymentIntention?.paymentOption?.length > 0;
  }

  partialAdmissionPaymentAmount(): number {
    return this.partialAdmission?.howMuchDoYouOwe?.amount;
  }

  partialAdmissionPaidAmount(): number {
    return this.partialAdmission?.howMuchHaveYouPaid?.amount;
  }

  isRejectAllOfClaimAlreadyPaid(): number {
    return this.rejectAllOfClaim?.howMuchHaveYouPaid?.amount;
  }

  isRejectAllOfClaimDispute(): boolean {
    return this.rejectAllOfClaim?.option === RejectAllOfClaimType.DISPUTE;
  }

  hasConfirmedAlreadyPaid(): boolean {
    return this.rejectAllOfClaim.option === RejectAllOfClaimType.ALREADY_PAID;
  }

  hasPaidInFull(): boolean {
    return this.rejectAllOfClaim.howMuchHaveYouPaid.amount === this.rejectAllOfClaim.howMuchHaveYouPaid.totalClaimAmount;
  }

  extractDocumentId(): string {
    const documentUrl = this.specClaimTemplateDocumentFiles?.document_url;
    let documentId: string;
    if (documentUrl?.length) {
      const splitData = documentUrl.split('/');
      documentId = splitData[splitData?.length - 1];
    }
    return documentId;
  }

  generatePdfFileName(): string {
    return `${this.legacyCaseReference}-${this.specClaimTemplateDocumentFiles?.document_filename}`;
  }

  isSystemGeneratedCaseDocumentsAvailable(): boolean {
    return this.systemGeneratedCaseDocuments?.length > 0;
  }

  getDocumentDetails(documentType: DocumentType): CaseDocument {
    if (this.isSystemGeneratedCaseDocumentsAvailable()) {
      const filteredDocumentDetailsByType = this.systemGeneratedCaseDocuments?.find(document => {
        return document.value.documentType === documentType;
      });
      return filteredDocumentDetailsByType.value;
    }
    return undefined;
  }

  isDefendantNotResponded(): boolean {
    return this.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  }

  isBusiness(): boolean {
    return this.respondent1?.type === PartyType.COMPANY || this.respondent1?.type === PartyType.ORGANISATION;
  }

  isDeadlineExtended(): boolean {
    return this.respondentSolicitor1AgreedDeadlineExtension !== undefined;
  }

  hasRespondentAskedForMoreThan28Days(): boolean {
    return this.responseDeadline?.option === ResponseOptions.YES && this.responseDeadline?.additionalTime === AdditionalTimeOptions.MORE_THAN_28_DAYS;
  }

  isRequestToExtendDeadlineRefused(): boolean {
    return this.responseDeadline?.option === ResponseOptions.REQUEST_REFUSED;
  }

  isResponseToExtendDeadlineNo(): boolean {
    return this.responseDeadline?.option === ResponseOptions.NO;
  }

}

export interface StatementOfTruth {
  name?: string;
  role?: string;
}
