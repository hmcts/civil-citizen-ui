import {IsNotEmpty, IsOptional, ValidateNested} from 'class-validator';

export class UploadDocumentsUserForm {
  @ValidateNested()
    documentsForDisclosure?: TypeOfDocumentSection[];
  @ValidateNested()
    disclosureList?: FileOnlySection[];
  @ValidateNested()
    witnessStatement?: WitnessSection[];
  @ValidateNested()
    witnessSummary?: WitnessSection[];
  @ValidateNested()
    noticeOfIntention?: WitnessSection[];
  @ValidateNested()
    documentsReferred?: FileOnlySection[];
  @ValidateNested()
    expertReport?: ExpertSection[];
  @ValidateNested()
    expertStatement?: ExpertSection[];
  @ValidateNested()
    questionsForExperts?: ExpertSection[];
  @ValidateNested()
    answersForExperts?: ExpertSection[];
  @ValidateNested()
    trialCaseSummary?: FileOnlySection[];
  @ValidateNested()
    trialSkeletonArgument?: FileOnlySection[];
  @ValidateNested()
    trialAuthorities?: FileOnlySection[];
  @ValidateNested()
    trialCosts?: FileOnlySection[];
  @ValidateNested()
    trialDocumentary?: TypeOfDocumentSection[];

  constructor(documentsForDisclosure?: TypeOfDocumentSection[], disclosureList?: FileOnlySection[],
    witnessStatement?: WitnessSection[], witnessSummary?: WitnessSection[], noticeOfIntention?: WitnessSection[], documentsReferred?: TypeOfDocumentSection[],
    expertReport?: ExpertSection[], expertStatement?: ExpertSection[], questionsForExperts?: ExpertSection[], answersForExperts?: ExpertSection[],
    trialCaseSummary?: FileOnlySection[], trialSkeletonArgument?: FileOnlySection[], trialAuthorities?: FileOnlySection[], trialCosts?: FileOnlySection[], trialDocumentary?: TypeOfDocumentSection[]) {
    //disclosure sections
    this.documentsForDisclosure = documentsForDisclosure;
    this.disclosureList = disclosureList;

    //witness sections
    this.witnessStatement = witnessStatement;
    this.witnessSummary = witnessSummary;
    this.noticeOfIntention = noticeOfIntention;
    this.documentsReferred = documentsReferred;

    this.expertReport = expertReport;
    this.expertStatement =expertStatement;
    this.questionsForExperts =questionsForExperts;
    this.answersForExperts = answersForExperts;

    //trial sections
    this.trialCaseSummary = trialCaseSummary;
    this.trialSkeletonArgument = trialSkeletonArgument;
    this.trialAuthorities = trialAuthorities;
    this.trialCosts = trialCosts;
    this.trialDocumentary = trialDocumentary;
  }
}

export class FileOnlySection {
  fileUpload: string; //todo: get and validate file
}

export class TypeOfDocumentSection extends FileOnlySection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;

  //todo: validate date
  dateDay: string;
  dateMonth: string;
  dateYear: string;
}

export class WitnessSection extends FileOnlySection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_WITNESS_NAME'})
    witnessName: string;

  dateDay: string;
  dateMonth: string;
  dateYear: string;
}

export class ExpertSection extends FileOnlySection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERT_NAME'})
  @IsOptional()
    expertName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERT_NAMES'})
  @IsOptional()
    multipleExpertsName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERTISE'})
  @IsOptional()
    fieldOfExpertise: string;

  // @IsNotEmpty({message: 'ERRORS.VALID_ENTER_OTHER_PARTY'})
  @IsOptional()
    otherPartyName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS'})
  @IsOptional()
    questionDocumentName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY'})
  @IsOptional()
    otherPartyQuestionsDocumentName: string;

  dateDay: string;
  dateMonth: string;
  dateYear: string;
}
