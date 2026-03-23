import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { AddressInfoResponse } from 'common/models/ordanceSurveyKey/ordanceSurveyKey';
import { lookupByPostcodeAndDataSet } from 'modules/ordance-survey-key/ordanceSurveyKeyService';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PostcodeValidator');

@ValidatorConstraint({ name: 'PostcodeValidator', async: true })
export class PostcodeValidator implements ValidatorConstraintInterface {
  lengthError = false;

  private readonly UK_POSTCODE_REGEX =
    /^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))[0-9][A-Za-z]{2}))$/;

  async validate(value: string): Promise<boolean> {
    if (!value || value.trim().length === 0) {
      return false;
    }

    // Trim value for consistency
    const trimmed = value.trim();

    this.lengthError = false;
    // Check length after JudgmentOnlineLive release
    if (trimmed.length > 8) {
      this.lengthError = true;
      return false;
    }

    // Normalize postcode for regex (remove spaces, uppercase)
    const normalised = trimmed.replace(/\s/g, '').toUpperCase();

    // Validate UK postcode format
    if (!this.UK_POSTCODE_REGEX.test(normalised)) {
      return false;
    }

    try {
      // Lookup postcode using Ordnance Survey
      const response: AddressInfoResponse = await lookupByPostcodeAndDataSet(trimmed);

      if (!response.valid) {
        return false;
      }
      return true;
    } catch (err) {
      logger.info('Failed to fetch postcode info', trimmed, err);
      return false;
    }
  }

  defaultMessage(): string {
    return this.lengthError
      ? 'ERRORS.TEXT_TOO_MANY'
      : 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID';
  }
}
