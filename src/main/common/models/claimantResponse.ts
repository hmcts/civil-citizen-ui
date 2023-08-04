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

export enum ClaimantIntention {
  NOT_TO_PROCEED_WITH_CLAIM = 'NOT_TO_PROCEED_WITH_CLAIM',
  ACCEPTED_DEFENDANT_RESPONSE = 'ACCEPTED_DEFENDANT_RESPONSE',
  REJECTED_DEFENDANT_RESPONSE = 'REJECTED_DEFENDANT_RESPONSE',
  PROPOSED_DIFFERENT_REPAYMENT_PLAN = 'PROPOSED_DIFFERENT_REPAYMENT_PLAN',
  SIGNED_SETTLEMENT_AGREEMENT = 'SIGNED_SETTLEMENT_AGREEMENT',
  ACCEPTED_PLAN_AND_REQUESTED_CCJ = 'ACCEPTED_PLAN_AND_REQUESTED_CCJ',
  REJECTED_PLAN_AND_REQUESTED_CCJ = 'REJECTED_PLAN_AND_REQUESTED_CCJ',
  REJECTED_PLAN_AND_AGREED_MEDIATION = 'REJECTED_PLAN_AND_AGREED_MEDIATION',
}

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

  get isClaimantSuggestedPayImmediately(): boolean{
    return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY;
  }

  get isClaimantSuggestedPayByDate(): boolean {
    return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
  }

  get isClaimantSuggestedPayByInstalments(): boolean {
    return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
  }

  get claimantIntention(): ClaimantIntention {
    if (this.intentionToProceed?.option === YesNo.NO) {
      return ClaimantIntention.NOT_TO_PROCEED_WITH_CLAIM;
    }
    if (this.hasPartAdmittedBeenAccepted?.option === YesNo.YES) {
      return ClaimantIntention.ACCEPTED_DEFENDANT_RESPONSE;
    }
  }
}
