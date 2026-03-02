import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { isJudgmentOnlineLive } from '../../../app/auth/launchdarkly/launchDarklyClient';
import { AddressInfoResponse } from 'common/models/ordanceSurveyKey/ordanceSurveyKey';
import { lookupByPostcodeAndDataSet } from 'modules/ordance-survey-key/ordanceSurveyKeyService';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('app');

@ValidatorConstraint({ name: 'PostcodeValidator', async: true })
export class PostcodeValidator implements ValidatorConstraintInterface {
  lengthError = false;

  private async getJudgmentOnlineFlag(): Promise<boolean> {
    return await isJudgmentOnlineLive();
  }

  async validate(value: string): Promise<boolean> {
    if (!value || value.trim().length === 0) {
      return false;
    }

    // Trim value for consistency
    const trimmed = value.trim();

    // Check length if JudgmentOnlineLive flag is on
    if (await this.getJudgmentOnlineFlag()) {
      if (trimmed.length > 8) {
        this.lengthError = true;
        return false;
      }
    }
    this.lengthError = false;

    try {
      // Lookup postcode using Ordnance Survey
      const response: AddressInfoResponse = await lookupByPostcodeAndDataSet(trimmed);

      if (!response.valid || response.addresses.length === 0) {
        return false;
      }

      // Check country
      const country = response.addresses[0].country;
      return country === 'England' || country === 'Wales';
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