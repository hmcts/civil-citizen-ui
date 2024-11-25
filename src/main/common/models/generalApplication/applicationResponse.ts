import {ApplicationUpdate} from 'models/generalApplication/events/eventDto';
import { ApplicationState } from './applicationSummary';
import {CcdGeneralApplicationTypes} from 'models/ccdGeneralApplication/ccdGeneralApplicationTypes';
import {
  CcdGeneralApplicationRespondentAgreement,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationRespondentAgreement';
import {
  CcdGeneralApplicationInformOtherParty,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationInformOtherParty';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CcdGeneralApplicationEvidenceDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationEvidenceDocument';
import {CcdGARespondentDebtorOfferGAspec, CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import {
  CcdGeneralApplicationStatementOfTruth,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationStatementOfTruth';
import {
  CcdGeneralApplicationAddlDocument,
  CcdHearingDocument,
  CcdGeneralOrderDocument,
  CcdGaDraftDocument,
  CcdHearingNoticeDocument, CcdDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import { CcdGAMakeWithNoticeDocument } from '../ccdGeneralApplication/ccdGAMakeWithNoticeDocument';
import {CcdGeneralApplicationPBADetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationPBADetails';
import {CcdGeneralApplicationDirectionsOrderDocument} from 'models/ccdGeneralApplication/ccdGeneralApplicationDirectionsOrderDocument';
import { CcdGeneralApplicationRespondentResponse } from '../ccdGeneralApplication/ccdGeneralApplicationRespondentResponse';
import { DateTime } from 'luxon';
import {CcdGARequestWrittenRepDocument} from 'models/ccdGeneralApplication/ccdGARequestWrittenRepDocument';
import {GeneralAppUrgencyRequirement} from 'models/generalApplication/response/urgencyRequirement';
import {CcdGeneralApplicationCertOfSC} from 'models/ccdGeneralApplication/ccdGeneralApplicationCertOfSC';

export class ApplicationResponse {
  id: string;
  case_data: CCDApplication;
  state: ApplicationState;
  last_modified: string;
  created_date: string;

  constructor(
    id?: string,
    case_data?: CCDApplication,
    state?: ApplicationState,
    last_modified?: string,
    created_date?: string,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
    this.last_modified = last_modified;
    this.created_date = created_date;
  }
}

export interface CCDApplication extends ApplicationUpdate {
  applicationTypes: string;
  legacyCaseReference?: string;
  generalAppType: CcdGeneralApplicationTypes;
  generalAppRespondentAgreement: CcdGeneralApplicationRespondentAgreement;
  generalAppInformOtherParty: CcdGeneralApplicationInformOtherParty;
  generalAppAskForCosts: YesNoUpperCamelCase;
  generalAppDetailsOfOrder: string;
  generalAppReasonsOfOrder: string;
  generalAppEvidenceDocument: CcdGeneralApplicationEvidenceDocument[];
  gaAddlDoc: CcdGeneralApplicationAddlDocument[];
  gaRespondentDebtorOffer?: CcdGARespondentDebtorOfferGAspec;
  generalAppHearingDetails: CcdGeneralApplicationHearingDetails;
  generalAppStatementOfTruth: CcdGeneralApplicationStatementOfTruth;
  generalAppPBADetails: CcdGeneralApplicationPBADetails;
  respondentsResponses?: CcdGeneralApplicationRespondentResponse[];
  applicationFeeAmountInPence: string;
  parentClaimantIsApplicant: YesNoUpperCamelCase;
  judicialDecision: JudicialDecision;
  hearingOrderDocument? : CcdHearingDocument[];
  hearingNoticeDocument? : CcdHearingNoticeDocument[];
  requestForInformationDocument?: CcdGAMakeWithNoticeDocument[];
  directionOrderDocument?: CcdGeneralApplicationDirectionsOrderDocument[];
  generalOrderDocument? : CcdGeneralOrderDocument[];
  gaDraftDocument? : CcdGaDraftDocument[];
  judicialDecisionMakeOrder?: JudicialDecisionMakeOrder;
  dismissalOrderDocument?: CcdGeneralApplicationDirectionsOrderDocument[];
  judicialDecisionRequestMoreInfo?: JudicialRequestMoreInfo;
  writtenRepSequentialDocument?: CcdGARequestWrittenRepDocument[];
  writtenRepConcurrentDocument?: CcdGARequestWrittenRepDocument[];
  applicationIsUncloakedOnce?: YesNoUpperCamelCase;
  applicationIsCloaked?: YesNoUpperCamelCase;
  generalAppUrgencyRequirement?: GeneralAppUrgencyRequirement;
  generalAppNotificationDeadlineDate?: string;
  certOfSC?: CcdGeneralApplicationCertOfSC;
  generalAppN245FormUpload?: CcdDocument;
  applicantBilingualLanguagePreference?: YesNoUpperCamelCase;
}

export interface JudicialRequestMoreInfo {
  judgeRequestMoreInfoText : string;
  judgeRequestMoreInfoByDate : Date;
  deadlineForMoreInfoSubmission : DateTime;
  isWithNotice : YesNoUpperCamelCase;
  judgeRecitalText: string;
  judicialDecisionRequestMoreInfo?: JudicialDecisionRequestMoreInfo;
  judicialDecisionMakeAnOrderForWrittenRepresentations?: JudicialDecisionWrittenRepresentations;
  writtenRepSequentialDocument?: CcdGARequestWrittenRepDocument[];
  writtenRepConcurrentDocument?: CcdGARequestWrittenRepDocument[];
  requestMoreInfoOption?: JudicialDecisionRequestMoreInfoOptions;
}

export interface JudicialDecision {
  decision: JudicialDecisionOptions;
}

export enum JudicialDecisionOptions {
  MAKE_AN_ORDER = 'MAKE_AN_ORDER',
  FREE_FORM_ORDER = 'FREE_FORM_ORDER',
  REQUEST_MORE_INFO = 'REQUEST_MORE_INFO',
  LIST_FOR_A_HEARING = 'LIST_FOR_A_HEARING',
  MAKE_ORDER_FOR_WRITTEN_REPRESENTATIONS = 'MAKE_ORDER_FOR_WRITTEN_REPRESENTATIONS',
}
export interface JudicialDecisionMakeOrder {
  directionsResponseByDate?: string;
  makeAnOrder?: JudicialDecisionMakeAnOrderOptions;
}

export enum JudicialDecisionMakeAnOrderOptions {
  APPROVE_OR_EDIT = 'APPROVE_OR_EDIT',
  DISMISS_THE_APPLICATION = 'DISMISS_THE_APPLICATION',
  GIVE_DIRECTIONS_WITHOUT_HEARING = 'GIVE_DIRECTIONS_WITHOUT_HEARING',
}

export interface JudicialDecisionRequestMoreInfo {
  requestMoreInfoOption?: JudicialDecisionRequestMoreInfoOptions;
}

export enum JudicialDecisionRequestMoreInfoOptions {
  REQUEST_MORE_INFORMATION = 'REQUEST_MORE_INFORMATION',
  SEND_APP_TO_OTHER_PARTY = 'SEND_APP_TO_OTHER_PARTY',
}

export interface JudicialDecisionWrittenRepresentations {
  makeAnOrderForWrittenRepresentations?: JudicialDecisionWrittenRepresentationsOptions;
}

export enum JudicialDecisionWrittenRepresentationsOptions {
  SEQUENTIAL_REPRESENTATIONS = 'SEQUENTIAL_REPRESENTATIONS',
  CONCURRENT_REPRESENTATIONS = 'CONCURRENT_REPRESENTATIONS',
}
