import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Mediation} from 'models/mediation/mediation';
import {ClaimantResponse} from 'models/claimantResponse';
import {Claim} from 'models/claim';
import {MediationCarm} from 'models/mediation/mediationCarm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('freeMediationService');

const getMediation = async (claimId: string): Promise<Mediation> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse?.mediation) return new Mediation();
      return claim.claimantResponse.mediation;
    } else {
      if (!claim.mediation) return new Mediation();
      return claim.mediation;
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getMediationCarm = async (claimId: string): Promise<MediationCarm> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse?.mediationCarm) return new MediationCarm();
      return claim.claimantResponse.mediationCarm;
    } else {
      if (!claim.mediationCarm) return new MediationCarm();
      return claim.mediationCarm;
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveMediation = async (claimId: string, value: any, mediationPropertyName: keyof Mediation): Promise<void> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse) {
        claim.claimantResponse = new ClaimantResponse();
      }
      if (!claim.claimantResponse.mediation) {
        claim.claimantResponse.mediation = new Mediation();
      }
      claim.claimantResponse.mediation[mediationPropertyName] = value;
    } else {
      if (!claim.mediation) {
        claim.mediation = new Mediation();
      }
      claim.mediation[mediationPropertyName] = value;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveMediationCarm = async (claimId: string, value: any, mediationPropertyName: keyof MediationCarm): Promise<void> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse) {
        claim.claimantResponse = new ClaimantResponse();
      }
      if (!claim.claimantResponse.mediationCarm) {
        claim.claimantResponse.mediationCarm = new MediationCarm();
      }
      claim.claimantResponse.mediationCarm[mediationPropertyName] = value;
    } else {
      if (!claim.mediationCarm) {
        claim.mediationCarm = new MediationCarm();
      }
      claim.mediationCarm[mediationPropertyName] = value;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {getMediation, getMediationCarm, saveMediation, saveMediationCarm};
