import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {createOrLoadDraft, getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getRouteParam, isUsablePathSegment} from 'common/utils/routeParamUtils';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getTTLDaysForCategory, TTLCategory} from 'modules/draft-store/ttlConfig';

export interface ClaimIssuePaymentDraft {
  claim: Claim;
  draftId: string;
}

const civilServiceClient = new CivilServiceClient(config.get<string>('services.civilService.url'));

const isDraftCaseIdEqualToClaimId = (draftCaseId: string | undefined, claimId: string): boolean => {
  return Boolean(draftCaseId) && String(draftCaseId) === String(claimId);
};

export const getClaimIssuePaymentClaim = async (req: AppRequest): Promise<ClaimIssuePaymentDraft> => {
  const claimId = getRouteParam(req, 'id');
  if (!isUsablePathSegment(claimId)) {
    throw new Error('[claimIssuePaymentDraftService] claim id is required');
  }

  const draftResult = await getDraftClaim(req);
  const draftIdFromDraft = req.session?.draftId || draftResult?.rawResponse?.draftId;

  if (draftResult?.claimResponse?.case_data && draftIdFromDraft) {
    const claim = Object.assign(new Claim(), draftResult.claimResponse.case_data as unknown as Claim);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    const draftCaseId = draftResult.rawResponse?.caseId || claim.id;
    if (isDraftCaseIdEqualToClaimId(draftCaseId, claimId)) {
      if (req.session && !req.session.draftId) {
        req.session.draftId = draftIdFromDraft;
      }
      return {claim, draftId: draftIdFromDraft};
    }
    throw new Error('[claimIssuePaymentDraftService] draft does not match claim id');
  }

  const ccdClaim = await civilServiceClient.retrieveClaimDetails(claimId, req);
  if (!ccdClaim || ccdClaim.isEmpty()) {
    throw new Error('[claimIssuePaymentDraftService] no claim found');
  }

  ccdClaim.id = claimId;
  ccdClaim.draftClaimCacheTtlDays = getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM);

  const created = await createOrLoadDraft(req, ccdClaim);
  const draftId = req.session?.draftId || created.rawResponse?.draftId;
  if (!draftId) {
    throw new Error('[claimIssuePaymentDraftService] no draft claim found for payment resume');
  }
  await updateDraftClaim(req, ccdClaim, draftId);
  if (req.session && !req.session.draftId) {
    req.session.draftId = draftId;
  }
  return {claim: ccdClaim, draftId};
};
