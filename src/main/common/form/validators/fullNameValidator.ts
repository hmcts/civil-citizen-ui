import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';

/**
 * Validates that the combined inputs length for the name (title, firstName and lastName) is <= 70
 */
@ValidatorConstraint({name: 'fullNameValidator', async: true})
export class FullNameValidator implements ValidatorConstraintInterface {
  errorMessage: string[] = [];

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }

  async validate(fieldText: string, validationArguments?: ValidationArguments) {
    if (!await this.getJudgmentOnlineFlag()) { // Do not validate in case isJudgmentOnlineLive flag is off
      return true;
    }

    if (validationArguments.constraints && validationArguments.constraints.length > 0) {
      const property = validationArguments.constraints[0];
      this.errorMessage.push(validationArguments.constraints[1]);
      const value = (validationArguments.object as never)[property];
      return value <= 70;
    }
    return true;
  }

  defaultMessage() {
    return this.errorMessage.pop();
  }
}
