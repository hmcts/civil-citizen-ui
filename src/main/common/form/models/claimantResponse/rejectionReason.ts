import {IsNotEmpty} from 'class-validator';
import {CLAIMANT_REJECTION_RESPONSE_REQUIRED} from '../../../form/validationErrors/errorMessageConstants';

export class RejectionReason {
  @IsNotEmpty({message: CLAIMANT_REJECTION_RESPONSE_REQUIRED})
    text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}
