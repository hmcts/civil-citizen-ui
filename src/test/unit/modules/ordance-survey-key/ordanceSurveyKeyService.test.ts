import config from 'config';
import axios from 'axios';
import {
  lookupAddressesByPostcodeAndDataSet,
  lookupByPostcodeAndDataSet,
} from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import {
  MOCK_API_ADDRESS,
  MOCK_API_RESPONSE,
  MOCK_POSTCODE_INVALIDATE_RESPONSE,
  MOCK_POSTCODE_VALIDATE_ADDRESS_RESPONSE,
  MOCK_POSTCODE_VALIDATE_RESPONSE,
} from '../../../utils/mocks/ordanceSurvey/osMocks';
import { AssertionError } from 'assert';

jest.mock('axios');
jest.mock('config', () => ({
  get: jest.fn(),
}));

describe('lookupByPostcodeAndDataSet', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call postcodes.io validate API and return valid response', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: MOCK_POSTCODE_VALIDATE_RESPONSE });

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.postcodes.io/postcodes/SW1A%201AA/validate',
    );
    expect(result).toEqual(MOCK_POSTCODE_VALIDATE_ADDRESS_RESPONSE);
  });

  it('should throw AssertionError if postcodes.io says postcode is invalid', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: MOCK_POSTCODE_INVALIDATE_RESPONSE });

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toThrowError(AssertionError);
  });
});

describe('lookupAddressesByPostcodeAndDataSet', () => {
  const mockApiKey = 'mock-api-key';
  const mockApiUrl = 'mock-api-url';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call OS API with correct URL and return mapped AddressInfoResponse', async () => {
    // Mock config values
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    // Mock axios.get to return the fake OS API response
    (axios.get as jest.Mock).mockResolvedValue({ data: { results: MOCK_API_RESPONSE } });

    const result = await lookupAddressesByPostcodeAndDataSet('SW1A 1AA');

    expect(axios.get).toHaveBeenCalledWith(
      `${mockApiUrl}/search/places/v1/postcode?dataset=DPA,LPI&postcode=SW1A 1AA&key=` + mockApiKey,
    );

    // Compare the result with our mocked mapped AddressInfoResponse
    expect(result).toEqual(MOCK_API_ADDRESS);
  });

  it('should throw AssertionError if OS API returns no results', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: { results: [] } });

    await expect(lookupAddressesByPostcodeAndDataSet('SW1A 1AA')).rejects.toThrowError(AssertionError);
  });

  it('should throw AssertionError if OS API returns undefined data', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: undefined });

    await expect(lookupAddressesByPostcodeAndDataSet('SW1A 1AA')).rejects.toThrowError(AssertionError);
  });
});
