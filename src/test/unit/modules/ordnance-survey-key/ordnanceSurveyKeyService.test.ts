import config from 'config';
import axios from 'axios';
import { lookupByPostcodeAndDataSet } from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';
import { AddressInfoResponse } from 'models/ordnanceSurveyKey/ordnanceSurveyKey';
import { MOCK_API_ADDRESS, MOCK_API_RESPONSE } from '../../../utils/mocks/ordnanceSurvey/osMocks';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ordnanceSurveyKeyService');

jest.mock('axios');
jest.mock('config', () => ({
  get: jest.fn(),
}));

describe('lookupByPostcodeAndDataSet', () => {
  const mockApiKey = 'mock-api-key';
  const mockApiUrl = 'mock-api-url';
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();
    loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    loggerErrorSpy.mockRestore();
    loggerWarnSpy.mockRestore();
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

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');

    expect(axios.get).toHaveBeenCalledWith(
      `${mockApiUrl}/search/places/v1/postcode`,
      {
        params: {
          dataset: 'DPA,LPI',
          postcode: 'SW1A 1AA',
        },
        headers: {
          key: mockApiKey,
        },
      },
    );

    // Compare the result with our mocked mapped AddressInfoResponse
    expect(result).toEqual(MOCK_API_ADDRESS);
  });

  it('should include Welsh addresses and exclude Scottish addresses', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: { results: MOCK_API_RESPONSE } });

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');

    const welshAddress = result.addresses.find(a => a.country === 'Wales');
    const scottishAddress = result.addresses.find(a => a.country === 'Scotland');
    const englandAddress = result.addresses.find(a => a.country === 'England');

    expect(welshAddress).toBeDefined();
    expect(welshAddress.uprn).toBe('200000000001');
    expect(scottishAddress).toBeUndefined();
    expect(englandAddress).toBeDefined();
  });

  it('should exclude historical and no longer existing addresses', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: { results: MOCK_API_RESPONSE } });

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');

    const historicalAddress = result.addresses.find(a => a.uprn === '500000000001');
    const goneAddress = result.addresses.find(a => a.uprn === '600000000001');

    expect(historicalAddress).toBeUndefined();
    expect(goneAddress).toBeUndefined();
  });

  it('should return empty AddressInfoResponse if OS API returns no results', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: { results: [] } });

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');
    expect(result).toEqual(new AddressInfoResponse([], true));
  });

  it('should return empty AddressInfoResponse if OS API returns undefined data', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: undefined });

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');
    expect(result).toEqual(new AddressInfoResponse([], true));
  });

  it('should prioritize DPA results over LPI results for the same address', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    const lpiResult = {
      LPI: {
        UPRN: '10091853817',
        ADDRESS: 'THE WELLINGTON MUSEUM, 149, PICCADILLY, LONDON, W1J 7NT',
        PAO_START_NUMBER: '149',
        PAO_TEXT: 'THE WELLINGTON MUSEUM',
        STREET_DESCRIPTION: 'PICCADILLY',
        TOWN_NAME: 'LONDON',
        POSTCODE_LOCATOR: 'W1J 7NT',
        POSTAL_ADDRESS_CODE: 'D',
        X_COORDINATE: 528370,
        Y_COORDINATE: 179894,
        COUNTRY_CODE: 'E',
      },
    };
    const dpaResult = {
      DPA: {
        UPRN: '10091853817',
        UDPRN: '25748129',
        ADDRESS: 'THE WELLINGTON MUSEUM, 149, PICCADILLY, LONDON, W1J 7NT',
        ORGANISATION_NAME: 'THE WELLINGTON MUSEUM',
        BUILDING_NUMBER: '149',
        THOROUGHFARE_NAME: 'PICCADILLY',
        POST_TOWN: 'LONDON',
        POSTCODE: 'W1J 7NT',
        POSTAL_ADDRESS_CODE: 'D',
        X_COORDINATE: 528370,
        Y_COORDINATE: 179894,
        COUNTRY_CODE: 'E',
      },
    };

    // Mock axios.get to return LPI before DPA
    (axios.get as jest.Mock).mockResolvedValue({ data: { results: [lpiResult, dpaResult] } });

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');

    expect(result.addresses.length).toBe(1);
    expect(result.addresses[0].postcodeType).toBe('D'); // DPA record has 'D' postcodeType in LPI too, wait...
    // Actually DPA source maps source.POSTAL_ADDRESS_CODE to postcodeType.
    // In LPI it's also 'D'.
    // Let's check udprn. DPA has udprn '25748129', LPI has udprn source.UDPRN ?? source.UPRN which would be '10091853817'.
    expect(result.addresses[0].udprn).toBe('25748129');
  });

  it('should log error and throw when API key is not configured', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return '';
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toThrow('Ordnance Survey API key is not configured');
    expect(loggerErrorSpy).toHaveBeenCalledWith('Ordnance Survey API key is missing or not configured');
  });

  it('should log error when OS API returns 401 with InvalidApiKey fault', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 401',
      response: {
        status: 401,
        data: {
          fault: {
            faultstring: 'Invalid ApiKey',
            detail: {
              errorcode: 'oauth.v2.InvalidApiKey',
            },
          },
        },
      },
    };
    (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);
    (axios.get as jest.Mock).mockRejectedValue(axiosError);

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toEqual(axiosError);
    expect(loggerErrorSpy).toHaveBeenCalledWith('Ordnance Survey API authentication failed (401): Invalid ApiKey');
  });

  it('should log error when OS API returns 403 status', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 403',
      response: {
        status: 403,
        data: {
          fault: {
            faultstring: 'Forbidden',
          },
        },
      },
    };
    (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);
    (axios.get as jest.Mock).mockRejectedValue(axiosError);

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toEqual(axiosError);
    expect(loggerErrorSpy).toHaveBeenCalledWith('Ordnance Survey API authentication failed (403): Forbidden');
  });

  it('should log a warning when OS API returns 400 status', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        data: { fault: { faultstring: 'Invalid postcode' } },
      },
    };
    (axios.get as jest.Mock).mockRejectedValue(axiosError);

    await expect(lookupByPostcodeAndDataSet('AB')).rejects.toEqual(axiosError);
    expect(loggerWarnSpy).toHaveBeenCalledWith('Ordnance Survey API request rejected with status 400: Invalid postcode');
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('should log error when OS API returns 500 status', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 500',
      response: {
        status: 500,
        data: 'Internal Server Error',
      },
    };
    (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);
    (axios.get as jest.Mock).mockRejectedValue(axiosError);

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toEqual(axiosError);
    expect(loggerErrorSpy).toHaveBeenCalledWith('Ordnance Survey API request failed with status 500: Request failed with status code 500');
  });

  it('should log error for non-axios errors', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    const genericError = new Error('Network timeout');
    (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);
    (axios.get as jest.Mock).mockRejectedValue(genericError);

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toThrow('Network timeout');
    expect(loggerErrorSpy).toHaveBeenCalledWith('Ordnance Survey API request failed: Network timeout');
  });
});
