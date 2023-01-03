import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Mediation} from '../../../../common/models/mediation/mediation';
import {ClaimantResponse} from  '../../../../common/models/claimantResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('freeMediationService');

const getMediation = async (claimId: string): Promise<Mediation> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if(claim.isClaimantIntentionPending()){
      if (!claim.claimantResponse?.mediation) return new Mediation();
      return claim.claimantResponse.mediation;
    }else{
      if (!claim.mediation) return new Mediation();
      return new Mediation(
        claim.mediation.canWeUse,
        claim.mediation.mediationDisagreement,
        claim.mediation.noMediationReason,
        claim.mediation.companyTelephoneNumber,
      );
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveMediation = async (claimId: string, value: any, mediationPropertyName: keyof Mediation): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if(claim.isClaimantIntentionPending()){
      if (claim.claimantResponse?.mediation) {
        claim.claimantResponse.mediation[mediationPropertyName] = value;
      } else if (claim.claimantResponse) {
        const mediation = new Mediation();
        mediation[mediationPropertyName] = value;
        claim.claimantResponse.mediation = mediation;
      } else {
        claim.claimantResponse = new ClaimantResponse();
        const mediation = new Mediation();
        mediation[mediationPropertyName] = value;
        claim.claimantResponse.mediation = mediation;
      }
    }else{
      if (claim.mediation) {
        claim.mediation[mediationPropertyName] = value;
      } else {
        const mediation: Mediation = new Mediation();
        mediation[mediationPropertyName] = value;
        claim.mediation = mediation;
      }
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {getMediation, saveMediation};
