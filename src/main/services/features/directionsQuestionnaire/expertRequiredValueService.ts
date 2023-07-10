import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

export const saveExpertRequiredValue = async (claimId: string, expertRequiredValue: boolean)=>{
  try {
    const claim = await getCaseDataFromStore(claimId);

    if(!claim.directionQuestionnaire){
      claim.directionQuestionnaire = new DirectionQuestionnaire();
    }
    if(!claim.directionQuestionnaire.experts) {
      claim.directionQuestionnaire.experts = new Experts();
    }

    claim.directionQuestionnaire.experts.expertRequired = expertRequiredValue;

    if (!expertRequiredValue) {
      claim.directionQuestionnaire.experts.expertReportDetails = null;
      claim.directionQuestionnaire.experts.permissionForExpert = null;
      claim.directionQuestionnaire.experts.expertCanStillExamine = null;
      claim.directionQuestionnaire.experts.expertDetailsList = null;
    }
    
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
