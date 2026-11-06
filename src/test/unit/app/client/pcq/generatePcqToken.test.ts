import config from 'config';
import {createToken} from 'client/pcq/generatePcqToken';
import {PcqParameters} from 'client/pcq/pcqParameters';

jest.mock('config', () => ({get: jest.fn()}));
jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {error: jest.fn()};
  return {Logger: {getLogger: () => logger}, mockLogger: logger};
});
jest.retryTimes(0);

const {mockLogger} = jest.requireMock('@hmcts/nodejs-logging') as {mockLogger: {error: jest.Mock}};

describe('PCQ token configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty token and logs the missing configured key', () => {
    jest.mocked(config.get).mockReturnValue('');
    const params: PcqParameters = {
      pcqId: 'pcq-id', serviceId: 'civil-citizen-ui', actor: 'respondent',
      partyId: 'party@example.com', returnUrl: '/return', language: 'en',
    };

    expect(createToken(params)).toBe('');

    expect(config.get).toHaveBeenCalledWith('services.pcq.tokenKey');
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith('PCQ token key is missing.');
  });
});
