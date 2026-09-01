import config from 'config';
import axios from 'axios';
import { lookupByPostcodeAndDataSet } from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import { MOCK_API_ADDRESS, MOCK_API_RESPONSE } from '../../../utils/mocks/ordanceSurvey/osMocks';
import { AssertionError } from 'assert';

jest.mock('axios');
jest.mock('config', () => ({
  get: jest.fn(),
}));

describe('lookupByPostcodeAndDataSet', () => {
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

    const result = await lookupByPostcodeAndDataSet('SW1A 1AA');

    expect(axios.get).toHaveBeenCalledWith(
      `${mockApiUrl}/search/places/v1/postcode?dataset=DPA,LPI&postcode=SW1A%201AA&key=` + mockApiKey,
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

  it('should throw AssertionError if OS API returns no results', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: { results: [] } });

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toThrowError(AssertionError);
  });

  it('should throw AssertionError if OS API returns undefined data', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('ApiKey')) return mockApiKey;
      if (key.includes('ApiUrl')) return mockApiUrl;
      return '';
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: undefined });

    await expect(lookupByPostcodeAndDataSet('SW1A 1AA')).rejects.toThrowError(AssertionError);
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
});