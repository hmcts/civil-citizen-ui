import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {generateSync} from 'otplib';
import jwt_decode from 'jwt-decode';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('serviceAuthProviderClient');

const EXPIRY_BUFFER_MS = 60_000;
// Fallback when token payload cannot be decoded; keeps short-lived cache behaviour.
const DEFAULT_TOKEN_TTL_MS = 3 * 60 * 60 * 1000;

interface CachedToken {
  token: string;
  expiresAt: number;
}

interface JwtPayload {
  exp?: number;
}

const tokenCache = new Map<string, CachedToken>();
const inflightRequests = new Map<string, Promise<string>>();

const serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.baseUrl');
const serviceAuthTokenGeneratorUrl = config.get<string>('services.serviceAuthProvider.serviceAuthTokenGeneratorUrl');

let client: AxiosInstance | undefined;

const getClient = (): AxiosInstance => {
  if (!client) {
    client = Axios.create({baseURL: serviceAuthProviderUrl});
  }
  return client;
};

const getCacheKey = (microservice: string, withOtp: boolean): string =>
  withOtp ? microservice : `${microservice}:testing-support`;

const getTokenExpiresAt = (token: string): number => {
  try {
    const decoded = jwt_decode<JwtPayload>(token);
    if (decoded.exp) {
      return decoded.exp * 1000;
    }
  } catch (err: unknown) {
    logger.warn('Could not decode service auth token expiry, using fallback TTL', err);
  }
  return Date.now() + DEFAULT_TOKEN_TTL_MS;
};

const isCachedTokenValid = (cached: CachedToken): boolean =>
  cached.expiresAt - EXPIRY_BUFFER_MS > Date.now();

const requestServiceAuthToken = async (microservice: string, s2sSecret?: string): Promise<string> => {
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (s2sSecret) {
    const oneTimePassword = generateSync({secret: s2sSecret});

    logger.info(`About to generate Service Authorisation Token for: ${microservice}`);
    const response: AxiosResponse<string> = await getClient().post(
      '/lease',
      {
        microservice,
        oneTimePassword,
      },
      options,
    );
    logger.info(`Service Authorisation Token generated for: ${microservice}`);

    return response.data;
  }

  // Until civil_citizen_ui has dm-store access, xui_webapp uses the testing-support lease path.
  const response: AxiosResponse<string> = await getClient().post(
    serviceAuthTokenGeneratorUrl,
    {microservice},
    options,
  );

  return response.data;
};

const getServiceAuthorisationToken = async (microservice: string, s2sSecret?: string): Promise<string> => {
  const cacheKey = getCacheKey(microservice, Boolean(s2sSecret));
  const cached = tokenCache.get(cacheKey);

  if (cached && isCachedTokenValid(cached)) {
    return cached.token;
  }

  const inflight = inflightRequests.get(cacheKey);
  if (inflight !== undefined) {
    return inflight;
  }

  const request = requestServiceAuthToken(microservice, s2sSecret)
    .then((token) => {
      tokenCache.set(cacheKey, {
        token,
        expiresAt: getTokenExpiresAt(token),
      });
      return token;
    })
    .catch((error: unknown) => {
      logger.error(error);
      throw error;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, request);
  return request;
};

const generateServiceToken = (microservice: string, s2sSecret: string): Promise<string> =>
  getServiceAuthorisationToken(microservice, s2sSecret);

const clearServiceAuthTokenCache = (): void => {
  tokenCache.clear();
  inflightRequests.clear();
  client = undefined;
};

export {
  getServiceAuthorisationToken,
  generateServiceToken,
  clearServiceAuthTokenCache,
};
