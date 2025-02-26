import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {YesNo} from 'form/models/yesNo';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RespondentAgreement} from './respondentAgreement';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {AcceptDefendantOffer} from './acceptDefendantOffer';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {GeneralAppUrgencyRequirement} from 'models/generalApplication/response/urgencyRequirement';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';

// CUI GA respondent response
export class GaResponse {
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  hearingSupport?: HearingSupport;
  unavailableDatesHearing?: UnavailableDatesGaHearing;
  hasUnavailableDatesHearing?: YesNo;
  agreeToOrder?: YesNo;
  respondentAgreement?: RespondentAgreement;
  acceptDefendantOffer?: AcceptDefendantOffer;
  statementOfTruth?: StatementOfTruthForm | QualifiedStatementOfTruth;
  wantToUploadDocuments?: YesNo;
  uploadEvidenceDocuments?: UploadGAFiles[];
  draftResponseCreatedAt?: Date;
  additionalText?: string;
  wantToUploadAddlDocuments?: YesNo;
  writtenRepText?: string;
  generalApplicationType?: ApplicationTypeOption[];
  generalAppUrgencyRequirement?: GeneralAppUrgencyRequirement;
  constructor(hearingArrangement?: HearingArrangement, hearingContactDetails?: HearingContactDetails, agreeToOrder?: YesNo,
    hearingSupport?: HearingSupport, unavailableDatesHearing?: UnavailableDatesGaHearing, respondentAgreement?: RespondentAgreement,
    acceptDefendantOffer?: AcceptDefendantOffer, statementOfTruth?: StatementOfTruthForm, wantToUploadDocuments?: YesNo, uploadEvidenceDocuments?: UploadGAFiles,
    hasUnavailableDatesHearing?: YesNo) {
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.agreeToOrder = agreeToOrder;
    this.hearingSupport = hearingSupport;
    this.unavailableDatesHearing = unavailableDatesHearing;
    this.respondentAgreement = respondentAgreement;
    this.acceptDefendantOffer = acceptDefendantOffer;
    this.statementOfTruth = statementOfTruth;
    this.wantToUploadDocuments = wantToUploadDocuments;
    this.uploadEvidenceDocuments = uploadEvidenceDocuments ? [uploadEvidenceDocuments] : [];
    this.hasUnavailableDatesHearing = hasUnavailableDatesHearing;
  }
}
