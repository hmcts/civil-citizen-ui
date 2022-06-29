import dayjs from 'dayjs';
import currencyFormat from '../utils/currencyFormat';
import {Respondent} from './respondent';
import {StatementOfMeans} from './statementOfMeans';
import {CounterpartyType} from './counterpartyType';
import {NumberOfDays} from '../form/models/numberOfDays';
import {RepaymentPlan} from './repaymentPlan';
import {PartialAdmission} from './partialAdmission';
import {DefendantEvidence} from './evidence/evidence';
import {Mediation} from './mediation/mediation';
import {RejectAllOfClaim} from '../form/models/rejectAllOfClaim';
import {CorrespondenceAddress} from './correspondenceAddress';
import {TimeLineOfEvents} from './timelineOfEvents/timeLineOfEvents';
import {Defence} from '../form/models/defence';
import {convertDateToLuxonDate, currentDateTime, isPastDeadline} from '../utils/dateUtils';
import {StatementOfTruthForm} from '../form/models/statementOfTruth/statementOfTruthForm';
import PaymentOptionType from '../form/models/admission/paymentOption/paymentOptionType';
import {SupportRequired} from '../models/directionsQuestionnaire/supportRequired';
import {
  ClaimAmountBreakup,
  ClaimFee,
  InterestClaimFromType,
  InterestClaimOptions,
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

export const MAX_CLAIM_AMOUNT = 10000;

export class Claim {
  legacyCaseReference: string;
  applicant1?: Party;
  specApplicantCorrespondenceAddressdetails?: CorrespondenceAddress;
  applicantSolicitor1ServiceAddress?: CorrespondenceAddress;
  applicantSolicitor1ClaimStatementOfTruth?: StatementOfTruth;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;
  detailsOfClaim: string;
  respondent1?: Respondent;
  statementOfMeans?: StatementOfMeans;
  defence?: Defence;
  paymentOption?: PaymentOptionType;
  repaymentPlan?: RepaymentPlan;
  paymentDate?: Date;
  partialAdmission?: PartialAdmission;
  rejectAllOfClaim?: RejectAllOfClaim;
  mediation?: Mediation;
  evidence?: DefendantEvidence;
  timelineOfEvents?: TimeLineOfEvents[];
  taskSharedFinancialDetails?: boolean;
  defendantStatementOfTruth?: StatementOfTruthForm | QualifiedStatementOfTruth;
  claimAmountBreakup?: ClaimAmountBreakup[];
  totalInterest?: number;
  claimInterest?: YesNo;
  interestClaimFrom?: InterestClaimFromType;
  interestClaimUntil?: InterestClaimUntilType;
  interestFromSpecificDate?: Date;
  interestClaimOptions: InterestClaimOptions;
  sameRateInterestSelection?: SameRateInterestSelection;
  supportRequired?: SupportRequired;
  breakDownInterestTotal?: number;
  submittedDate?: Date;
  issueDate?: Date;
  claimFee?: ClaimFee;
  specClaimTemplateDocumentFiles?: Document;
  systemGeneratedCaseDocuments?: SystemGeneratedCaseDocuments[];


  getClaimantName(): string {
    return this.getName(this.applicant1);
  }

  getDefendantName(): string {
    return this.getName(this.respondent1);
  }

  getName( party: Party): string {
    switch(party.type){
      case CounterpartyType.INDIVIDUAL : return party.individualTitle + ' ' + party.individualFirstName + ' ' + party.individualLastName;
      case CounterpartyType.SOLE_TRADER: return party.soleTraderTitle + ' ' + party.soleTraderFirstName + ' ' + party.soleTraderLastName;
      case CounterpartyType.COMPANY:
      case CounterpartyType.ORGANISATION:
        return party.partyName;
    }
  }

  formattedResponseDeadline(): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).format('DD MMMM YYYY') : '';
  }

  formattedTotalClaimAmount(): string {
    return this.totalClaimAmount ? currencyFormat(this.totalClaimAmount) : '';
  }

  responseInDays(): NumberOfDays {
    return this.totalClaimAmount < MAX_CLAIM_AMOUNT ? NumberOfDays.FOURTEEN : NumberOfDays.TWENTYEIGHT;
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

  isInterestClaimUntilSubmitDate(): boolean {
    return this.interestClaimUntil === InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE;
  }

  isInterestFromClaimSubmitDate(): boolean {
    return this.interestClaimFrom === InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
  }

  isInterestFromASpecificDate(): boolean {
    return this.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE;
  }

  isInterestClaimOptionsSameRateInterest(): boolean {
    return this.interestClaimOptions === InterestClaimOptions.SAME_RATE_INTEREST;
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

  isFullAdmissionPaymentOptionExists(): boolean {
    return this.paymentOption?.length > 0;
  }

  isPartialAdmissionPaymentOptionExists(): boolean {
    return this.partialAdmission?.paymentIntention?.paymentOption?.length > 0;
  }

  partialAdmissionPaymentAmount(): number {
    return this.partialAdmission?.howMuchDoYouOwe?.amount;
  }

  extractDocumentId(): string {
    const documentUrl = this.specClaimTemplateDocumentFiles?.document_url;
    let documentId: string;
    if (documentUrl?.length) {
      const splittedData = documentUrl.split('/');
      documentId = splittedData[splittedData?.length - 1];
    }
    return documentId;
  }
  generatePdfFileName(): string {
    return `${this.legacyCaseReference}-${this.specClaimTemplateDocumentFiles?.document_filename}`;
  }
  isSystemGeneratedCaseDocumentsAvailable(): number {
    return this.systemGeneratedCaseDocuments?.length;
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
}

export interface Party {
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  soleTraderTitle?:string;
  soleTraderFirstName?:string;
  soleTraderLastName?:string;
  partyName?: string;
  type: CounterpartyType;
  primaryAddress?: CorrespondenceAddress;
  phoneNumber?: string;
}

export interface StatementOfTruth {
  name?: string;
  role?: string;
}
