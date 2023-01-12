import {CitizenDate} from '../form/models/claim/claimant/citizenDate';
import {GenericYesNo} from '../form/models/genericYesNo';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';
import {RejectionReason} from '../form/models/claimantResponse/rejectionReason';
import {CourtProposedPlan} from '../form/models/claimantResponse/courtProposedPlan';
import {Mediation} from '../models/mediation/mediation';
import {DirectionQuestionnaire} from './directionsQuestionnaire/directionQuestionnaire';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  datePaid?: CitizenDate;
  hasPartPaymentBeenAccepted?: GenericYesNo;
  fullAdmitSetDateAcceptPayment?: GenericYesNo;
  ccjRequest?: CCJRequest;
  intentionToProceed?: GenericYesNo;
  rejectionReason?: RejectionReason;
  chooseHowToProceed?: GenericYesNo;
  courtProposedPlan?: CourtProposedPlan;
  mediation?: Mediation;
  directionQuestionnaire?: DirectionQuestionnaire;
}
