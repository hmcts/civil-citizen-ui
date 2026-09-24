import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getRouteParam, isUsablePathSegment} from 'common/utils/routeParamUtils';

export interface ClaimIssuePaymentDraft {
  claim: Claim;
  draftId: string;
}

const draftEqualsClaimId = (draftCaseId: string | undefined, claimId: string): boolean => {
  return Boolean(draftCaseId) && String(draftCaseId) === String(claimId);
};

export const getClaimIssuePaymentClaim = async (req: AppRequest): Promise<ClaimIssuePaymentDraft> => {
  const claimId = getRouteParam(req, 'id');
  if (!isUsablePathSegment(claimId)) {
    throw new Error('[claimIssuePaymentDraftService] claim id is required');
  }

  const draftResult = await getDraftClaim(req);
  const draftId = req.session?.draftId || draftResult?.rawResponse?.draftId;
  if (!draftResult?.claimResponse?.case_data || !draftId) {
    throw new Error('[claimIssuePaymentDraftService] no draft claim found for payment resume');
  }

  const claim = Object.assign(new Claim(), draftResult.claimResponse.case_data as unknown as Claim);
  if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
    claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
  }

  const draftCaseId = draftResult.rawResponse?.caseId || claim.id;
  if (!draftEqualsClaimId(draftCaseId, claimId)) {
    throw new Error('[claimIssuePaymentDraftService] draft does not match claim id');
  }

  if (req.session && !req.session.draftId) {
    req.session.draftId = draftId;
  }
  return {claim, draftId};
};
