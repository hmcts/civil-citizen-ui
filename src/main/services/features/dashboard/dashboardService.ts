import {DashboardClaimantItem, DashboardDefendantItem} from 'models/dashboard/dashboardItem';
import {Request} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {AppRequest} from 'models/AppRequest';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const getClaimsForDefendant = async (req : Request): Promise<DashboardDefendantItem[]> => {
  const claimsForDefendant = await civilServiceClient.getClaimsForDefendant(<AppRequest>req);
  console.log(claimsForDefendant);
  return claimsForDefendant;
};

export const getClaimsForClaimant = async (req: Request): Promise<DashboardClaimantItem[]> => {
  return await civilServiceClient.getClaimsForClaimant(<AppRequest>req);
};
