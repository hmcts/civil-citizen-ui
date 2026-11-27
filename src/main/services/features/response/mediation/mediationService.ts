import {getCaseDataFromStore, saveDraftClaim, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {Mediation} from 'models/mediation/mediation';
import {ClaimantResponse} from 'models/claimantResponse';
import {Claim} from 'models/claim';
import {MediationCarm} from 'models/mediation/mediationCarm';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('freeMediationService');

const getMediation = async (req: AppRequest): Promise<Mediation> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim: Claim = await getCaseDataFromStore(redisKey);

    if (claim.isClaimantIntentionPending()) {
      return claim.claimantResponse?.mediation ?? new Mediation();
    }

    claim = await getResponseClaimById(req, caseId);
    return claim?.mediation ?? new Mediation();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getMediationCarm = async (req: AppRequest): Promise<MediationCarm> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim: Claim = await getCaseDataFromStore(redisKey);

    if (claim.isClaimantIntentionPending()) {
      return claim.claimantResponse?.mediationCarm ?? new MediationCarm();
    }

    claim = await getResponseClaimById(req, caseId);
    return claim?.mediationCarm ?? new MediationCarm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveMediation = async (req: AppRequest, value: any, mediationPropertyName: keyof Mediation): Promise<void> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim: Claim = await getCaseDataFromStore(redisKey);
    let draftId: string | undefined;

    if (!claim.isClaimantIntentionPending()) {
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[mediationService] no response draft found');
      }
      claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      draftId = draftResult.rawResponse?.draftId;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
    }

    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse) {
        claim.claimantResponse = new ClaimantResponse();
      }
      if (!claim.claimantResponse.mediation) {
        claim.claimantResponse.mediation = new Mediation();
      }
      claim.claimantResponse.mediation[mediationPropertyName] = value;
      await saveDraftClaim(redisKey, claim);
    } else {
      if (!claim.mediation) {
        claim.mediation = new Mediation();
      }
      claim.mediation[mediationPropertyName] = value;
      await updateResponseDraft(req, caseId, claim, draftId);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveMediationCarm = async (req: AppRequest, value: any, mediationPropertyName: keyof MediationCarm): Promise<void> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim: Claim = await getCaseDataFromStore(redisKey);
    let draftId: string | undefined;

    if (!claim.isClaimantIntentionPending()) {
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[mediationService] no response draft found');
      }
      claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      draftId = draftResult.rawResponse?.draftId;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
    }

    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse) {
        claim.claimantResponse = new ClaimantResponse();
      }
      if (!claim.claimantResponse.mediationCarm) {
        claim.claimantResponse.mediationCarm = new MediationCarm();
      }
      claim.claimantResponse.mediationCarm[mediationPropertyName] = value;
      await saveDraftClaim(redisKey, claim);
    } else {
      if (!claim.mediationCarm) {
        claim.mediationCarm = new MediationCarm();
      }
      claim.mediationCarm[mediationPropertyName] = value;
      await updateResponseDraft(req, caseId, claim, draftId);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {getMediation, getMediationCarm, saveMediation, saveMediationCarm};
