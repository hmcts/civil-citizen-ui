import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {TypeOfDocumentsItems} from 'form/models/caseProgression/typeOfDocuments';

@ValidatorConstraint({ name: 'typeofDocumentAtLeastOneUploadValidator', async: false })
export class typeOfDocumentsUpload implements ValidatorConstraintInterface {

  validate(value: TypeOfDocumentsItems[]) {
    let hasAtLeastOneDocumentUploaded = false;
    value.forEach((typeOfDocumentsItems: TypeOfDocumentsItems) => {
      if (typeOfDocumentsItems.value !== '' ) {
        hasAtLeastOneDocumentUploaded = true;
      }
    });
    return hasAtLeastOneDocumentUploaded;
  }

 /* constructor(ValidatorConstraint?: boolean) {
    this.dateOfBirth = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }*/

  defaultMessage() {
    return 'ERRORS.VALID_ENTER_AT_LEAST_ONE_UPLOAD';
  }
}
