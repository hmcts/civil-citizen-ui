import { PostcodeValidator } from 'common/form/validators/postcodeValidator';
import * as osService from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import { AddressInfoResponse } from 'common/models/ordanceSurveyKey/ordanceSurveyKey';

describe('PostcodeValidator', () => {
  let validator: PostcodeValidator;

  beforeEach(() => {
    validator = new PostcodeValidator();
    jest.resetAllMocks();
  });

  it('should return false for empty or whitespace postcode', async () => {
    expect(await validator.validate('')).toBe(false);
    expect(await validator.validate('   ')).toBe(false);
  });

  it('should return false for postcode longer than 8 characters', async () => {
    const longPostcode = 'SW1A 1AA9'; // 9 chars
    expect(await validator.validate(longPostcode)).toBe(false);
    expect(validator.lengthError).toBe(true);
    expect(validator.defaultMessage()).toBe('ERRORS.TEXT_TOO_MANY');
  });

  it('should return false for postcode with invalid format', async () => {
    const invalidPostcode = 'INVALID';
    expect(await validator.validate(invalidPostcode)).toBe(false);
    expect(validator.lengthError).toBe(false);
    expect(validator.defaultMessage()).toBe('ERRORS.DEFENDANT_POSTCODE_NOT_VALID');
  });

  it('should return false if postcode validation API fails', async () => {
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockRejectedValue(new Error('API error'));

    const result = await validator.validate('SW1A 1AA');
    expect(result).toBe(false);
  });

  it('should return false if postcode validation API says postcode is invalid', async () => {
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockResolvedValue(
      new AddressInfoResponse([], false),
    );

    expect(await validator.validate('SW1A 1AA')).toBe(false);
  });

  it('should return true for valid postcode from postcode validation API', async () => {
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockResolvedValue(
      new AddressInfoResponse([], true),
    );

    expect(await validator.validate('SW1A 1AA')).toBe(true);
    expect(validator.lengthError).toBe(false);
  });
});
