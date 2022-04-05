import {IsDefined, IsNotEmpty} from 'class-validator';
import {DETAILS_REQUIRED} from '../../../../form/validationErrors/errorMessageConstants';

export class OtherDetails {

  @IsDefined({message: DETAILS_REQUIRED})
  @IsNotEmpty({message: DETAILS_REQUIRED})
    details: string;

  constructor(details?: string) {
    this.details = details;
  }
}
