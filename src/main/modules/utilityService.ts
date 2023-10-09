import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {getCaseDataFromStore, saveDraftClaim} from '../modules/draft-store/draftStoreService';
import {CivilServiceClient} from '../app/client/civilServiceClient';
import {Claim} from '../../main/common/models/claim';
import {Request} from 'express';
import {ClaimDetails} from '../common/form/models/claim/details/claimDetails';
import {Reason} from '../common/form/models/claim/details/reason';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {FeeRange, FeeRanges} from 'common/models/feeRange';
import {TableItem} from 'common/models/tableItem';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

/**
 * Gets the claim from draft store and if not existing then gets it from ccd.
 * @param claimId, req
 * @returns claim
 */
export const getClaimById = async (claimId: string, req: Request): Promise<Claim> => {
  let claim: Claim = await getCaseDataFromStore(claimId);
  if(claim.isEmpty()) {
    claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if(claim) {
      await saveDraftClaim(claimId, claim);
    } else {
      claim = new Claim();
      claim.legacyCaseReference = 'testCaseReference';
      claim.totalClaimAmount = 200;
      claim.claimDetails = new ClaimDetails(new Reason('reasontext'));
      claim.totalInterest = 15;
      claim.claimFee = {calculatedAmountInPence: '3500'};
    }
  }
  return claim;
};

export const getRedisStoreForSession = () => {
  const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
  const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.session.redis.host')}:${config.get('services.session.redis.port')}`;
  return new RedisStore({
    client: new Redis(connectionString),
    prefix: 'citizen-ui-session:',
    ttl: 86400, //prune expired entries every 24h
  });
};

export const formatFeesRanges = (feesRanges: FeeRanges, lang: string): [TableItem[]] => {
  const tableFormatFeesRanges: [TableItem[]] = [[]];
  feesRanges.value.forEach((feeRange: FeeRange) => {
    tableFormatFeesRanges.push(feeRange.formatFeeRangeToTableItem(lang));
  });
  return tableFormatFeesRanges;
};
