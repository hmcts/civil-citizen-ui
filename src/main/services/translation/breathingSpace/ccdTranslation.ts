import {CCDClaim} from 'models/civilClaimResponse';
import {BreathingSpace} from 'models/breathingSpace';
import {toCCDBreathingSpaceStartInfo} from 'services/translation/breathingSpace/convertToCCDBreathingSpaceStartInfo';
import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';
import {AppRequest} from 'models/AppRequest';

export const translateBreathingSpaceToCCD = (breathingSpace: BreathingSpace, req: AppRequest): CCDClaim => {
  return {
    enterBreathing: toCCDBreathingSpaceStartInfo(breathingSpace),
    claimantUserDetails: getClaimantIdamDetails(req.session?.user),
  };
};
