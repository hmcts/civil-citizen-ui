import {getCaseDataFromStore, saveDraftClaim} from '../draft-store/draftStoreService';
import {Mediation} from '../../common/models/mediation/mediation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('freeMediationService');


const getMediation = async (claimId: string): Promise<Mediation> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.mediation) return new Mediation();
    return new Mediation(
      claim.mediation.canWeUse,
      claim.mediation.mediationDisagreement,
      claim.mediation.noMediationReason,
    );
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveMediation = async (claimId: string, value: any, mediationPropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.mediation) {
      claim.mediation[mediationPropertyName] = value;
    } else {
      const mediation: any = new Mediation();
      mediation[mediationPropertyName] = value;
      claim.mediation = mediation;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {getMediation, saveMediation};
