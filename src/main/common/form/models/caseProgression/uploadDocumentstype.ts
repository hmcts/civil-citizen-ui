import {IsDefined, Validate, ValidateIf, ValidateNested} from 'class-validator';
import {CaseDocument} from 'models/document/caseDocument';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadFiles,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {AtLeastOneCheckboxSelectedValidator} from 'form/validators/atLeastOneCheckboxSelectedValidator';
import {YesNo} from 'form/models/yesNo';

export class uploadDocumentTypeList {
  @IsDefined({message: 'ERRORS.SELECT_YES_IF_SUPPORT'})
    option: YesNo;
  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    items?: UploadDocument;

  [key: string]: YesNo | UploadDocument;
  constructor(option?: YesNo, items?: UploadDocument) {
    this.option = option;
    this.items = items;
  }
}

export interface SupportRequiredParams{
  disclosure?: UploadDocumentTypes[],
  witness?: UploadDocumentTypes[],
  expert?: UploadDocumentTypes[],
  trial?: UploadDocumentTypes[],
}

export class UploadDocument {

  @ValidateNested()
    disclosure?: UploadDocumentTypes[];
  @ValidateNested()
    witness?: UploadDocumentTypes[];
  @ValidateNested()
    expert?: UploadDocumentTypes[];
  @ValidateNested()
    trial?: UploadDocumentTypes[];
  @Validate(AtLeastOneCheckboxSelectedValidator, {message: 'ERRORS.SELECT_SUPPORT' })
    checkboxGrp?: boolean [];

  [key: string]: string | UploadDocumentTypes[] | boolean[];
  constructor(params?: SupportRequiredParams) {
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

