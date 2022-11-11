import {IsNotEmpty} from 'class-validator';

export class RejectionReason {
  @IsNotEmpty({message: 'ERRORS.CLAIMANT_REJECTION_RESPONSE_REQUIRED'})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
