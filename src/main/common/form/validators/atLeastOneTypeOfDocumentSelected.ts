import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';

@ValidatorConstraint({name: 'customAtLeastOneTypeOfDocumentValidator', async: false})
export class AtLeastOneTypeOfDocumentSelected implements ValidatorConstraintInterface {

  validate(value: TypeOfDocumentsItemForm[] ) {
    return value.some(item=>item.checked);
  }

  defaultMessage() {
    return 'ERRORS.VALID_ENTER_AT_LEAST_ONE_UPLOAD';
  }
}
