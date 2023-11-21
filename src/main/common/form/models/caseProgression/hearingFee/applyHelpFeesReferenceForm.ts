import {
  IsDefined,
  IsNotEmpty,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {YesNo} from 'common/form/models/yesNo';

@ValidatorConstraint({name: 'referenceNumberSize', async: false})
export class ReferenceNumberValidator implements ValidatorConstraintInterface {

  validate(value: string) {
    return value.length === 11;
  }
}

export class ApplyHelpFeesReferenceForm {

  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION_UPPER'})
    option: string;
  @ValidateIf(o =>  o.isReferenceRequired())
  @IsDefined({message: 'ERRORS.VALID_ENTER_REFERENCE_NUMBER'})
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_REFERENCE_NUMBER'})
  @Validate(ReferenceNumberValidator, {message: 'ERRORS.VALID_ENTER_REFERENCE_NUMBER'})
    referenceNumber: string;

  constructor(option?: string, referenceNumber?: string) {
    this.option = option;
    if(this.isReferenceRequired()){
      this.referenceNumber = referenceNumber;
    }else{
      this.referenceNumber = undefined;
    }
  }

  isReferenceRequired(){
    return this.option === YesNo.YES;
  }
}

