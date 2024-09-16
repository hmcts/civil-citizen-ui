import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {CcdGeneralApplicationTypes} from 'models/ccdGeneralApplication/ccdGeneralApplicationTypes';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CcdGeneralApplicationInformOtherParty,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationInformOtherParty';
import {CcdGARespondentDebtorOfferGAspec, CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
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
  caseDataUpdate?: CCDGeneralApplication | CCDRespondToApplication | CCDGaHelpWithFees;
}

export interface CCDGeneralApplication extends ClaimUpdate {
  id?: string;
  value?: CCDGaValue;
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
  generalAppDirOrderUpload?: CcdGeneralApplicationEvidenceDocument[];
  uploadDocument?: AdditionalDocuments[];
  generalAppWrittenRepUpload?: CcdGeneralApplicationEvidenceDocument[];
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

export interface CCDGaValue {
  caseLink?: CaseLink;
  parentClaimantIsApplicant?: YesNoUpperCamelCase;
}

export type CCDRespondToApplication = {
  hearingDetailsResp: CcdGeneralApplicationHearingDetails,
  gaRespondentDebtorOffer: CcdGARespondentDebtorOfferGAspec,
  gaRespondentConsent?: YesNoUpperCamelCase,
  generalAppRespondConsentReason?: string,
  generalAppRespondReason?: string,
  generalAppRespondent1Representative?: { hasAgreed?: YesNoUpperCamelCase },
  generalAppRespondDocument?: CcdGeneralApplicationEvidenceDocument[];
}
