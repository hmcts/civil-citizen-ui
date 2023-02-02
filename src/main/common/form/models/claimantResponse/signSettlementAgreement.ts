import { IsDefined, IsNotEmpty } from 'class-validator';

export class SignSettlmentAgreement {
  @IsDefined({message: 'ERRORS.CLAIMANT_ACCEPT_TERMS_OF_THE_AGREEMENT'})
  @IsNotEmpty({message: 'ERRORS.CLAIMANT_ACCEPT_TERMS_OF_THE_AGREEMENT'})
    signed?: string;

  constructor(signed?: string) {
    this.signed = signed;
  }
}
