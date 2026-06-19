import {Claim} from 'common/models/claim';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {calculateInterestToDate} from 'common/utils/interestUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkClaimFee');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const checkIfClaimFeeHasChanged = async (claimId: string, claim: Claim, req: AppRequest) => {
  if(!claim?.isDraftClaim()) {
    return false;
  }
  logger.info(`[DUPLICATE-CHECK] checkIfClaimFeeHasChanged calling calculateInterestToDate for claim: ${claimId}`);
  const interestToDate = await calculateInterestToDate(claim);
  const newClaimFeeData = await civilServiceClient.getClaimFeeData(claim.totalClaimAmount + interestToDate, req);
  const oldClaimFee = claim.claimFee?.calculatedAmountInPence;
  return oldClaimFee !== newClaimFeeData?.calculatedAmountInPence;
};
