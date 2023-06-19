import {Validate, ValidateNested} from 'class-validator';
import {
  EvidenceUploadDisclosure, EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {AtLeastOneCheckboxSelectedValidator} from 'form/validators/atLeastOneCheckboxSelectedValidator';
import {Document} from 'models/document/document';

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
      disclosure?.[0].selected, disclosure?.[1]?.selected,
      witness?.[0].selected, witness?.[1]?.selected, witness?.[2]?.selected, witness?.[3]?.selected,
      expert?.[0].selected, expert?.[1]?.selected, expert?.[2]?.selected, expert?.[3]?.selected,
      trial?.[0].selected, trial?.[1]?.selected, trial?.[2]?.selected, trial?.[3]?.selected, trial?.[4]?.selected,
    ];
  }

}
export class UploadDocumentTypes {
  selected?: boolean;
  uuid?: string;
  caseDocument?: UploadEvidenceWitness | UploadEvidenceExpert | UploadEvidenceDocumentType;
  documentType?: EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial;

  constructor(selected?: boolean, caseDocument?: UploadEvidenceWitness | UploadEvidenceExpert | UploadEvidenceDocumentType,
    documentType?: EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial, uuid?: string) {
    this.selected = selected;
    this.caseDocument = caseDocument;
    this.documentType = documentType;
    this.uuid = uuid;
  }
}

export class UploadEvidenceWitness {
  witnessOptionName: string;
  witnessOptionUploadDate: Date;
  witnessOptionDocument: Document;
  createdDateTime: Date;

  constructor(witnessOptionName: string, witnessOptionUploadDate: Date, witnessOptionDocument: Document, createdDateTime: Date) {
    this.witnessOptionName = witnessOptionName;
    this.witnessOptionUploadDate = witnessOptionUploadDate;
    this.witnessOptionDocument = witnessOptionDocument;
    this.createdDateTime = createdDateTime;
  }
}

export class UploadEvidenceExpert {
  expertOptionName: string;
  expertOptionExpertise: string;
  expertOptionExpertises: string;
  expertOptionOtherParty: string;
  expertDocumentQuestion: string;
  expertDocumentAnswer: string;
  expertOptionUploadDate: Date;
  expertDocument: Document;
  createdDateTime: Date;

  constructor(expertOptionName: string, expertOptionExpertise: string, expertOptionExpertises: string,
    expertOptionOtherParty: string, expertDocumentQuestion: string, expertDocumentAnswer: string,
    expertOptionUploadDate: Date, expertDocument: Document, createdDateTime: Date) {
    this.expertOptionName = expertOptionName;
    this.expertOptionExpertise = expertOptionExpertise;
    this.expertOptionExpertises = expertOptionExpertises;
    this.expertOptionOtherParty = expertOptionOtherParty;
    this.expertDocumentQuestion = expertDocumentQuestion;
    this.expertDocumentAnswer = expertDocumentAnswer;
    this.expertOptionUploadDate = expertOptionUploadDate;
    this.expertDocument = expertDocument;
    this.createdDateTime = createdDateTime;
  }
}

export class UploadEvidenceDocumentType {
  typeOfDocument: string;
  documentIssuedDate: Date;
  documentUpload: Document;
  createdDateTime: Date;

  constructor(typeOfDocument: string, documentIssuedDate: Date, documentUpload: Document, createdDateTime: Date) {
    this.typeOfDocument = typeOfDocument;
    this.documentIssuedDate = documentIssuedDate;
    this.documentUpload = documentUpload;
    this.createdDateTime = createdDateTime;
  }
}

export class UploadEvidenceElementCCD
{
  id: string;
  value: UploadEvidenceDocumentType | UploadEvidenceExpert | UploadEvidenceWitness;
}
