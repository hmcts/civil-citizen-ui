import {DashboardClaimantItem, DashboardDefendantItem} from 'models/dashboard/dashboardItem';
import {Request} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {getLng} from 'common/utils/languageToggleUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const getClaimsForDefendant = async (req : Request): Promise<DashboardDefendantItem[]> => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimsForDefendant : DashboardDefendantItem[] = await civilServiceClient.getClaimsForDefendant(<AppRequest>req);
  claimsForDefendant.forEach(item => item.setTranslatedStatus(getLng(lang)));
  return claimsForDefendant;
};

export const getClaimsForClaimant = async (req: Request): Promise<DashboardClaimantItem[]> => {
  return await civilServiceClient.getClaimsForClaimant(<AppRequest>req);
};
