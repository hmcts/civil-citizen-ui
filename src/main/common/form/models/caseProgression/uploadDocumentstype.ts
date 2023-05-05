import {Validate, ValidateNested} from 'class-validator';
import {CaseDocument} from 'models/document/caseDocument';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadFiles,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {AtLeastOneCheckboxSelectedValidator} from 'form/validators/atLeastOneCheckboxSelectedValidator';

export interface uploadDocumentParams{
  disclosure?: UploadDocumentTypes[],
  witness?: UploadDocumentTypes[],
  expert?: UploadDocumentTypes[],
  trial?: UploadDocumentTypes[],
}

export class UploadDocuments {

  @ValidateNested()
    disclosure?: UploadDocumentTypes[];
  @ValidateNested()
    witness?: UploadDocumentTypes[];
  @ValidateNested()
    expert?: UploadDocumentTypes[];
  @ValidateNested()
    trial?: UploadDocumentTypes[];
  @Validate(AtLeastOneCheckboxSelectedValidator, {message: 'ERRORS.VALID_ENTER_AT_LEAST_ONE_UPLOAD' })
    checkboxGrp?: boolean [];

  [key: string]: string | UploadDocumentTypes[] | boolean[];
  constructor(params?: uploadDocumentParams) {
    this.disclosure = params?.disclosure;
    this.witness = params?.witness;
    this.expert = params?.expert;
    this.trial = params?.trial;
    //Todo foreach one inside of each section
    this.checkboxGrp = [
      params?.disclosure?.[0].selected,
      params?.witness?.[0].selected,
      params?.expert?.[0].selected,
      params?.trial?.[0].selected,
    ];
  }
}
export class UploadDocumentTypes{
  selected?: boolean;
  caseDocument?: CaseDocument;
  documentType?:EvidenceUploadWitness|EvidenceUploadDisclosure|EvidenceUploadFiles|EvidenceUploadTrial;
}

