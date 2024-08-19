import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';

/**
 * Validates that the input value does not contain special characters ˆ ` ´ ¨
 */
@ValidatorConstraint({name: 'specialCharValidator', async: true})
export class SpecialCharValidator implements ValidatorConstraintInterface {

  readonly SPECIAL_CHARS = /[ˆ`´¨]/;

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }

  async validate(text: string) {
    if (!text) {
      return true;
    }
    if (!await this.getJudgmentOnlineFlag()) { // Do not validate in case isJudgmentOnlineLive flag is off
      return true;
    }
    return !(this.SPECIAL_CHARS.test(text));
  }

  defaultMessage() {
    return 'ERRORS.SPECIAL_CHARACTERS';
  }
}

