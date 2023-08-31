import { OSPlacesClient } from '@hmcts/os-places-client';
import config from 'config';
import { createOSPlacesClientInstance, getOSPlacesClientInstance } from 'modules/ordance-survey-key/ordanceSurveyKey';

const mockOSPlacesClient = {
  lookupByPostcode: jest.fn(),
  lookupByPostcodeAndDataSet: jest.fn(),
};

jest.mock('@hmcts/os-places-client', () => ({
  OSPlacesClient: jest.fn((apiKey: string) => mockOSPlacesClient),
}));

jest.mock('config', () => ({
  get: jest.fn(),
}));

describe('OS Places Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should create OSPlacesClient instance with valid API key', () => {
    const mockApiKey = 'mock-api-key';
    (config.get as jest.Mock).mockReturnValue(mockApiKey);
    createOSPlacesClientInstance();

    expect(config.get).toHaveBeenCalledWith('services.postcodeLookup.ordnanceSurveyApiKey');

    expect(OSPlacesClient).toHaveBeenCalledTimes(1);
  });

  it('should return non-null OSPlacesClient instance if created', () => {

    createOSPlacesClientInstance();

    const result = getOSPlacesClientInstance();

    expect(result).toBe(mockOSPlacesClient);
  });

  it('should not create OSPlacesClient instance if API key is missing', () => {
    (config.get as jest.Mock).mockReturnValue(undefined);

    createOSPlacesClientInstance();

    expect(config.get).toHaveBeenCalledWith('services.postcodeLookup.ordnanceSurveyApiKey');
    expect(OSPlacesClient).not.toHaveBeenCalled();
  });

  it('should not create a new OSPlacesClient instance if instance already exists', () => {
    const apiKey = 'api-key';
    const mockOSPlacesClient = jest.fn();

    createOSPlacesClientInstance();
    (OSPlacesClient as jest.Mock).mockClear();

    expect(mockOSPlacesClient).not.toHaveBeenCalledWith(apiKey);
  });
});
