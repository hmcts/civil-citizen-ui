import { IsDefined, MaxLength, ValidateIf, IsNotEmpty } from 'class-validator';
import { YesNo } from '../yesNo';

export class CompanyTelephoneNumber  {
  @IsDefined({ message: 'ERRORS.VALID_YES_NO_OPTION' })
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsDefined({ message: 'ERRORS.PHONE_NUMBER_REQUIRED' })
  @IsNotEmpty({ message: 'ERRORS.PHONE_NUMBER_REQUIRED' })
  @MaxLength(30, { message: 'ERRORS.TEXT_TOO_MANY' })
    mediationPhoneNumberConfirmation?: string;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsDefined({ message: 'ERRORS.NAME_REQUIRED' })
  @IsNotEmpty({ message: 'ERRORS.NAME_REQUIRED' })
  @MaxLength(30, { message: 'ERRORS.TEXT_TOO_MANY' })
    mediationContactPerson?: string;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsDefined({ message: 'ERRORS.PHONE_NUMBER_REQUIRED' })
  @IsNotEmpty({ message: 'ERRORS.PHONE_NUMBER_REQUIRED' })
  @MaxLength(30, { message: 'ERRORS.TEXT_TOO_MANY' })
    mediationPhoneNumber?: string;

  constructor(option?: YesNo, mediationPhoneNumber?: string, mediationContactPerson?: string, mediationPhoneNumberConfirmation?: string) {
    this.option = option;
    this.mediationPhoneNumber = mediationPhoneNumber;
    this.mediationContactPerson = mediationContactPerson;
    this.mediationPhoneNumberConfirmation = mediationPhoneNumberConfirmation;
  }
}
