import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';

/**
 * Validates that the combined inputs length for the name (title, firstName and lastName) is <= 70
 */
@ValidatorConstraint({name: 'fullNameValidator', async: true})
export class FullNameValidator implements ValidatorConstraintInterface {
  errorMessage: string[] = [];
  isJudgmentOnlineLiveFlagOff: boolean;

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }

  async validate(text: string, validationArguments?: ValidationArguments) {
    if (text) {
      if (validationArguments.property == 'title' && text.trim().length > 35) { // Always validate this
        this.errorMessage.push('ERRORS.ENTER_VALID_TITLE');
        return false;
      }

      if (!await this.getJudgmentOnlineFlag()) { // Old validation, in case isJudgmentOnlineLive flag is off
        this.isJudgmentOnlineLiveFlagOff = true;
        if ((validationArguments.property == 'firstName' || validationArguments.property == 'lastName')
        && text.length > 255) {
          this.errorMessage.push('ERRORS.TEXT_TOO_MANY');
          return false;
        }
        return true;
      }

      this.isJudgmentOnlineLiveFlagOff = false; // New validation, in case isJudgmentOnlineLive flag is on
      if (validationArguments.constraints && text.length > 0) {
        const property = validationArguments.constraints[0];
        const value = (validationArguments.object as never)[property];
        if (value > 70) {
          this.errorMessage.push(validationArguments.constraints[1]);
          return false;
        }
      }
    }
    return true;
  }

  defaultMessage() {
    if (this.isJudgmentOnlineLiveFlagOff) {
      return this.errorMessage.shift();
    } else {
      return this.errorMessage.pop();
    }
  }
}
