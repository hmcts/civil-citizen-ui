import 'reflect-metadata';
import {
  IsArray,
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
import {Type} from 'class-transformer';

export class UploadDocumentsUserForm {
  [key: string]: string | TypeOfDocumentSection[] | FileOnlySection[] | WitnessSection[] | WitnessSummarySection[] | ExpertSection[] | ReferredToInTheStatementSection[] | undefined;
  action?: string;
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => TypeOfDocumentSection)
    documentsForDisclosure?: TypeOfDocumentSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => FileOnlySection)
    disclosureList?: FileOnlySection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => WitnessSection)
    witnessStatement?: WitnessSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => WitnessSummarySection)
    witnessSummary?: WitnessSummarySection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => WitnessSection)
    noticeOfIntention?: WitnessSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => ReferredToInTheStatementSection)
    documentsReferred?: ReferredToInTheStatementSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => ExpertSection)
    expertReport?: ExpertSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => ExpertSection)
    expertStatement?: ExpertSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => ExpertSection)
    questionsForExperts?: ExpertSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => ExpertSection)
    answersForExperts?: ExpertSection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => FileOnlySection)
    trialCaseSummary?: FileOnlySection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => FileOnlySection)
    trialSkeletonArgument?: FileOnlySection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => FileOnlySection)
    trialAuthorities?: FileOnlySection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => FileOnlySection)
    trialCosts?: FileOnlySection[];
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => TypeOfDocumentSection)
    trialDocumentary?: TypeOfDocumentSection[];

  constructor(documentsForDisclosure?: TypeOfDocumentSection[], disclosureList?: FileOnlySection[],
    witnessStatement?: WitnessSection[], witnessSummary?: WitnessSummarySection[], noticeOfIntention?: WitnessSection[], documentsReferred?: ReferredToInTheStatementSection[],
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
  @ValidateNested()
  @Type(() => FileUpload)
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

export class DateInputFieldsWitnessSummary extends DateInputFields{
  @ValidateIf(o => ((o.dateDay !== undefined && o.dateMonth !== undefined && o.dateDay && o.dateMonth && o.dateYear && o.dateDay > 0 && o.dateDay < 32 && o.dateMonth > 0 && o.dateMonth < 13 && o.dateYear > 999)
    || (o.dateDay !== undefined && o.dateMonth !== undefined && !o.dateDay && !o.dateMonth && !o.dateYear)))
  @IsDefined({message: 'ERRORS.VALID_DATE_WITNESS_SUMMARY'})
  @IsNotEmpty({message: 'ERRORS.VALID_DATE_WITNESS_SUMMARY'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE_NOT_FUTURE'})
    date: Date;

  constructor(day?: string, month?: string, year?: string) {
    super(day, month, year);
  }
}

export class TypeOfDocumentSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;
  @ValidateNested()
    dateInputFields: DateInputFields;
  @ValidateNested()
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
  @Type(() => FileUpload)
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputFields(day, month, year);
  }

}

export class ReferredToInTheStatementSection extends TypeOfDocumentSection{
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_WITNESS_NAME'})
    witnessName: string;
}

export class WitnessSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_WITNESS_NAME'})
    witnessName: string;
  @ValidateNested()
    dateInputFields: DateInputFields;
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
  @ValidateNested()
  @Type(() => FileUpload)
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputFields(day, month, year);
  }
}

export class WitnessSummarySection extends WitnessSection{
  @ValidateNested()
    dateInputFields: DateInputFieldsWitnessSummary;

  constructor(day?: string, month?: string, year?: string) {
    super(day, month, year);
    this.dateInputFields = new DateInputFieldsWitnessSummary(day, month, year);
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
  @ValidateNested()
  @Type(() => FileUpload)
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputFields(day, month, year);
  }
}
