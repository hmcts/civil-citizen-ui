import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { AddressInfoResponse } from 'common/models/ordanceSurveyKey/ordanceSurveyKey';
import { lookupByPostcodeAndDataSet } from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PostcodeValidator');

const normalisePostcode = (postcode: string): string => postcode.replace(/\s/g, '').toUpperCase();
const postcodeExceptionsConfigPath = path.resolve(process.cwd(), 'config', 'postcode-lookup-exceptions.json');

type PostcodeExceptionsConfig = {
  englandAndWalesPostcodeExceptions?: string[];
};

const getPostcodeExceptionsFromFile = (): string[] => {
  if (!existsSync(postcodeExceptionsConfigPath)) {
    return [];
  }

  try {
    const postcodeExceptionsConfig = JSON.parse(readFileSync(postcodeExceptionsConfigPath, 'utf-8')) as PostcodeExceptionsConfig;
    return postcodeExceptionsConfig.englandAndWalesPostcodeExceptions ?? [];
  } catch (err) {
    logger.warn('Failed to load postcode exceptions config', err);
    return [];
  }
};

const postcodeExceptionsFromFile = getPostcodeExceptionsFromFile();

export const isPostcodeOnExceptionList = (postcode: string): boolean => {
  return postcodeExceptionsFromFile
    .map((exceptionPostcode: string) => normalisePostcode(exceptionPostcode))
    .includes(normalisePostcode(postcode));
};

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
    const normalised = normalisePostcode(trimmed);

    // Validate UK postcode format
    if (!this.UK_POSTCODE_REGEX.test(normalised)) {
      return false;
    }

    if (isPostcodeOnExceptionList(trimmed)) {
      return true;
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
