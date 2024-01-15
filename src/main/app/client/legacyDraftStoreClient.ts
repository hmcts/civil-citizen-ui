import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {generateServiceToken} from './serviceAuthProviderClient';
import {DashboardClaimantItem} from '../../common/models/dashboard/dashboardItem';
import {
  draftOcmcClaimToDashboardItem,
  OcmcDraftData,
} from '../../common/models/legacyDraftClaim/draftClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('legacyDraftStoreClient');

const draftStoreUrl = config.get<string>('services.draftStore.legacy.url');

const microserviceName = config.get<string>('services.draftStore.legacy.s2s.microserviceName');

const secretsAsHeader = (primarySecret: string, secondarySecret: string): string => {
  return secondarySecret ? `${primarySecret}, ${secondarySecret}` : primarySecret;
};

const getOcmcDraftClaims = async (userToken: string): Promise<DashboardClaimantItem> => {
  const client: AxiosInstance = Axios.create({baseURL: draftStoreUrl});
  try {
    const _cmcS2sSecret = config.get<string>('services.serviceAuthProvider.cmcS2sSecret');
    const primarySecret = config.get<string>('services.draftStore.legacy.s2s.primarySecret');
    const secondarySecret = config.get<string>('services.draftStore.legacy.s2s.secondarySecret');
    const cmcServiceToken = await generateServiceToken(microserviceName, _cmcS2sSecret);

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
    logger.info(`Draft raw data retrieved from Legacy Draft Store`);
    const ocmcDraftData: OcmcDraftData = response.data as unknown as OcmcDraftData;
    const draft = ocmcDraftData?.data?.length? ocmcDraftData.data[0]: undefined;
    return draftOcmcClaimToDashboardItem(draft);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getOcmcDraftClaims,
};
