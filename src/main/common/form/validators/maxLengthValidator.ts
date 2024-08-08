import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {ADDRESS_LINE_MAX_LENGTH_JO} from 'form/validators/validationConstraints';

/**
 * Validates the input max length
 */
@ValidatorConstraint({name: 'maxLengthValidator', async: true})
export class MaxLengthValidator implements ValidatorConstraintInterface {

  ADDRESS_MAX_LENGTH: number;
  errorMessage: string;

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }

  async validate(text: string, validationArguments?: ValidationArguments) {
    if (!text || !await this.getJudgmentOnlineFlag()) { // Do not validate in case isJudgmentOnlineLive flag is off
      return true;
    }

    if (validationArguments.constraints && validationArguments.constraints.length > 0) {
      this.errorMessage = validationArguments.constraints[1];
    }
    return text.length <= ADDRESS_LINE_MAX_LENGTH_JO;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
