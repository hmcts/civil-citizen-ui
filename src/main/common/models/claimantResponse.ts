import {CitizenDate} from '../form/models/claim/claimant/citizenDate';
import {GenericYesNo} from '../form/models/genericYesNo';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';
import {RejectionReason} from '../form/models/claimantResponse/rejectionReason';
import {CourtProposedDate} from '../form/models/claimantResponse/courtProposedDate';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {CourtProposedPlan} from '../form/models/claimantResponse/courtProposedPlan';
import {Mediation} from '../models/mediation/mediation';
import {DirectionQuestionnaire} from './directionsQuestionnaire/directionQuestionnaire';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  datePaid?: CitizenDate;
  hasPartPaymentBeenAccepted?: GenericYesNo;
  hasPartAdmittedBeenAccepted?: GenericYesNo;
  fullAdmitSetDateAcceptPayment?: GenericYesNo;
  ccjRequest?: CCJRequest;
  intentionToProceed?: GenericYesNo;
  rejectionReason?: RejectionReason;
  chooseHowToProceed?: GenericYesNo;
  courtProposedDate?: CourtProposedDate;
  signSettlementAgreement?: SignSettlmentAgreement;
  courtProposedPlan?: CourtProposedPlan;
  mediation?: Mediation;
  directionQuestionnaire?: DirectionQuestionnaire;
  defendantResponseViewed?: boolean;
}
