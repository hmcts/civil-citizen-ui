import { PostcodeValidator } from 'common/form/validators/postcodeValidator';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as osService from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import { AddressInfoResponse } from 'common/models/ordanceSurveyKey/ordanceSurveyKey';

describe('PostcodeValidator', () => {
  let validator: PostcodeValidator;

  beforeEach(() => {
    validator = new PostcodeValidator();
    jest.resetAllMocks();
  });

  it('should return false for empty postcode', async () => {
    const result = await validator.validate('');
    expect(result).toBe(false);
  });

  it('should respect length check when flag is ON', async () => {
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);

    const tooLongPostcode = 'SW1A 1AABC'; // >8 chars
    const result = await validator.validate(tooLongPostcode);

    expect(result).toBe(false);
    expect(validator.lengthError).toBe(true);
    expect(validator.defaultMessage()).toBe('ERRORS.TEXT_TOO_MANY');
  });

  it('should pass length check if flag is ON and postcode ≤ 8 chars', async () => {
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);

    // Mock OS API response
    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockResolvedValue(
      new AddressInfoResponse(
        [{ country: 'England', addresses: [] } as any],
        true
      )
    );

    const result = await validator.validate('SW1A 1AA'); // 7 chars
    expect(result).toBe(true);
    expect(validator.lengthError).toBe(false);
  });

  it('should return false if postcode is invalid or OS lookup fails', async () => {
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);

    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockRejectedValue(new Error('API error'));

    const result = await validator.validate('INVALID');
    expect(result).toBe(false);
  });

  it('should return true for valid postcode in England', async () => {
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);

    jest.spyOn(osService, 'lookupByPostcodeAndDataSet').mockResolvedValue(
      new AddressInfoResponse(
        [
          {
            uprn: '1',
            organisationName: 'Org',
            postTown: 'London',
            postcode: 'SW1A 1AA',
            postcodeType: 'S',
            formattedAddress: 'Street, London, SW1A 1AA',
            point: { type: 'Point', coordinates: [0, 0] },
            country: 'England',
          } as any,
        ],
        true
      )
    );

    const result = await validator.validate('SW1A 1AA');
    expect(result).toBe(true);
    expect(validator.defaultMessage()).toBe('ERRORS.DEFENDANT_POSTCODE_NOT_VALID');
  });

  it('should return false for valid postcode but country is Scotland', async () => {
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);

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
        true
      )
    );

    const result = await validator.validate('EH1 1AA');
    expect(result).toBe(false);
  });
});