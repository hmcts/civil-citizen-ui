import config from 'config';
import {lookupByPostcodeAndDataSet} from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import axios from 'axios';
import {MOCK_API_ADDRESS, MOCK_API_RESPONSE} from '../../../utils/mocks/ordanceSurvey/osMocks';

const mockApiKey = 'mock-api-key';
const mockApiUrl = 'mock-api-url';

jest.mock('axios');

jest.mock('config', () => ({
  get: jest.fn(),
}));

describe('OS Places Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create call with valid API key', async () => {

    (config.get as jest.Mock).mockReturnValue(mockApiKey);
    (config.get as jest.Mock).mockReturnValue(mockApiUrl);

    (axios.get as jest.Mock).mockResolvedValue({ data: {results: MOCK_API_RESPONSE}  });

    const data = await lookupByPostcodeAndDataSet('123');

    expect(data).toEqual(MOCK_API_ADDRESS);

  });

});
