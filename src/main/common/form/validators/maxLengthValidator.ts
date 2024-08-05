import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';

/**
 * Validates that the input value does not contain special characters ˆ ` ´ ¨
 */
@ValidatorConstraint({name: 'maxLengthValidator', async: false})
export class MaxLengthValidator implements ValidatorConstraintInterface {

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }
  async validate(text: string) {
    if (!text) {
      return true;
    }
    if (await this.getJudgmentOnlineFlag()) {
      console.log('TRUE');
    } else {console.log('FALSE');}
    return false; // Add max length check here ADDRESS_LINE_MAX_LENGTH_JO : ADDRESS_LINE_MAX_LENGTH
  }
  // ERRORS.TOWN_CITY_TOO_MANY error for city
  defaultMessage() {
    return 'ERRORS.ADDRESS_LINE_TOO_MANY';
  }
}
