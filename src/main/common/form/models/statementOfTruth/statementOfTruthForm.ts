import {Equals, IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {
  DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE,
  STATEMENT_OF_TRUTH_REQUIRED_MESSAGE,
} from '../../../../common/form/validationErrors/errorMessageConstants';
import {SignatureType} from '../../../models/signatureType';

export class StatementOfTruthForm {
  type: SignatureType;

  @IsDefined({message: STATEMENT_OF_TRUTH_REQUIRED_MESSAGE})
  @IsNotEmpty({message: STATEMENT_OF_TRUTH_REQUIRED_MESSAGE})
    signed?: string;

  @ValidateIf(o => o.type === SignatureType.DIRECTION_QUESTIONNAIRE)
  @IsDefined({message: DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE})
  @Equals(true, {message: DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE})
    directionsQuestionnaireSigned?: boolean;

  constructor(type?: SignatureType, signed?: string, directionsQuestionnaireSigned?: boolean) {
    if (type) {
      this.type = type;
    } else {
      this.type = SignatureType.BASIC;
    }
    this.signed = signed;
    if (directionsQuestionnaireSigned) {
      this.directionsQuestionnaireSigned = directionsQuestionnaireSigned;
    }
  }
}
