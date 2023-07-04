import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidateIf,
  ValidateNested} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';
import {DateDayValidator} from 'form/validators/dateDayValidator';
import {DateMonthValidator} from 'form/validators/dateMonthValidator';
import {DateYearValidator} from 'form/validators/dateYearValidator';
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

export class FileOnlySection {
  fileUpload: string; //todo: get and validate file
}

export class DateInputFields extends  FileOnlySection {
    @ValidateIf(o => ((o.dateDay!==undefined && o.dateMonth!==undefined && o.dateDay && o.dateMonth && o.dateYear && o.dateDay > 0 && o.dateDay < 32 && o.dateMonth > 0 && o.dateMonth < 13 && o.dateYear > 999)
      || (o.dateDay!==undefined && o.dateMonth!==undefined && !o.dateDay && !o.dateMonth && !o.dateYear)))
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
      super();
      if (day !== undefined && month !== undefined && year != undefined) {
        this.dateDay = day;
        this.dateMonth = month;
        this.dateYear = year;
        this.date = DateConverter.convertToDate(year, month, day);
      }
    }
}

export class TypeOfDocumentSection extends DateInputFields {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;
  constructor(day?: string, month?: string, year?: string) {
    super(day, month, year);
  }
}
export class WitnessSection extends DateInputFields {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_WITNESS_NAME'})
    witnessName: string;
  constructor(day?: string, month?: string, year?: string) {
    super(day, month, year);
  }
}

export class ExpertSection extends DateInputFields {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERT_NAME'})
    expertName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_EXPERTISE'})
  @IsOptional()
    fieldOfExpertise: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_OTHER_PARTY'})
  @IsOptional()
    otherPartyName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS'})
  @IsOptional()
    questionDocumentName: string;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY'})
  @IsOptional()
    otherPartyQuestionsDocumentName: string;

  constructor(day?: string, month?: string, year?: string) {
    super(day, month, year);
  }
}
