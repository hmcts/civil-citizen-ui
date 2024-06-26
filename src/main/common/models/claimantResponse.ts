import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {GenericYesNo} from 'form/models/genericYesNo';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';
import {RejectionReason} from 'form/models/claimantResponse/rejectionReason';
import {CourtProposedDate, CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {CourtProposedPlan, CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {Mediation} from 'models/mediation/mediation';
import {DirectionQuestionnaire} from './directionsQuestionnaire/directionQuestionnaire';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo, YesNoUpperCase} from 'common/form/models/yesNo';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {RepaymentDecisionType} from './claimantResponse/RepaymentDecisionType';
import {MediationCarm} from 'models/mediation/mediationCarm';
import {ResponseDocument} from 'models/document/document';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  datePaid?: CitizenDate;
  hasPartPaymentBeenAccepted?: GenericYesNo;
  hasPartAdmittedBeenAccepted?: GenericYesNo;
  fullAdmitSetDateAcceptPayment?: GenericYesNo;
  ccjRequest?: CCJRequest;
  intentionToProceed?: GenericYesNo;
  rejectionReason?: RejectionReason;
  chooseHowToProceed?: ChooseHowToProceed;
  courtProposedDate?: CourtProposedDate;
  signSettlementAgreement?: SignSettlmentAgreement;
  courtProposedPlan?: CourtProposedPlan;
  courtDecision?: RepaymentDecisionType;
  mediation?: Mediation;
  mediationCarm?: MediationCarm;
  directionQuestionnaire?: DirectionQuestionnaire;
  defendantResponseViewed?: boolean;
  suggestedPaymentIntention?: PaymentIntention;
  claimantStatementOfTruth?: StatementOfTruthForm;
  hasFullDefenceStatesPaidClaimSettled?: GenericYesNo;
  submittedDate?: Date;
  suggestedImmediatePaymentDeadLine: Date;
  applicant1DefenceResponseDocumentSpec?: ResponseDocument;

  get isClaimantSuggestedPayImmediately(): boolean{
    return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY;
  }

  get isClaimantSuggestedPayByDate(): boolean {
    return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
  }

  get isClaimantSuggestedPayByInstalments(): boolean {
    return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
  }

  get isClaimantNotIntendedToProceed(): boolean {
    return this.intentionToProceed?.option === YesNo.NO;
  }

  get isClaimantAcceptedPartAdmittedAmount(): boolean {
    return this.hasPartAdmittedBeenAccepted?.option === YesNo.YES;
  }

  get isClaimantNotAcceptedPartAdmittedAmount(): boolean {
    return this.hasPartAdmittedBeenAccepted?.option === YesNo.NO;
  }

  get isSignSettlementAgreement(): boolean {
    return this.signSettlementAgreement?.signed !== undefined;
  }

  get isCourtDecisionInFavourOfDefendant(): boolean {
    return this.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT;
  }

  get isCourtDecisionInFavourOfClaimant(): boolean {
    return this.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
  }

  get isCCJRequested() : boolean {
    return this.chooseHowToProceed?.option === ChooseHowProceed.REQUEST_A_CCJ;
  }

  get isSignASettlementAgreement(): boolean {
    return this.chooseHowToProceed?.option === ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;
  }

  get isClaimantAcceptedPaymentPlan() : boolean {
    return this.fullAdmitSetDateAcceptPayment?.option === YesNo.YES;
  }

  get isClaimantAcceptsCourtDecision(): boolean {
    return this.courtProposedDate?.decision === CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE
      || this.courtProposedPlan?.decision === CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN;
  }

  get isRequestJudgePaymentPlan(): boolean {
    return this.courtProposedDate?.decision === CourtProposedDateOptions.JUDGE_REPAYMENT_DATE
      || this.courtProposedPlan?.decision === CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN;
  }

  get canWeUseFromClaimantResponse(): YesNoUpperCase {
    if (this.mediation?.canWeUse?.option) {
      return YesNoUpperCase.YES;
    } else {
      if (this.mediation?.mediationDisagreement?.option) {
        return YesNoUpperCase.NO;
      } else if (this.mediation?.companyTelephoneNumber) {
        return YesNoUpperCase.YES;
      }
    }
    return YesNoUpperCase.NO;
  }

  isCCJRepaymentPlanConfirmationPageAllowed(): boolean {
    return (this.isClaimantAcceptsCourtDecision || this.isCourtDecisionInFavourOfClaimant) && this.isCCJRequested;
  }

  hasClaimantNotAgreedToMediation(): boolean {
    return this.mediation?.mediationDisagreement?.option === YesNo.NO;
  }

  hasClaimantAgreedToMediation(): boolean {
    return (this.mediation?.canWeUse?.option === YesNo.YES || !!this.mediation?.canWeUse?.mediationPhoneNumber)
    || (this.mediation?.companyTelephoneNumber?.option === YesNo.NO)
    || (this.mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation !== undefined);
  }

  get isRejectionReasonCompleted(): boolean {
    return (this.hasPartPaymentBeenAccepted?.option === YesNo.NO
        || this.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO)
      && !!this.rejectionReason?.text;
  }

  get isClaimantRejectedCourtDecision(): boolean {
    return this.courtProposedDate?.decision === CourtProposedDateOptions.JUDGE_REPAYMENT_DATE
        || this.courtProposedPlan?.decision === CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN;
  }
  get isClaimantAcceptCourtProposedPlanDecision() : boolean {
    return this.courtProposedPlan?.decision === CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN;
  }

}
