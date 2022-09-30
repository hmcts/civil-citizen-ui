import config from 'config';
import { AppRequest } from '../../../common/models/AppRequest';
import { getCaseDataFromStore } from '../../../modules/draft-store/draftStoreService';
import { CivilServiceClient } from '../../../app/client/civilServiceClient';
import { isEqual } from 'lodash';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const compareAddress = async (req: AppRequest): Promise<boolean> => {

  const claimFromCivilService = await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
  const claimFromRedis = await getCaseDataFromStore(req.params.id);

  console.log('claimFromCivilService --> ', claimFromCivilService);
  console.log('claimFromRedis --> ', claimFromRedis);

  return isEqual(claimFromCivilService, claimFromRedis)

}
