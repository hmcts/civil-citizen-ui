import {
  IsDate,
  IsDefined,
  IsNotEmpty, Max,
  MaxLength, Min, Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateNotInPastValidator} from 'form/validators/optionalDateNotInPastValidator';

export class CreateQuery {
  @MaxLength(200, {message: 'ERRORS.QUERY_MANAGEMENT.MORE_THAN_200'})
  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_SUBJECT'})
    messageSubject: string;

  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_DETAILS'})
    messageDetails: string;

  @IsDefined({message: 'ERRORS.QUERY_MANAGEMENT.HEARING_RELATED'})
    isHearingRelated: string;

  @ValidateIf(o => o.isHearingRelated === 'yes' && ((o.day !== undefined && o.month !== undefined && o.day && o.month && o.year && o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 1)
    || (o.day !== undefined && o.month !== undefined && !o.day && !o.month && !o.year)))
  @IsDate({message: 'ERRORS.QUERY_MANAGEMENT.VALID_DATE_BLANK'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_FUTURE_DATE'})
  date?: Date;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_DAY'})
  @Max(31, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_DAY'})
  day?: number;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_MONTH'})
  month?: number;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_YEAR'})
  year?: number;

  uploadedFiles: UploadQMAdditionalFile[];

  constructor(messageSubject?: string, messageDetails?: string, isHearingRelated?: string, year?: string, month?: string, day?: string, fileUpload?: FileUpload, uploadedFiles?: FileUpload[]) {
    this.messageSubject = messageSubject;
    this.messageDetails = messageDetails;
    this.isHearingRelated = isHearingRelated;
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
    this.uploadedFiles = [];
  }

}

export class UploadQMAdditionalFile {
  @ValidateNested()
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '')
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2'})
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(fileUpload?: FileUpload, caseDocument?: CaseDocument) {
    this.fileUpload = fileUpload;
    this.caseDocument = caseDocument;
  }

}

export class UpcomingHearingDate {
  @ValidateIf(o => ((o.day !== undefined && o.month !== undefined && o.day && o.month && o.year && o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999)
    || (o.day !== undefined && o.month !== undefined && !o.day && !o.month && !o.year)))
  @IsDate({message: 'ERRORS.QUERY_MANAGEMENT.VALID_DATE_BLANK'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_FUTURE_DATE'})
    date?: Date;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_DAY'})
  @Max(31, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_DAY'})
    day?: number;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.QUERY_MANAGEMENT.VALID_MONTH'})
    month?: number;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(new Date().getFullYear(), {message: 'ERRORS.QUERY_MANAGEMENT.VALID_YEAR'})
    year?: number;

  constructor(year?: string, month?: string, day?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
