import {IsOptional, Matches, MaxLength} from 'class-validator';

export const CANCEL_UNISSUED_CLAIM_REASON_MAX_LENGTH = 200;

const ALLOWED_CHARACTERS = /^[A-Za-z0-9 \t\r\n.,!?'"()&:;@#/$%+=£‘’“”–—…-]*$/;

export class CancelUnissuedClaimReason {

  @IsOptional()
  @Matches(ALLOWED_CHARACTERS, {message: 'ERRORS.CANCEL_UNISSUED_CLAIM_REASON_INVALID_CHARACTERS'})
  @MaxLength(CANCEL_UNISSUED_CLAIM_REASON_MAX_LENGTH, {message: 'ERRORS.CANCEL_UNISSUED_CLAIM_REASON_TOO_LONG'})
    cancelReason?: string;

  constructor(cancelReason?: string) {
    this.cancelReason = cancelReason;
  }
}
