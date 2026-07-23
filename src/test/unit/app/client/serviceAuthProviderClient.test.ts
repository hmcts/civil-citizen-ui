import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {
  clearServiceAuthTokenCache,
  generateServiceToken,
  getServiceAuthorisationToken,
} from '../../../../main/app/client/serviceAuthProviderClient';
import {generateSync} from 'otplib';

jest.mock('axios');
jest.mock('otplib');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const createMockJwt = (expSeconds: number): string => {
  const header = Buffer.from(JSON.stringify({alg: 'HS512'})).toString('base64url');
  const payload = Buffer.from(JSON.stringify({sub: 'test', exp: expSeconds})).toString('base64url');
  return `${header}.${payload}.signature`;
};

describe('Service Authorisation Provider Client', () => {
  let mockPost: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    clearServiceAuthTokenCache();
    mockPost = jest.fn();
    mockedAxios.create.mockReturnValue({post: mockPost} as unknown as AxiosInstance);
    (generateSync as jest.Mock).mockReturnValue('123456');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should request a testing-support token when no s2s secret is provided', async () => {
    const mockResponse = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    mockPost.mockResolvedValue({data: mockResponse});

    const actualToken = await getServiceAuthorisationToken('xui_webapp');

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: config.get<string>('services.serviceAuthProvider.baseUrl'),
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toEqual('/testing-support/lease');
    expect(mockPost.mock.calls[0][1]).toEqual({microservice: 'xui_webapp'});
    expect(actualToken).toEqual(mockResponse);
  });

  it('should request a lease token with OTP when s2s secret is provided', async () => {
    const mockResponse = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    mockPost.mockResolvedValue({data: mockResponse});

    const actualToken = await generateServiceToken('cmc', 's2sSecret');

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toEqual('/lease');
    expect(mockPost.mock.calls[0][1]).toEqual({
      microservice: 'cmc',
      oneTimePassword: '123456',
    });
    expect(actualToken).toEqual(mockResponse);
  });

  it('should return cached token on cache hit', async () => {
    const mockResponse = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    mockPost.mockResolvedValue({data: mockResponse});

    await generateServiceToken('cmc', 's2sSecret');
    const cachedToken = await generateServiceToken('cmc', 's2sSecret');

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(cachedToken).toEqual(mockResponse);
  });

  it('should request a new token on cache miss after expiry', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T12:00:00Z'));

    const expiredToken = createMockJwt(Math.floor(Date.now() / 1000) + 30);
    const refreshedToken = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    mockPost
      .mockResolvedValueOnce({data: expiredToken})
      .mockResolvedValueOnce({data: refreshedToken});

    const firstToken = await generateServiceToken('cmc', 's2sSecret');
    jest.advanceTimersByTime(31_000);
    const secondToken = await generateServiceToken('cmc', 's2sSecret');

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(firstToken).toEqual(expiredToken);
    expect(secondToken).toEqual(refreshedToken);
  });

  it('should keep separate caches for different microservices', async () => {
    const cmcToken = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    const xuiToken = createMockJwt(Math.floor(Date.now() / 1000) + 7200);
    mockPost
      .mockResolvedValueOnce({data: cmcToken})
      .mockResolvedValueOnce({data: xuiToken});

    const firstCmcToken = await generateServiceToken('cmc', 's2sSecret');
    const firstXuiToken = await getServiceAuthorisationToken('xui_webapp');
    const cachedCmcToken = await generateServiceToken('cmc', 's2sSecret');
    const cachedXuiToken = await getServiceAuthorisationToken('xui_webapp');

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(firstCmcToken).toEqual(cmcToken);
    expect(firstXuiToken).toEqual(xuiToken);
    expect(cachedCmcToken).toEqual(cmcToken);
    expect(cachedXuiToken).toEqual(xuiToken);
  });

  it('should throw error when service token generation fails', async () => {
    (generateSync as jest.Mock).mockImplementation(() => {
      throw new Error('OTP Generation Error');
    });

    await expect(generateServiceToken('microservice', 's2sSecret')).rejects.toThrow('OTP Generation Error');
  });

  it('should use default TTL when token has no exp claim', async () => {
    const header = Buffer.from(JSON.stringify({alg: 'HS512'})).toString('base64url');
    const payload = Buffer.from(JSON.stringify({sub: 'test'})).toString('base64url');
    const tokenWithoutExp = `${header}.${payload}.signature`;
    mockPost.mockResolvedValue({data: tokenWithoutExp});

    await generateServiceToken('cmc', 's2sSecret');
    const cachedToken = await generateServiceToken('cmc', 's2sSecret');

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(cachedToken).toEqual(tokenWithoutExp);
  });

  it('should use default TTL when token cannot be decoded', async () => {
    mockPost.mockResolvedValue({data: 'not-a-jwt-token'});

    await generateServiceToken('cmc', 's2sSecret');
    const cachedToken = await generateServiceToken('cmc', 's2sSecret');

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(cachedToken).toEqual('not-a-jwt-token');
  });

  it('should deduplicate concurrent token requests', async () => {
    const mockResponse = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    let resolvePost: (value: {data: string}) => void;
    const postPromise = new Promise<{data: string}>((resolve) => {
      resolvePost = resolve;
    });
    mockPost.mockReturnValue(postPromise);

    const firstRequest = generateServiceToken('cmc', 's2sSecret');
    const secondRequest = generateServiceToken('cmc', 's2sSecret');

    resolvePost!({data: mockResponse});

    const [firstToken, secondToken] = await Promise.all([firstRequest, secondRequest]);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(firstToken).toEqual(mockResponse);
    expect(secondToken).toEqual(mockResponse);
  });

  it('should throw when lease request fails', async () => {
    mockPost.mockRejectedValue(new Error('Lease request failed'));

    await expect(generateServiceToken('cmc', 's2sSecret')).rejects.toThrow('Lease request failed');
  });
});
