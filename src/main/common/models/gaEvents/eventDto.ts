import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {CcdGeneralApplicationTypes} from 'models/ccdGeneralApplication/ccdGeneralApplicationTypes';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CcdGeneralApplicationInformOtherParty,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationInformOtherParty';
import {CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import {
  CcdGeneralApplicationEvidenceDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationEvidenceDocument';
import {ClaimUpdate} from 'models/events/eventDto';
import {
  CcdGeneralApplicationRespondentAgreement,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationRespondentAgreement';
import {
  CcdGeneralApplicationStatementOfTruth,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationStatementOfTruth';
import {CCDHelpWithFees} from 'form/models/claimDetails';
import {CaseLink} from 'models/generalApplication/CaseLink';

export interface EventDto {
  event: ApplicationEvent,
  caseDataUpdate?: CCDGeneralApplication | CCDGaHelpWithFees;
}

export interface CCDGeneralApplication extends ClaimUpdate {
  generalAppType?: CcdGeneralApplicationTypes;
  generalAppRespondentAgreement?: CcdGeneralApplicationRespondentAgreement;
  generalAppInformOtherParty?: CcdGeneralApplicationInformOtherParty;
  generalAppAskForCosts?: YesNoUpperCamelCase;
  generalAppDetailsOfOrder?: string;
  generalAppReasonsOfOrder?: string;
  generalAppEvidenceDocument?: CcdGeneralApplicationEvidenceDocument[];
  generalAppHearingDetails?: CcdGeneralApplicationHearingDetails;
  generalAppStatementOfTruth?: CcdGeneralApplicationStatementOfTruth;
  caseLink?: CaseLink;
  generalAppAddlnInfoUpload?: CcdGeneralApplicationEvidenceDocument[];
  uploadDocument?: AdditionalDocuments[]
}
interface DocumentDetails {
  document_url: string;
  document_binary_url: string;
  document_filename: string;
}

interface AdditionDocDetails {
  typeOfDocument: string,
  documentUpload: DocumentDetails
}

export interface AdditionalDocuments {
  id: string;
  value: AdditionDocDetails
}

export interface CCDGaHelpWithFees {

  generalAppHelpWithFees?: CCDHelpWithFees;

}
