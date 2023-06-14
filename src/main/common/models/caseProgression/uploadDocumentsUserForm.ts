import {IsDate, IsDefined, IsNotEmpty, Max, Min, Validate, ValidateIf, ValidateNested} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from 'form/validators/optionalDateFourDigitValidator';
import {toNumberOrString} from 'common/utils/numberConverter';
export class UploadDocumentsUserForm {
  @ValidateNested()
    documentsForDisclosure?: TypeOfDocumentSection[];
  @ValidateNested()
    disclosureList?: FileOnlySection[];
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

  constructor(documentsForDisclosure?: TypeOfDocumentSection[], disclosureList?: FileOnlySection[], trialCaseSummary?: FileOnlySection[], trialSkeletonArgument?: FileOnlySection[], trialAuthorities?: FileOnlySection[], trialCosts?: FileOnlySection[], trialDocumentary?: TypeOfDocumentSection[]) {
    //disclosure sections
    this.documentsForDisclosure = documentsForDisclosure;
    this.disclosureList = disclosureList;

    //trial sections
    this.trialCaseSummary = trialCaseSummary;
    this.trialSkeletonArgument = trialSkeletonArgument;
    this.trialAuthorities = trialAuthorities;
    this.trialCosts = trialCosts;
    this.trialDocumentary = trialDocumentary;
    //todo: add other sections
  }
}

export class TypeOfDocumentSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;

  @ValidateIf(o => ((o.dateDay && o.dateMonth && o.dateYear && o.dateDay > 0 && o.dateDay < 32 && o.dateMonth > 0 && o.dateMonth < 13 && o.dateYear > 999)
    || (!o.dateDay && !o.dateMonth && !o.dateYear)))
  @IsDefined({message: 'ERRORS.VALID_YOU_MUST_ENTER_DOI'})
  @IsNotEmpty({message: 'ERRORS.VALID_YOU_MUST_ENTER_DOI'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE_NOT_FUTURE'})
    date: Date;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Min(1, {message: 'ERRORS.VALID_REAL_DATE'})
  @Max(31, {message: 'ERRORS.VALID_REAL_DATE'})
  @IsNotEmpty({message: 'ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_DAY'})
    dateDay: number | string;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Min(1, {message: 'ERRORS.VALID_REAL_DATE'})
  @Max(12, {message: 'ERRORS.VALID_REAL_DATE'})
  @IsNotEmpty({message: 'ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_MONTH'})
    dateMonth: number | string;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_REAL_DATE'})
  @Max(9999, {message: 'ERRORS.VALID_REAL_DATE' })
  @IsNotEmpty({message: 'ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_YEAR'})
    dateYear: number | string;

  fileUpload: string; //todo: get and validate files

  constructor(day?: string, month?: string, year?: string) {
    this.dateDay = toNumberOrString(day);
    this.dateMonth = toNumberOrString(month);
    this.dateYear = toNumberOrString(year);
    this.date = DateConverter.convertToDate(year, month, day);
  }
}

export class FileOnlySection {
  fileUpload: string; //todo: get and validate file
}
