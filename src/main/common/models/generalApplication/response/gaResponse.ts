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

// CUI GA respondent response
export class GaResponse {
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  hearingSupport?: HearingSupport;
  unavailableDatesHearing?: UnavailableDatesGaHearing;
  agreeToOrder?: YesNo;
  respondentAgreement?: RespondentAgreement;
  acceptDefendantOffer?: AcceptDefendantOffer;
  statementOfTruth?: StatementOfTruthForm;
  wantToUploadDocuments?: YesNo;
  uploadEvidenceDocuments?: UploadGAFiles[];
  draftResponseCreatedAt?: Date;
  additionalText?: string;
  wantToUploadAddlDocuments?: YesNo;
  writtenRepText?: string;
  generalApplicationType?: ApplicationTypeOption[];
  additionalText?: string;
  wantToUploadAddlDocuments?: YesNo;
  
  constructor(hearingArrangement?: HearingArrangement, hearingContactDetails?: HearingContactDetails, agreeToOrder?: YesNo,
    hearingSupport?: HearingSupport, unavailableDatesHearing?: UnavailableDatesGaHearing, respondentAgreement?: RespondentAgreement,
    acceptDefendantOffer?: AcceptDefendantOffer, statementOfTruth?: StatementOfTruthForm, wantToUploadDocuments?: YesNo, uploadEvidenceDocuments?: UploadGAFiles) {
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
  }
}
