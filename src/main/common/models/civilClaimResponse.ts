import {StatementOfTruth} from './claim';
import {CaseState, ClaimAmountBreakup, ClaimFee} from '../form/models/claimDetails';
import {ClaimantResponse} from '../../common/models/claimantResponse';
import {ClaimDetails} from '../../common/form/models/claim/details/claimDetails';
import {StatementOfMeans} from '../../common/models/statementOfMeans';
import {PaymentOptionType} from '../../common/form/models/admission/paymentOption/paymentOptionType';
import {RepaymentPlan} from '../../common/models/repaymentPlan';
import {PartialAdmission} from '../../common/models/partialAdmission';
import {RejectAllOfClaim} from '../../common/form/models/rejectAllOfClaim';
import {Mediation} from '../../common/models/mediation/mediation';
import {DefendantEvidence} from '../../common/models/evidence/evidence';
import {TimeLineOfEvents} from '../../common/models/timelineOfEvents/timeLineOfEvents';
import {StatementOfTruthForm} from '../../common/form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from '../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {YesNo} from '../../common/form/models/yesNo';
import {Interest} from '../../common/form/models/interest/interest';
import {Document} from '../../common/models/document/document';
import {SystemGeneratedCaseDocuments} from '../../common/models/document/systemGeneratedCaseDocuments';
import {ResponseDeadline} from '../../common/models/responseDeadline';
import {DirectionQuestionnaire} from '../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {CCDParty} from '../../common/models/ccdResponse/ccdParty';
import {ClaimUpdate} from 'models/events/eventDto';

export class CivilClaimResponse {
  id: string;
  case_data: CCDClaim;
  state: CaseState;

  constructor(
    id?: string,
    case_data?: CCDClaim,
    state?: CaseState,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
  }
}

export interface CCDClaim extends ClaimUpdate{
  legacyCaseReference?: string;
  applicant1?: CCDParty;
  claimantResponse?: ClaimantResponse;
  applicantSolicitor1ClaimStatementOfTruth?: StatementOfTruth;
  totalClaimAmount?: number;
  respondent1ResponseDeadline?: Date;
  claimDetails?: ClaimDetails;
  respondent1?: CCDParty;
  statementOfMeans?: StatementOfMeans;
  paymentOption?: PaymentOptionType;
  repaymentPlan?: RepaymentPlan;
  paymentDate?: Date;
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
  ccdState?: CaseState;
  responseDeadline?: ResponseDeadline;
  directionQuestionnaire?: DirectionQuestionnaire;
  respondent1ResponseDate?: Date;
}
