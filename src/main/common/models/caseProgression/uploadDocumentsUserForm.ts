import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {IsAllowedMimeType} from 'form/validators/isAllowedMimeType';
import {IsFileSize} from 'form/validators/isFileSize';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';
import {DateDayValidator} from 'form/validators/dateDayValidator';
import {DateMonthValidator} from 'form/validators/dateMonthValidator';
import {DateYearValidator} from 'form/validators/dateYearValidator';
import {CaseDocument} from 'models/document/caseDocument';

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
    documentsReferred?: TypeOfDocumentSection[];
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

    //expert sections
    this.expertReport = expertReport;
    this.expertStatement = expertStatement;
    this.questionsForExperts = questionsForExperts;
    this.answersForExperts = answersForExperts;

    //trial sections
    this.trialCaseSummary = trialCaseSummary;
    this.trialSkeletonArgument = trialSkeletonArgument;
    this.trialAuthorities = trialAuthorities;
    this.trialCosts = trialCosts;
    this.trialDocumentary = trialDocumentary;
  }
}

export class FileUpload {
  fieldname: string;
  originalname: string;
  @IsAllowedMimeType({message: 'ERRORS.VALID_MIME_TYPE_FILE'})
    mimetype: string;
  buffer: ArrayBuffer;
  @IsFileSize({message: 'ERRORS.VALID_SIZE_FILE'})
    size: number;
}

export class FileOnlySection {
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;
  caseDocument: CaseDocument;
}

export class DateInputFields {
  @ValidateIf(o => ((o.dateDay !== undefined && o.dateMonth !== undefined && o.dateDay && o.dateMonth && o.dateYear && o.dateDay > 0 && o.dateDay < 32 && o.dateMonth > 0 && o.dateMonth < 13 && o.dateYear > 999)
    || (o.dateDay !== undefined && o.dateMonth !== undefined && !o.dateDay && !o.dateMonth && !o.dateYear)))
  @IsDefined({message: 'ERRORS.VALID_YOU_MUST_ENTER_DOI'})
  @IsNotEmpty({message: 'ERRORS.VALID_YOU_MUST_ENTER_DOI'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE_NOT_FUTURE'})
    date: Date;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Validate(DateDayValidator)
    dateDay: string;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Validate(DateMonthValidator)
    dateMonth: string;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Validate(DateYearValidator)
    dateYear: string;

  constructor(day?: string, month?: string, year?: string) {
    if (day !== undefined && month !== undefined && year != undefined) {
      this.dateDay = day;
      this.dateMonth = month;
      this.dateYear = year;
      this.date = DateConverter.convertToDate(year, month, day);
    }
  }
}

export class TypeOfDocumentSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;
  @ValidateNested()
    dateInputFields: DateInputFields;
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputFields(day, month, year);
  }

}

export class WitnessSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_WITNESS_NAME'})
    witnessName: string;
  @ValidateNested()
    dateInputFields: DateInputFields;
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputFields(day, month, year);
  }
}

export class ExpertSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERT_NAME'})
  @IsOptional()
    expertName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERT_NAMES'})
  @IsOptional()
    multipleExpertsName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERTISE'})
  @IsOptional()
    fieldOfExpertise: string;

  @IsNotEmpty({message: 'ERRORS.VALID_SELECT_OTHER_PARTY'})
  @IsOptional()
    otherPartyName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS'})
  @IsOptional()
    questionDocumentName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY'})
  @IsOptional()
    otherPartyQuestionsDocumentName: string;
  @ValidateNested()
    dateInputFields: DateInputFields;

  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputFields(day, month, year);
  }
}
