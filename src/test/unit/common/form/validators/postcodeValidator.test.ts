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

  it('should return false if Ordnance Survey lookup fails', async () => {
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockRejectedValue(new Error('API error'));

    const result = await validator.validate('SW1A 1AA');
    expect(result).toBe(false);
  });

  it('should return false if Ordnance Survey says postcode is invalid or no addresses', async () => {
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockResolvedValue(
      new AddressInfoResponse([], false),
    );

    expect(await validator.validate('SW1A 1AA')).toBe(false);
  });

  it('should return true for valid UK postcode in England or Wales', async () => {
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockResolvedValue(
      new AddressInfoResponse(
        [
          {
            uprn: '1',
            postTown: 'London',
            postcode: 'SW1A 1AA',
            formattedAddress: 'Street, London, SW1A 1AA',
            point: { type: 'Point', coordinates: [0, 0] },
            country: 'England',
          } as any,
        ],
        true,
      ),
    );

    expect(await validator.validate('SW1A 1AA')).toBe(true);
    expect(validator.lengthError).toBe(false);
  });

  it('should return false for valid postcode but country not England or Wales', async () => {
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockResolvedValue(
      new AddressInfoResponse(
        [
          {
            uprn: '2',
            postTown: 'Edinburgh',
            postcode: 'EH1 1AA',
            formattedAddress: 'Street, Edinburgh, EH1 1AA',
            point: { type: 'Point', coordinates: [0, 0] },
            country: 'Scotland',
          } as any,
        ],
        true,
      ),
    );

    expect(await validator.validate('EH1 1AA')).toBe(false);
  });
});