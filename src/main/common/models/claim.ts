import dayjs from 'dayjs';
import 'dayjs/locale/cy';
import currencyFormat from '../utils/currencyFormat';
import {Party} from './party';
import {StatementOfMeans} from './statementOfMeans';
import {PartyType} from './partyType';
import {FullAdmission} from './fullAdmission';
import {PartialAdmission} from './partialAdmission';
import {DefendantEvidence} from './evidence/evidence';
import {Mediation} from './mediation/mediation';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {TimeLineOfEvents} from './timelineOfEvents/timeLineOfEvents';
import {convertDateToLuxonDate, currentDateTime, isPastDeadline} from '../utils/dateUtils';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {
  CaseState,
  CCDHelpWithFees,
  ClaimAmountBreakup,
  ClaimantMediationLip,
  ClaimFee,
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestType,
} from 'form/models/claimDetails';
import {YesNo, YesNoUpperCamelCase, YesNoUpperCase} from 'form/models/yesNo';
import {ResponseType} from 'form/models/responseType';
import {Document} from 'common/models/document/document';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {SystemGeneratedCaseDocuments} from './document/systemGeneratedCaseDocuments';
import {CaseDocument} from './document/caseDocument';
import {DocumentType} from './document/documentType';
import {ResponseDeadline} from './responseDeadline';
import {getLng} from 'common/utils/languageToggleUtils';
import {ClaimResponseStatus} from './claimResponseStatus';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {ResponseOptions} from 'common/form/models/responseDeadline';
import {AdditionalTimeOptions} from 'common/form/models/additionalTime';
import {InterestClaimOptionsType} from 'common/form/models/claim/interest/interestClaimOptionsType';
import {Interest} from 'form/models/interest/interest';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {ClaimDetails} from 'common/form/models/claim/details/claimDetails';
import {ClaimantResponse} from './claimantResponse';
import {SelfEmployedAs} from 'models/selfEmployedAs';
import {TaxPayments} from 'models/taxPayments';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {Debts} from 'form/models/statementOfMeans/debts/debts';
import {ClaimBilingualLanguagePreference} from './claimBilingualLanguagePreference';
import {analyseClaimType, claimType} from 'common/form/models/claimType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {CCDRespondentLiPResponse} from './ccdResponse/ccdRespondentLiPResponse';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {DateTimeFormatOptions} from 'luxon';
import {CaseProgression} from 'common/models/caseProgression/caseProgression';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {BundlesFormatter} from 'services/features/caseProgression/bundles/bundlesFormatter';
import {CaseRole} from 'form/models/caseRoles';
import {ChooseHowProceed} from './chooseHowProceed';
import {CCDBreathingSpaceStartInfo} from './ccd/ccdBreathingSpace/ccdBreathingSpaceStartInfo';
import {PinToPost} from './pinToPost';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {GenericYesNo} from 'form/models/genericYesNo';
import {UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {RepaymentPlanInstalments} from 'models/claimantResponse/ccj/repaymentPlanInstalments';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

export class Claim {
  resolvingDispute: boolean;
  completingClaimConfirmed: boolean;
  legacyCaseReference: string;
  applicant1?: Party;
  claimantResponse?: ClaimantResponse;
  applicantSolicitor1ClaimStatementOfTruth?: StatementOfTruth;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;
  claimDetails: ClaimDetails;
  respondent1?: Party;
  statementOfMeans?: StatementOfMeans;
  fullAdmission?: FullAdmission;
  partialAdmission?: PartialAdmission;
  rejectAllOfClaim?: RejectAllOfClaim;
  mediation?: Mediation;
  evidence?: DefendantEvidence;
  timelineOfEvents?: TimeLineOfEvents[]; // TODO: Release 2: ClaimDetails timeline needs to translate into this field
  taskSharedFinancialDetails?: boolean;
  defendantStatementOfTruth?: StatementOfTruthForm | QualifiedStatementOfTruth;
  claimAmountBreakup?: ClaimAmountBreakup[];
  totalInterest?: number;
  claimInterest?: YesNo;
  interest?: Interest; //TODO: Release 1: Some of the fields that have been refactored in Interest are used in Release 1, they must be included in the translator from CCD to work correctly (response/claim-details).
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
  claimBilingualLanguagePreference: ClaimBilingualLanguagePreference;
  claimantBilingualLanguagePreference: ClaimBilingualLanguagePreference;
  id: string;
  pcqId: string;
  sdoOrderDocument?: SystemGeneratedCaseDocuments;
  caseProgression?: CaseProgression;
  respondent1LiPResponse?: CCDRespondentLiPResponse;
  caseProgressionHearing?: CaseProgressionHearing;
  takenOfflineDate?: Date;
  mediationAgreement?: MediationAgreement;
  unsuccessfulMediationReason?: string;
  defaultJudgmentDocuments?: CaseDocument[];
  ccjJudgmentStatement?: string;
  lastModifiedDate?: Date;
  applicant1AcceptAdmitAmountPaidSpec?: string;
  applicant1PartAdmitConfirmAmountPaidSpec?: string;
  applicant1PartAdmitIntentionToSettleClaimSpec?: string;
  partAdmitPaidValuePounds?: number;
  respondent1PaymentDateToStringSpec?: Date;
  applicant1ResponseDeadline?: Date;
  applicant1ResponseDate?: Date;
  applicant1ClaimMediationSpecRequiredLip?: ClaimantMediationLip;
  caseDismissedHearingFeeDueDate?: Date;
  caseRole?: CaseRole;
  draftClaimCreatedAt?: Date;
  helpWithFees ?: CCDHelpWithFees;
  enterBreathing?: CCDBreathingSpaceStartInfo;
  respondent1PinToPostLRspec: PinToPost;
  defendantSignedSettlementAgreement?: YesNo;
  courtDecision: RepaymentDecisionType;
  feeTypeHelpRequested: FeeType;
  applicant1Represented?: YesNoUpperCamelCase;
  specRespondent1Represented?: YesNoUpperCamelCase;
  respondentPaymentDeadline: Date;
  respondentSignSettlementAgreement?: GenericYesNo;
  mediationUploadDocuments?: UploadDocuments;

  public static fromCCDCaseData(ccdClaim: CCDClaim): Claim {
    const claim: Claim = Object.assign(new Claim(), ccdClaim);
    claim.claimDetails = toCUIClaimDetails(ccdClaim);
    claim.evidence = toCUIEvidence(ccdClaim?.specResponselistYourEvidenceList);
    claim.applicant1 = toCUIParty(ccdClaim?.applicant1);
    claim.respondent1 = toCUIParty(ccdClaim?.respondent1);
    claim.mediation = toCUIMediation(ccdClaim?.respondent1LiPResponse?.respondent1MediationLiPResponse);
    return claim;
  }

  get responseStatus(): ClaimResponseStatus {
    if (this.isFullAdmission() && this.isFAPaymentOptionPayImmediately()) {
      return ClaimResponseStatus.FA_PAY_IMMEDIATELY;
    }

    if (this.isFullAdmission() && this.isFAPaymentOptionInstallments() && !this.isClaimantRejectedPaymentPlan()) {
      return ClaimResponseStatus.FA_PAY_INSTALLMENTS;
    }

    if (this.isFullAdmission() && this.isFAPaymentOptionBySetDate() && !this.isClaimantRejectedPaymentPlan()) {
      return ClaimResponseStatus.FA_PAY_BY_DATE;
    }

    if (this.isPartialAdmission() && this.partialAdmission?.alreadyPaid?.option === YesNo.YES) {
      if (this?.applicant1PartAdmitConfirmAmountPaidSpec === YesNoUpperCamelCase.YES && this?.applicant1PartAdmitIntentionToSettleClaimSpec === YesNoUpperCamelCase.YES) {
        return ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_SETTLED;
      }
      if (this?.applicant1PartAdmitConfirmAmountPaidSpec === YesNoUpperCamelCase.YES && this?.applicant1PartAdmitIntentionToSettleClaimSpec === YesNoUpperCamelCase.NO) {
        return ClaimResponseStatus.PA_ALREADY_PAID_ACCEPTED_NOT_SETTLED;
      }
      if (this?.applicant1PartAdmitConfirmAmountPaidSpec === YesNoUpperCamelCase.NO) {
        return ClaimResponseStatus.PA_ALREADY_PAID_NOT_ACCEPTED;
      }
      return ClaimResponseStatus.PA_ALREADY_PAID;
    }

    if (this.isPartialAdmission() && this.partialAdmission?.alreadyPaid?.option === YesNo.NO && this?.applicant1AcceptAdmitAmountPaidSpec === YesNoUpperCamelCase.NO) {
      return ClaimResponseStatus.PA_NOT_PAID_NOT_ACCEPTED;
    }

    if (this.isPartialAdmission() && this.isPAPaymentOptionPayImmediately()) {
      if (this?.applicant1AcceptAdmitAmountPaidSpec === YesNoUpperCamelCase.YES) {
        return ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY_ACCEPTED;
      }
      return ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY;
    }

    if (this.isPartialAdmission() && this.isPAPaymentOptionByDate() && !this.isClaimantRejectedPaymentPlan()) {
      return ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE;
    }

    if (this.isPartialAdmission() && this.isPAPaymentOptionInstallments() && !this.isClaimantRejectedPaymentPlan()) {
      return ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS;
    }

    if ((this.isPartialAdmission() || this.isFullAdmission()) && this.isClaimantRejectedPaymentPlan()) {
      return ClaimResponseStatus.PA_FA_CLAIMANT_REJECT_REPAYMENT_PLAN;
    }

    if (this.isRejectAllOfClaimAlreadyPaid() && this.hasConfirmedAlreadyPaid()) {
      return this.hasPaidInFull() ? ClaimResponseStatus.RC_PAID_FULL : ClaimResponseStatus.RC_PAID_LESS;
    }

    if (this.isFullDefence() && this.isRejectAllOfClaimDispute() && this.ccdState !== CaseState.JUDICIAL_REFERRAL) {
      return ClaimResponseStatus.RC_DISPUTE;
    }

    if (this.isFullDefence() && this.ccdState === CaseState.JUDICIAL_REFERRAL
      && (this.hasRespondent1NotAgreedMediation() || this.isFastTrackClaim)
      && this.hasClaimantIntentToProceedResponse()) {
      return ClaimResponseStatus.RC_DISPUTE_CLAIMANT_INTENDS_TO_PROCEED;
    }

  }

  getClaimantFullName(): string {
    return this.getName(this.applicant1);
  }

  getDefendantFullName(): string {
    return this.getName(this.respondent1);
  }

  isDefendantResponsePayBySetDate(): boolean {
    const isFullAdmitBySetDate = this.isFullAdmission() && this.isFAPaymentOptionBySetDate();
    const isPartAdmitBySetDate = this.isPartialAdmission() && this.isPAPaymentOptionByDate();
    return isFullAdmitBySetDate || isPartAdmitBySetDate;
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

  isFAPaymentOptionBySetDate(): boolean {
    return this.fullAdmission?.paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
  }

  isFAPaymentOptionPayImmediately(): boolean {
    return this.fullAdmission?.paymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY;
  }

  isFAPaymentOptionInstallments(): boolean {
    return this.fullAdmission?.paymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
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

  isInterestEndDateUntilSubmitDate(): boolean {
    return this.interest?.interestEndDate === InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;
  }

  isInterestClaimOptionExists(): boolean {
    return this.interest?.interestClaimOptions?.length > 0;
  }

  isInterestFromClaimSubmitDate(): boolean {
    return this.interest?.interestClaimFrom === InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
  }

  isInterestFromASpecificDate(): boolean {
    return this.interest?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE;
  }

  isInterestClaimOptionsSameRateInterest(): boolean {
    return this.interest?.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST;
  }

  isSameRateTypeEightPercent(): boolean {
    return this.interest?.sameRateInterestSelection?.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_8_PC;
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

  isPartialAdmissionPaid(): boolean {
    return this.isPartialAdmission() && this.partialAdmission?.alreadyPaid?.option === YesNo.YES;
  }

  isPartialAdmissionNotPaid(): boolean {
    return this.isPartialAdmission() && this.partialAdmission?.alreadyPaid?.option === YesNo.NO;
  }

  hasClaimantConfirmedDefendantPaid(): boolean {
    return this.claimantResponse?.hasDefendantPaidYou?.option === YesNo.YES;
  }

  hasClaimantRejectedDefendantPaid(): boolean {
    return this.claimantResponse?.hasDefendantPaidYou?.option === YesNo.NO;
  }

  hasClaimantRejectedPartAdmitPayment(): boolean {
    return this.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.NO;
  }

  isFullDefence(): boolean {
    return this.respondent1?.responseType === ResponseType.FULL_DEFENCE;
  }

  isFullAdmissionPaymentOptionExists(): boolean {
    return this.fullAdmission?.paymentIntention?.paymentOption?.length > 0;
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

  isRejectionReasonCompleted(): boolean {
    return this.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.NO && !!this.claimantResponse?.rejectionReason?.text;
  }

  getPaidAmount(): number {
    if (this.hasConfirmedAlreadyPaid()) {
      return this.isRejectAllOfClaimAlreadyPaid();
    }
    if (this.isPartialAdmissionPaid()) {
      return this.partialAdmissionPaidAmount();
    }
  }

  isRejectAllOfClaimDispute(): boolean {
    return this.rejectAllOfClaim?.option === RejectAllOfClaimType.DISPUTE;
  }

  isSignASettlementAgreement(): boolean {
    return this.getHowToProceed() === ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;
  }

  isRequestACCJ(): boolean {
    return this.getHowToProceed() === ChooseHowProceed.REQUEST_A_CCJ;
  }

  hasConfirmedAlreadyPaid(): boolean {
    return this.rejectAllOfClaim?.option === RejectAllOfClaimType.ALREADY_PAID;
  }

  hasPaidInFull(): boolean {
    return this.rejectAllOfClaim.howMuchHaveYouPaid.amount === this.totalClaimAmount;
  }

  getRejectAllOfClaimPaidLessPaymentDate(): Date {
    return this.rejectAllOfClaim.howMuchHaveYouPaid.date;
  }

  getRejectAllOfClaimPaidLessPaymentMode(): string {
    return this.rejectAllOfClaim?.howMuchHaveYouPaid?.text ?? '';
  }

  getRejectAllOfClaimDisagreementReason(): string {
    return this.rejectAllOfClaim?.whyDoYouDisagree?.text ?? '';
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
    if (documentType === DocumentType.HEARING_FORM && this.hasCaseProgressionHearingDocuments()) {
      const hearingNotice = this.caseProgressionHearing.hearingDocuments.find(document => {
        return document.value.documentType === documentType;
      });
      return hearingNotice.value;
    } else if (documentType === DocumentType.HEARING_FORM) {
      return undefined;
    }

    if (this.isSystemGeneratedCaseDocumentsAvailable()) {
      const filteredDocumentDetailsByType = this.systemGeneratedCaseDocuments?.find(document => {
        return document?.value.documentType === documentType;
      });
      return filteredDocumentDetailsByType?.value;
    }
    return undefined;
  }

  isDefendantNotResponded(): boolean {
    return this.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  }

  isClaimantIntentionPending(): boolean {
    return this.ccdState === CaseState.AWAITING_APPLICANT_INTENTION;
  }

  isAllFinalOrdersIssued(): boolean {
    return this.ccdState === CaseState.All_FINAL_ORDERS_ISSUED;
  }

  isBusiness(): boolean {
    return this.respondent1?.type === PartyType.COMPANY || this.respondent1?.type === PartyType.ORGANISATION;
  }

  isClaimantBusiness(): boolean {
    return this.applicant1?.type === PartyType.COMPANY || this.applicant1?.type === PartyType.ORGANISATION;
  }

  isDeadlineExtended(): boolean {
    return this.respondentSolicitor1AgreedDeadlineExtension !== undefined;
  }

  hasRespondentAskedForMoreThan28Days(): boolean {
    return this.responseDeadline?.option === ResponseOptions.YES && this.responseDeadline?.additionalTime === AdditionalTimeOptions.MORE_THAN_28_DAYS;
  }

  hasInterest(): boolean {
    return this.claimInterest?.toLowerCase() === YesNo.YES;
  }

  hasHelpWithFees(): boolean {
    return this.claimDetails?.helpWithFees?.option === YesNo.YES;
  }

  isRequestToExtendDeadlineRefused(): boolean {
    return this.responseDeadline?.option === ResponseOptions.REQUEST_REFUSED;
  }

  isResponseToExtendDeadlineNo(): boolean {
    return this.responseDeadline?.option === ResponseOptions.NO;
  }

  isResponseDateInThePast(): boolean {
    return this.respondent1ResponseDate <= new Date();
  }

  isBreakDownCompleted(): boolean {
    return (
      this.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST &&
      !!this.interest?.totalInterest?.amount &&
      !!this.interest?.totalInterest?.reason
    );
  }

  isInterestSameRateCompleted(): boolean {
    return (
      this.interest?.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST &&
      !!this.interest?.sameRateInterestSelection?.sameRateInterestType
    );
  }

  isInterestFromSpecificDateCompleted(): boolean {
    return (
      this.isInterestFromASpecificDate() &&
      !!this.interest?.interestStartDate &&
      !!this.interest?.interestEndDate
    );
  }

  isInterestCompleted(): boolean {
    return (
      this.claimInterest === YesNo.YES &&
      (this.isBreakDownCompleted() ||
        (
          this.isInterestSameRateCompleted() &&
          (this.isInterestFromClaimSubmitDate() || this.isInterestFromSpecificDateCompleted())
        ))
    );
  }

  isDefendantDetailsCompleted(): boolean {
    return (
      !!this.respondent1?.type &&
      !!this.respondent1?.partyDetails?.primaryAddress &&
      ((this.isBusiness() && !!this.respondent1?.partyDetails?.partyName) ||
        (!this.isBusiness() && !!this.respondent1?.partyDetails?.individualFirstName))
    );
  }

  isClaimantDetailsCompleted(): boolean {
    return (
      !!this.applicant1?.type &&
      !!this.applicant1?.partyDetails?.primaryAddress &&
      ((this.isClaimantBusiness() && !!this.applicant1?.partyDetails?.partyName) ||
        (!this.isClaimantBusiness() && !!this.applicant1?.partyDetails?.individualFirstName && !!this.applicant1?.dateOfBirth))
    );
  }

  get hasSupportRequiredList(): boolean {
    return this.isClaimantIntentionPending() ? !!this.claimantResponse?.directionQuestionnaire?.hearing?.supportRequiredList : !!this.directionQuestionnaire?.hearing?.supportRequiredList;
  }

  get contactNameFromClaimantResponse(): string {
    return this.claimantResponse.mediation?.companyTelephoneNumber?.option === YesNo.NO ?
      this.claimantResponse.mediation.companyTelephoneNumber.mediationContactPerson :
      this.applicant1?.partyDetails?.contactPerson;
  }

  get contactNumberFromClaimantResponse(): string {
    if (this.claimantResponse.mediation?.companyTelephoneNumber) {
      return this.claimantResponse.mediation.companyTelephoneNumber.option !== YesNo.YES ?
        this.claimantResponse.mediation.companyTelephoneNumber.mediationPhoneNumber
        : this.claimantResponse.mediation.companyTelephoneNumber.mediationPhoneNumberConfirmation;
    } else if (this.claimantResponse.mediation?.canWeUse?.mediationPhoneNumber) {
      return this.claimantResponse.mediation.canWeUse.mediationPhoneNumber;
    } else {
      return this.applicant1?.partyPhone?.phone;
    }
  }

  get canWeUseFromClaimantResponse(): YesNoUpperCase {
    if (this.claimantResponse.mediation?.canWeUse?.option) {
      return YesNoUpperCase.YES;
    } else {
      if (this.claimantResponse.mediation?.mediationDisagreement?.option) {
        return YesNoUpperCase.NO;
      } else if (this.claimantResponse.mediation?.companyTelephoneNumber) {
        return YesNoUpperCase.YES;
      }
    }
    return YesNoUpperCase.NO;
  }

  get isSupportRequiredYes(): boolean {
    return this.directionQuestionnaire?.hearing?.supportRequiredList?.option === YesNo.YES;
  }

  get isClaimantResponseSupportRequiredYes(): boolean {
    return this.claimantResponse.directionQuestionnaire?.hearing?.supportRequiredList?.option === YesNo.YES;
  }

  get isSupportRequiredDetailsAvailable(): boolean {
    return this.isClaimantIntentionPending() ? this.claimantResponse?.directionQuestionnaire?.hearing?.supportRequiredList?.items?.length > 0 : this.directionQuestionnaire?.hearing?.supportRequiredList?.items?.length > 0;
  }

  get isClaimantResponseSupportRequiredDetailsAvailable(): boolean {
    return this.claimantResponse.directionQuestionnaire?.hearing?.supportRequiredList?.items?.length > 0;
  }

  hasExpertReportDetails(): boolean {
    return this.isClaimantIntentionPending() ? this.claimantResponse?.directionQuestionnaire?.experts?.expertReportDetails?.option === YesNo.YES : this.directionQuestionnaire?.experts?.expertReportDetails?.option === YesNo.YES;
  }

  hasPermissionForExperts(): boolean {
    return this.isClaimantIntentionPending() ? this.claimantResponse?.directionQuestionnaire?.experts?.permissionForExpert?.option === YesNo.YES : this.directionQuestionnaire?.experts?.permissionForExpert?.option === YesNo.YES;
  }

  hasEvidenceExpertCanStillExamine(): boolean {
    return this.isClaimantIntentionPending() ? this.claimantResponse?.directionQuestionnaire?.experts?.expertCanStillExamine?.option === YesNo.YES : this.directionQuestionnaire?.experts?.expertCanStillExamine?.option === YesNo.YES;
  }

  getExplanationText(): string {
    return this.statementOfMeans?.explanation?.text ?? '';
  }

  getSelfEmployment(): SelfEmployedAs | undefined {
    return this.statementOfMeans?.selfEmployedAs;
  }

  isBehindOnTheTaxPayments(): boolean {
    return this.statementOfMeans?.taxPayments?.owed ?? false;
  }

  getBehindOnTaxPayments(): TaxPayments | undefined {
    return this.statementOfMeans?.taxPayments;
  }

  getRegularIncome(): RegularIncome | undefined {
    return this.statementOfMeans?.regularIncome;
  }

  getRegularExpenses(): RegularExpenses | undefined {
    return this.statementOfMeans?.regularExpenses;
  }

  getCourtOrders(): CourtOrders | undefined {
    return this.statementOfMeans?.courtOrders;
  }

  isFinalGeneralOrderIssued(): boolean {
    return this.caseProgression?.finalOrderDocumentCollection?.length > 0;
  }

  getPriorityDebts(): PriorityDebts | undefined {
    return this.statementOfMeans?.priorityDebts;
  }

  getDebts(): Debts | undefined {
    return this.statementOfMeans?.debts;
  }

  isInterestClaimOptionsBreakDownInterest(): boolean {
    return this.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST;
  }

  getDefendantPaidAmount(): number | undefined {
    return this.claimantResponse?.ccjRequest?.paidAmount?.amount;
  }

  getHasDefendantPaid() : YesNo {
    return this.claimantResponse?.ccjRequest?.paidAmount?.option;
  }

  getCCJTotalAmount() : number {
    return this.claimantResponse?.ccjRequest?.paidAmount?.totalAmount;
  }

  getCCJPaymentOption() : PaymentOptionType {
    return this.claimantResponse?.ccjRequest?.ccjPaymentOption?.type;
  }

  getCCJPaymentDate() : Date {
    return this.claimantResponse?.ccjRequest?.defendantPaymentDate?.date;
  }

  getCCJRepaymentPlan() : RepaymentPlanInstalments {
    return this.claimantResponse?.ccjRequest?.repaymentPlanInstalments;
  }

  getCCJRepaymentPlanAmount() : number {
    return this.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.amount;
  }

  getCCJRepaymentPlanFrequency() : TransactionSchedule {
    return this.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.paymentFrequency;
  }

  getCCJRepaymentPlanDate() : Date {
    return this.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.firstPaymentDate?.date;
  }

  hasDefendantPaid(): boolean {
    return this.claimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES;
  }

  isCCJComplete() {
    return this.ccdState === CaseState.PROCEEDS_IN_HERITAGE_SYSTEM && this.claimantResponse?.ccjRequest?.paidAmount?.option;
  }

  getHowTheInterestCalculatedReason(): string {
    return this.interest?.totalInterest?.reason;
  }

  detailsOfWhyYouDisputeTheClaim(): string {
    if (this.isFullDefence()) {
      return this.rejectAllOfClaim?.defence?.text ?? this.rejectAllOfClaim?.whyDoYouDisagree?.text;
    } else if (this.isPartialAdmission()) {
      return this.partialAdmission?.whyDoYouDisagree?.text;
    }
  }

  getPaymentIntention(): PaymentIntention {
    return this.isPartialAdmission() ? this.partialAdmission?.paymentIntention : this.fullAdmission?.paymentIntention;
  }

  hasExpertDetails(): boolean {
    return this.directionQuestionnaire?.experts?.expertDetailsList?.items?.length
      && this.directionQuestionnaire?.experts?.expertEvidence?.option === YesNo.YES;
  }

  private getName(party: Party): string {
    if (party?.type == PartyType.INDIVIDUAL || party?.type == PartyType.SOLE_TRADER) {
      if (party.partyDetails?.individualTitle) {
        return `${party.partyDetails.individualTitle} ${party.partyDetails.individualFirstName} ${party.partyDetails.individualLastName}`;
      } else {
        return `${party.partyDetails.individualFirstName} ${party.partyDetails.individualLastName}`;
      }
    }
    return party?.partyDetails?.partyName;
  }

  get claimType(): string {
    return analyseClaimType(this.totalClaimAmount);
  }

  get isFastTrackClaim(): boolean {
    return this.claimType === claimType.FAST_TRACK_CLAIM;
  }

  get isSmallClaimsTrackDQ(): boolean {
    return this.claimType === claimType.SMALL_CLAIM;
  }

  hasSdoOrderDocument(): boolean {
    return !!this.sdoOrderDocument;
  }

  hasClaimInMediation(): boolean {
    return this.ccdState === CaseState.IN_MEDIATION;
  }

  hasClaimantNotAgreedToMediation(): boolean {
    return this?.applicant1ClaimMediationSpecRequiredLip?.hasAgreedFreeMediation === 'No';
  }

  hasClaimantAgreedToMediation(): boolean {
    return this?.applicant1ClaimMediationSpecRequiredLip?.hasAgreedFreeMediation === 'Yes';
  }

  hasApplicant1DeadlinePassed(): boolean {
    const applicant1ResponseDeadline = this.applicant1ResponseDeadline && new Date(this.applicant1ResponseDeadline).getTime();
    const now = new Date();
    return applicant1ResponseDeadline <= now.getTime() && !this?.applicant1ResponseDate;
  }

  hasCaseProgressionHearingDocuments(): boolean {
    return !!this.caseProgressionHearing?.hearingDocuments;
  }

  get bundleStitchingDeadline(): string {
    return this.threeWeeksBeforeHearingDateString();
  }

  get finalisingTrialArrangementsDeadline(): string {
    return this.threeWeeksBeforeHearingDateString();
  }

  isBetweenSixAndThreeWeeksBeforeHearingDate(): boolean {
    const nowDate = new Date(new Date().setHours(0, 0, 0, 0));
    const sixWeeksBeforeHearingDate = this.sixWeeksBeforeHearingDate();
    const threeWeeksBeforeHearingDate = this.threeWeeksBeforeHearingDate();
    return nowDate >= sixWeeksBeforeHearingDate && nowDate <= threeWeeksBeforeHearingDate;
  }

  isBundleStitched(): boolean {
    const caseBundles: Bundle[] = this.caseProgression?.caseBundles;

    if (!caseBundles || caseBundles.length < 1) {
      return false;
    }

    return !!caseBundles[0]?.stitchedDocument;
  }

  lastBundleCreatedDate(): Date {
    const caseBundles: Bundle[] = this.caseProgression?.caseBundles;

    if (!caseBundles || caseBundles.length < 1) {
      return undefined;
    }

    BundlesFormatter.orderBundlesNewToOld(caseBundles);

    for (const bundle of caseBundles) {
      if (bundle.createdOn) {
        return bundle.createdOn;
      }
    }

    return undefined;
  }

  hasClaimTakenOffline() {
    return this.ccdState === CaseState.PROCEEDS_IN_HERITAGE_SYSTEM && !this.defaultJudgmentDocuments && !this.ccjJudgmentStatement && !this.isClaimantRejectedPaymentPlan();
  }

  hasMediationSuccessful() {
    return this.ccdState === CaseState.CASE_STAYED && !!this.mediationAgreement;
  }

  hasMediationUnSuccessful() {
    return !!this.unsuccessfulMediationReason;
  }

  hasDefaultJudgmentSubmitted() {
    return !!this.defaultJudgmentDocuments;
  }

  hasClaimantRequestedCCJ() {
    return !!this.ccjJudgmentStatement && !this.isClaimantRejectedPaymentPlan();
  }

  isClaimSettled() {
    return this.ccdState === CaseState.CASE_SETTLED;
  }

  isDefendantAgreedForMediation() {
    return this.mediation?.canWeUse
      && this.mediation?.companyTelephoneNumber
      && (Object.entries(this.mediation.canWeUse).length > 0 || Object.entries(this.mediation.companyTelephoneNumber).length > 0);
  }

  isClaimantRejectedPaymentPlan() {
    return this.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO;
  }

  threeWeeksBeforeHearingDateString() {
    const threeWeeksBefore = this.threeWeeksBeforeHearingDate();
    const options: DateTimeFormatOptions = {day: 'numeric', month: 'long', year: 'numeric'};
    return threeWeeksBefore.toLocaleDateString('en-GB', options);
  }

  private threeWeeksBeforeHearingDate() {
    const hearingDateTime = new Date(this.caseProgressionHearing.hearingDate).getTime();
    const threeWeeksMilli = 21 * 24 * 60 * 60 * 1000;
    const dateAtStartOfDay = new Date(hearingDateTime - threeWeeksMilli).setHours(0, 0, 0, 0);
    return new Date(dateAtStartOfDay);
  }

  private sixWeeksBeforeHearingDate(): Date {
    const hearingDateTime = new Date(this.caseProgressionHearing.hearingDate).getTime();
    const sixWeeksMilli = 42 * 24 * 60 * 60 * 1000;
    const dateAtStartOfDay = new Date(hearingDateTime - sixWeeksMilli).setHours(0, 0, 0, 0);
    return new Date(dateAtStartOfDay);
  }

  hasRespondent1NotAgreedMediation() {
    return this.mediation?.mediationDisagreement?.option === YesNo.NO;
  }

  hasRespondent1AgreedMediation() {
    return this.mediation?.canWeUse?.option || this.mediation?.companyTelephoneNumber?.option;
  }

  getFormattedCaseReferenceNumber(claimId: string): string {
    const parts = claimId.match(/.{1,4}/g);
    const claimId_new = parts.join('-');
    return claimId_new;
  }

  isClaimant() {
    return this.caseRole === CaseRole.APPLICANTSOLICITORONE || this.caseRole === CaseRole.CLAIMANT;
  }

  isDraftClaim(): boolean {
    return !!this.draftClaimCreatedAt;
  }

  hasClaimantSettleTheClaimForDefendantPartlyPaidAmount() {
    return this?.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.YES;
  }

  hasClaimantRejectedDefendantAdmittedAmount() {
    return this?.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO;
  }

  hasClaimantAcceptedDefendantAdmittedAmount() {
    return this?.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.YES;
  }

  hasClaimantRejectedDefendantResponse() {
    return this?.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO;
  }

  hasClaimantAcceptedDefendantResponse() {
    return this?.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.YES;
  }

  hasDefendantCompletedPaymentIntention() {
    return this.partialAdmission?.paymentIntention?.repaymentPlan || this.fullAdmission?.paymentIntention?.repaymentPlan ||
      this.partialAdmission?.paymentIntention?.paymentDate || this.fullAdmission?.paymentIntention?.paymentDate;
  }

  hasClaimantIntentToProceedResponse() {
    return this?.getIntentionToProceed() === YesNo.YES;
  }

  hasClaimantRejectIntentToProceedResponse() {
    return this?.getIntentionToProceed() === YesNo.NO;
  }

  hasCourtAcceptedClaimantsPlan() {
    return this.claimantResponse?.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
  }

  isLRClaimant() {
    return this.applicant1Represented === YesNoUpperCamelCase.YES;
  }
  isLRDefendant() {
    return this.specRespondent1Represented === YesNoUpperCamelCase.YES;
  }

  getPaymentDate() {
    if (this.isPAPaymentOptionByDate()) {
      return this.partialAdmission.paymentIntention.paymentDate;
    } else if (this.isFAPaymentOptionBySetDate()) {
      return this.fullAdmission.paymentIntention.paymentDate;
    }
  }

  getSuggestedPaymentIntentionOptionFromClaimant() : PaymentOptionType {
    return this.claimantResponse.suggestedPaymentIntention?.paymentOption;
  }

  getHowToProceed() : ChooseHowProceed {
    return this.claimantResponse?.chooseHowToProceed?.option;
  }

  getIntentionToProceed(): string{
    return this.claimantResponse?.intentionToProceed?.option;
  }
}

export interface StatementOfTruth {
  name?: string;
  role?: string;
}
