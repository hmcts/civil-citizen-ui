import {Validate, ValidateNested} from 'class-validator';
import {CaseDocument} from 'models/document/caseDocument';
import {
  EvidenceUploadDisclosure, EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {AtLeastOneCheckboxSelectedValidator} from 'form/validators/atLeastOneCheckboxSelectedValidator';

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
  constructor(disclosure?: UploadDocumentTypes[],witness?: UploadDocumentTypes[],expert?: UploadDocumentTypes[],trial?: UploadDocumentTypes[]) {
    this.disclosure = disclosure;
    this.witness = witness;
    this.expert = expert;
    this.trial = trial;
    this.checkboxGrp = [
      disclosure?.[0].selected, disclosure?.[1].selected,
      witness?.[0].selected, witness?.[1].selected, witness?.[2].selected, witness?.[3].selected, witness?.[4].selected,
      expert?.[0].selected, expert?.[1].selected, expert?.[2].selected, expert?.[3].selected,
      trial?.[0].selected, trial?.[1].selected, trial?.[2].selected, trial?.[3].selected, trial?.[4].selected,
    ];
  }

}
export class UploadDocumentTypes {
  selected?: boolean;
  caseDocument?: CaseDocument;
  documentType?: EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial;

  constructor(selected?: boolean, caseDocument?: CaseDocument, documentType?: EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial) {
    this.selected = selected;
    this.caseDocument = caseDocument;
    this.documentType = documentType;
  }
}
