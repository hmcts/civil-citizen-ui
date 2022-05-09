import { IsDefined, MaxLength, ValidateIf, IsNotEmpty } from 'class-validator';
import { TEXT_TOO_MANY, PHONE_NUMBER_REQUIRED, NAME_REQUIRED, VALID_YES_NO_OPTION } from '../../validationErrors/errorMessageConstants';
import { YesNo } from '../yesNo';

export class CompanyTelephoneNumber  {

  @IsDefined({ message: VALID_YES_NO_OPTION })
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsDefined({ message: PHONE_NUMBER_REQUIRED })
  @IsNotEmpty({ message: PHONE_NUMBER_REQUIRED })
  @MaxLength(30, { message: TEXT_TOO_MANY })
    mediationPhoneNumberConfirmation?: string;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsDefined({ message: NAME_REQUIRED })
  @IsNotEmpty({ message: NAME_REQUIRED })
  @MaxLength(30, { message: TEXT_TOO_MANY })
    mediationContactPerson?: string;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsDefined({ message: PHONE_NUMBER_REQUIRED })
  @IsNotEmpty({ message: PHONE_NUMBER_REQUIRED })
  @MaxLength(30, { message: TEXT_TOO_MANY })
    mediationPhoneNumber?: string;

  constructor(option?: YesNo, mediationPhoneNumber?: string, mediationContactPerson?: string, mediationPhoneNumberConfirmation?: string) {

    this.option = option;
    this.mediationPhoneNumber = mediationPhoneNumber;
    this.mediationContactPerson = mediationContactPerson;
    this.mediationPhoneNumberConfirmation = mediationPhoneNumberConfirmation;
  }
}
