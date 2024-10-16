import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {isJudgmentOnlineLive} from '../../../app/auth/launchdarkly/launchDarklyClient';

/**
 * Validates that the input value is in correct post code format
 */
@ValidatorConstraint({name: 'customInt', async: true})
export class PostcodeValidator implements ValidatorConstraintInterface {

  readonly UK_POSTCODE_REGEX = /^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))[0-9][A-Za-z]{2}))$/; // NOSONAR
  readonly START_CODE_REGEX = /^(.*?)[0-9]{1,2}/;

  lengthError: boolean;

  async getJudgmentOnlineFlag() {
    return await isJudgmentOnlineLive();
  }

  async validate(value: string) {
    const ukPostCodePattern = this.UK_POSTCODE_REGEX;
    const normalised = value?.toString().replace(/\s/g, '').toUpperCase();
    if (!value) {
      return true;
    }

    if (await this.getJudgmentOnlineFlag()) { // Validate length only if isJudgmentOnlineLive flag is on
      if (value.trim().length > 8) {
        this.lengthError = true;
        return false;
      }
    }
    this.lengthError = false;

    const isValidFormat = ukPostCodePattern.test(normalised);
    if (!isValidFormat) {
      return false;
    }
    const scotlandPrefixes: string[] = ['KW', 'IV', 'HS', 'PH', 'AB', 'DD', 'KY', 'FK', 'EH', 'G', 'KA', 'ML', 'PA', 'TD', 'DG', 'ZE'];
    const scotRegexp = new RegExp(this.START_CODE_REGEX);
    const matches = scotRegexp.exec(normalised);
    const isScotlandPostcode: boolean = scotlandPrefixes.includes(matches[1]);
    const isNIPostcode: boolean = normalised.startsWith('BT');
    return !isScotlandPostcode && !isNIPostcode;
  }

  defaultMessage() {
    return !this.lengthError ? 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID' : 'ERRORS.TEXT_TOO_MANY';
  }
}

