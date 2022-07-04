import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {generateServiceToken} from './serviceAuthProviderClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('legacyDraftStoreClient');

const draftStoreUrl = config.get<string>('services.draftStore.legacy.url');
const client: AxiosInstance = Axios.create({baseURL: draftStoreUrl});
const microserviceName = config.get<string>('services.draftStore.legacy.s2s.microserviceName');

const secretsAsHeader = (primarySecret: string, secondarySecret: string): string => {
  return secondarySecret ? `${primarySecret}, ${secondarySecret}` : primarySecret;
};

const getOcmcDraftClaims = async (userToken: string): Promise<void> => {
  try {
    const cmcS2sSecret = config.get<string>('services.serviceAuthProvider.cmcS2sSecret');
    const primarySecret = config.get<string>('services.draftStore.legacy.s2s.primarySecret');
    const secondarySecret = config.get<string>('services.draftStore.legacy.s2s.secondarySecret');

    logger.info(`cmcS2sSecret: ${cmcS2sSecret}`);
    logger.info(`primarySecret: ${primarySecret}`);
    logger.info(`primarySecret: ${primarySecret}`);

    logger.info('About to call generateServiceToken()...');
    const cmcServiceToken = await generateServiceToken(microserviceName, cmcS2sSecret);
    logger.info('generateServiceToken() called successfully.');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + userToken,
      'ServiceAuthorization': 'Bearer ' + cmcServiceToken,
      'Secret': secretsAsHeader(primarySecret, secondarySecret),
    };

    const response: AxiosResponse<string> = await client.get(
      '/drafts',
      {headers},
    );

    logger.info(`Draft raw data retrieved from Legacy Draft Store: ${JSON.stringify(response.data)}`);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getOcmcDraftClaims,
};
