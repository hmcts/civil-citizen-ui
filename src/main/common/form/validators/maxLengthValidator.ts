import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {ADDRESS_LINE_MAX_LENGTH, ADDRESS_LINE_MAX_LENGTH_JO} from 'form/validators/validationConstraints';

/**
 * Validates the address and city fields inputs max length
 */
@ValidatorConstraint({name: 'maxLengthValidator', async: true})
export class MaxLengthValidator implements ValidatorConstraintInterface {
  errorMessage: string[] = [];
  isJudgmentOnlineLiveFlagOff: boolean;
  ADDRESS_LINE_MAX_LENGTH_ACTUAL: number;

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }

  async validate(text: string, validationArguments?: ValidationArguments) {
    if (!text) {
      return true;
    }
    this.isJudgmentOnlineLiveFlagOff = !await this.getJudgmentOnlineFlag(); // Old validation in case isJudgmentOnlineLive flag is off
    const textLength = text.trim().length;
    this.ADDRESS_LINE_MAX_LENGTH_ACTUAL = this.isJudgmentOnlineLiveFlagOff ? ADDRESS_LINE_MAX_LENGTH : ADDRESS_LINE_MAX_LENGTH_JO;

    if (!this.isJudgmentOnlineLiveFlagOff && validationArguments.property == 'addressLine1'
      && textLength > this.ADDRESS_LINE_MAX_LENGTH_ACTUAL) {
      this.errorMessage.push('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      return false;
    } else if ((validationArguments.property == 'addressLine2' || validationArguments.property == 'addressLine3')
      && textLength > this.ADDRESS_LINE_MAX_LENGTH_ACTUAL) {
      this.errorMessage.push(this.isJudgmentOnlineLiveFlagOff ? 'ERRORS.ADDRESS_LINE_TOO_MANY' : 'ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      return false;
    } else if (validationArguments.property == 'city' && textLength > this.ADDRESS_LINE_MAX_LENGTH_ACTUAL) {
      this.errorMessage.push(this.isJudgmentOnlineLiveFlagOff ? 'ERRORS.TOWN_CITY_TOO_MANY' : 'ERRORS.TOWN_CITY_TOO_MANY_JO');
      return false;
    } else {
      return true;
    }
  }

  defaultMessage() {
    return this.errorMessage.shift();
  }
}
