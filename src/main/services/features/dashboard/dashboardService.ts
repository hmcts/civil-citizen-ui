import {
  DashboardClaimantItem,
  DashboardDefendantItem,
  DashboardStatusTranslationParam,
} from 'models/dashboard/dashboardItem';
import {Request} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {t} from 'i18next';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const getClaimsForDefendant = async (req : Request): Promise<DashboardDefendantItem[]> => {
  const claimsForDefendant = await civilServiceClient.getClaimsForDefendant(<AppRequest>req);
  claimsForDefendant?.forEach(item => item.translatedStatus = translate(item.getStatus().translationKey,item.getStatus().parameter));
  console.log(claimsForDefendant);
  return claimsForDefendant;
};

export const getClaimsForClaimant = async (req: Request): Promise<DashboardClaimantItem[]> => {
  return await civilServiceClient.getClaimsForClaimant(<AppRequest>req);
};

const translate = (translationKey: string, param?: DashboardStatusTranslationParam) =>{
  if(param) {
    const keyValue = {[param.key]: param.value};
    return t(translationKey, keyValue);
  }
  return t(translationKey);
};
