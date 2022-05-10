import {IsNotEmpty, MaxLength} from 'class-validator';
import {StatementOfTruth} from '../../../../common/form/models/statementOfTruth/statementOfTruth';
import {SignatureType} from '../../../models/signatureType';
import {
  SIGNER_NAME_REQUIRED,
  SIGNER_NAME_TOO_LONG,
  SIGNER_ROLE_REQUIRED,
  SIGNER_ROLE_TOO_LONG,
} from '../../../../common/form/validationErrors/errorMessageConstants';
import {
  SIGNER_NAME_MAX_LENGTH,
  SIGNER_ROLE_MAX_LENGTH,
} from '../../../../common/form/validators/validationConstraints';

export class QualifiedStatementOfTruth extends StatementOfTruth {

  @MaxLength(SIGNER_NAME_MAX_LENGTH, { message: SIGNER_NAME_TOO_LONG })
  @IsNotEmpty({ message: SIGNER_NAME_REQUIRED })
    signerName?: string;

  @MaxLength(SIGNER_ROLE_MAX_LENGTH, { message: SIGNER_ROLE_TOO_LONG })
  @IsNotEmpty({ message: SIGNER_ROLE_REQUIRED })
    signerRole?: string;

  constructor (signed?: boolean, directionsQuestionnaireSigned?: boolean, signerName?: string, signerRole?: string) {
    super(SignatureType.QUALIFIED, signed, directionsQuestionnaireSigned);
    this.signerName = signerName;
    this.signerRole = signerRole;
  }
}
