import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { AddressInfoResponse } from 'common/models/ordanceSurveyKey/ordanceSurveyKey';
import { lookupByPostcodeAndDataSet } from 'modules/ordance-survey-key/ordanceSurveyKeyService';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PostcodeValidator');

@ValidatorConstraint({ name: 'PostcodeValidator', async: true })
export class PostcodeValidator implements ValidatorConstraintInterface {
  lengthError = false;

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

    try {
      // Lookup postcode using Ordnance Survey
      const response: AddressInfoResponse = await lookupByPostcodeAndDataSet(trimmed);

      if (!response.valid || response.addresses.length === 0) {
        return false;
      }

      // Check country
      const country = response.addresses[0].country;
      if (country) {
        return country === 'England' || country === 'Wales';
      }
    } catch (err) {
      logger.info('Failed to fetch postcode info', trimmed, err);
      return false;
    }
    return false;
  }

  defaultMessage(): string {
    return this.lengthError
      ? 'ERRORS.TEXT_TOO_MANY'
      : 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID';
  }
}