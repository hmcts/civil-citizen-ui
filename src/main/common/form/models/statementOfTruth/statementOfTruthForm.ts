import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {SignatureType} from 'models/signatureType';

export class StatementOfTruthForm {
  type: SignatureType;
  isFullAmountRejected: boolean;

  @IsNotEmpty({message: 'ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'})
    signed?: boolean;

  @ValidateIf(o => o.isFullAmountRejected === true)
  @IsNotEmpty({message: 'ERRORS.DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE'})
  @IsDefined({message: 'ERRORS.DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE'})
    directionsQuestionnaireSigned?: boolean;

  constructor(isFullAmountRejected?: boolean, type?: SignatureType, signed?: boolean, directionsQuestionnaireSigned?: boolean) {
    this.isFullAmountRejected = isFullAmountRejected;
    this.type = type || SignatureType.BASIC;
    this.signed = signed;
    this.directionsQuestionnaireSigned = directionsQuestionnaireSigned;
  }
}
