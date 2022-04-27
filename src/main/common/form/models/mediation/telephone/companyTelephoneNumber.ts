import { IsDefined, MaxLength, ValidateIf } from 'class-validator'
import { TEXT_TOO_LONG, PHONE_NUMBER_REQUIRED, NAME_REQUIRED, VALID_YES_NO_OPTION } from '../../../validationErrors/errorMessageConstants';
import { YesNo } from '../../yesNo';

export class CompanyTelephoneNumber  {

  @IsDefined({ message: VALID_YES_NO_OPTION })
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsDefined({ message: PHONE_NUMBER_REQUIRED })
  // @IsNotEmpty()({ message: ValidationErrors.NUMBER_REQUIRED })
  @MaxLength(30, { message: TEXT_TOO_LONG })
    mediationPhoneNumberConfirmation?: string;
  
  @ValidateIf(o => o.option === YesNo.NO)
  @IsDefined({ message: NAME_REQUIRED })
  // @IsNotBlank({ message: ValidationErrors.NAME_REQUIRED })
  @MaxLength(30, { message: TEXT_TOO_LONG })
    mediationContactPerson?: string;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsDefined({ message: PHONE_NUMBER_REQUIRED })
  // @IsNotBlank({ message: ValidationErrors.NUMBER_REQUIRED })
  @MaxLength(30, { message: TEXT_TOO_LONG })
    mediationPhoneNumber?: string;

  constructor (option?: YesNo, mediationPhoneNumber?: string, mediationContactName?: string, mediationPhoneNumberConfirmation?: string) {
    
    this.option = option;
    this.mediationPhoneNumber = mediationPhoneNumber;
    this.mediationContactPerson = mediationContactName;
    this.mediationPhoneNumberConfirmation = mediationPhoneNumberConfirmation;
  }

  static fromObject(value?: any): CompanyTelephoneNumber {
    if (value == null) {
      return value;
    }

    return new CompanyTelephoneNumber(value.option, value.mediationPhoneNumber, value.mediationContactPerson, value.mediationPhoneNumberConfirmation)
  }

  isCompleted (): boolean {
    return !!this.option && ((!!this.mediationPhoneNumber && !!this.mediationContactPerson) || !!this.mediationPhoneNumberConfirmation)
  }
}
