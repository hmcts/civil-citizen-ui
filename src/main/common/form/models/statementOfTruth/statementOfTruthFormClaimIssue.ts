import {IsNotEmpty} from 'class-validator';
import {SignatureType} from 'models/signatureType';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';

export class StatementOfTruthFormClaimIssue extends StatementOfTruthForm{

  @IsNotEmpty({message: 'ERRORS.SIGNER_ROLE_REQUIRED'})
    immutable?: boolean;

  constructor(isFullAmountRejected: boolean, type?: SignatureType, signed?: boolean, directionsQuestionnaireSigned?: boolean, immutable?: boolean) {
    super(isFullAmountRejected, type, signed, directionsQuestionnaireSigned);
    this.immutable = immutable;
  }
}
