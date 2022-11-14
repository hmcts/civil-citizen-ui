import {IsDefined, IsNotEmpty} from 'class-validator';

export class OtherDetails {
  @IsDefined({message: 'ERRORS.DETAILS_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DETAILS_REQUIRED'})
    details: string;

  constructor(details?: string) {
    this.details = details;
  }
}
