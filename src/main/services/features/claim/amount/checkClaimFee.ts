import {Claim} from 'common/models/claim';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {calculateInterestToDate} from 'common/utils/interestUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
// Once submitted, the claim fee is fixed at the value shown at submission (DTSCCI-1720 AC2/AC3): interest accrued
// since, or a fee code change, must not alter it. draftClaimCreatedAt is also present on cached copies of submitted
// claims, so isDraftClaim() alone cannot tell them apart.
const isSubmittedWithClaimFee = (claim: Claim): boolean =>
  !!(claim.ccdState || claim.submittedDate) && claim.claimFee?.calculatedAmountInPence !== undefined;

export const checkIfClaimFeeHasChanged = async (claimId: string, claim: Claim, req: AppRequest) => {
  if(!claim?.isDraftClaim() || isSubmittedWithClaimFee(claim)) {
    return false;
  }
  const interestToDate = await calculateInterestToDate(claim, req);
  const newClaimFeeData = await civilServiceClient.getClaimFeeData(claim.totalClaimAmount + interestToDate, req);
  const oldClaimFee = claim.claimFee?.calculatedAmountInPence;
  const normalisedOldClaimFee = oldClaimFee === undefined ? undefined : Number(oldClaimFee);
  return normalisedOldClaimFee !== newClaimFeeData?.calculatedAmountInPence;
};
