import {Equals, IsDefined, ValidateIf} from 'class-validator';
import {
  DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE,
  STATEMENT_OF_TRUTH_REQUIRED_MESSAGE,
} from '../../../../common/form/validationErrors/errorMessageConstants';
import {SignatureType} from '../../../models/signatureType';

export class StatementOfTruth {
  type: SignatureType;

  @IsDefined({message: STATEMENT_OF_TRUTH_REQUIRED_MESSAGE})
  @Equals(true, {message: STATEMENT_OF_TRUTH_REQUIRED_MESSAGE})
    signed?: boolean;

  @ValidateIf(o => o.type === SignatureType.DIRECTION_QUESTIONNAIRE)
  @IsDefined({message: DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE})
  @Equals(true, {message: DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE})
    directionsQuestionnaireSigned?: boolean;

  constructor(type?: SignatureType, signed?: boolean, directionsQuestionnaireSigned?: boolean) {
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
