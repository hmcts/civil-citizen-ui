import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {ADDRESS_LINE_MAX_LENGTH, ADDRESS_LINE_MAX_LENGTH_JO} from 'form/validators/validationConstraints';

/**
 * Validates the input max length
 */
@ValidatorConstraint({name: 'maxLengthValidator', async: false})
export class MaxLengthValidator implements ValidatorConstraintInterface {

  ADDRESS_MAX_LENGTH: number;
  errorMessage: string;

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }
  async validate(text: string, validationArguments?: ValidationArguments) {
    if (!text) {
      return true;
    }

    if (validationArguments.constraints && validationArguments.constraints.length > 0) {
      this.errorMessage = validationArguments.constraints[1];
    }

    if (await this.getJudgmentOnlineFlag()) {
      this.ADDRESS_MAX_LENGTH = ADDRESS_LINE_MAX_LENGTH_JO;
    } else {
      this.ADDRESS_MAX_LENGTH = ADDRESS_LINE_MAX_LENGTH;
    }
    return text.length <= this.ADDRESS_MAX_LENGTH;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
