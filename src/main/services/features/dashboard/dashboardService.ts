import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getClaimsForClaimant = async (appRequest: AppRequest) => {
  return   await civilServiceClient.getClaimsForClaimant(appRequest);
};

export const getClaimsForDefendant = async (appRequest: AppRequest) => {
  return await civilServiceClient.getClaimsForDefendant(appRequest);
};
