import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {GenericYesNo} from 'form/models/genericYesNo';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';
import {RejectionReason} from 'form/models/claimantResponse/rejectionReason';
import {CourtProposedDate} from 'form/models/claimantResponse/courtProposedDate';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {CourtProposedPlan} from 'form/models/claimantResponse/courtProposedPlan';
import {Mediation} from 'models/mediation/mediation';
import {DirectionQuestionnaire} from './directionsQuestionnaire/directionQuestionnaire';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from 'common/form/models/yesNo';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {ChooseHowProceed} from 'models/chooseHowProceed';

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
  mediation?: Mediation;
  directionQuestionnaire?: DirectionQuestionnaire;
  defendantResponseViewed?: boolean;
  suggestedPaymentIntention?: PaymentIntention;
  claimantStatementOfTruth?: StatementOfTruthForm;
  hasFullDefenceStatesPaidClaimSettled?: GenericYesNo;
  submittedDate?: Date;

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

  get isCCJRequested() : boolean {
    return this.chooseHowToProceed?.option === ChooseHowProceed.REQUEST_A_CCJ;
  }

  get isClaimantAcceptedPaymentPlan() : boolean {
    return this.fullAdmitSetDateAcceptPayment?.option === YesNo.YES;
  }
}
