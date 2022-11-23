import {Validate} from 'class-validator';
import {ClaimReferenceValidator} from 'common/form/validators/claimReferenceValidator';

export class ClaimReference {
  @Validate(ClaimReferenceValidator)
    claimReferenceValue?: string;

  constructor(claimReferenceValue?: string) {
    this.claimReferenceValue = claimReferenceValue;
  }
}
