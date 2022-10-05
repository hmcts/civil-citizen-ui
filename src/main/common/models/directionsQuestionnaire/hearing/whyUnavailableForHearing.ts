import {IsDefined, IsNotEmpty} from 'class-validator';

export class WhyUnavailableForHearing {
  @IsDefined({message: 'ERRORS.TELL_US_WHY_UNAVAILABLE'})
  @IsNotEmpty({message: 'ERRORS.TELL_US_WHY_UNAVAILABLE'})
    reason?: string;

  constructor(reason?: string) {
    this.reason = reason;
  }
}
