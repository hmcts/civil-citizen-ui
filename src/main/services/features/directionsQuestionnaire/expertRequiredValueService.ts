import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

export const saveExpertRequiredValue = async (claimId: string, expertRequiredValue: boolean)=>{
  try {
    const claim = await getCaseDataFromStore(claimId);

    if (claim.isClaimantIntentionPending()) {
      setExpertRequiredValueForClaimant(expertRequiredValue, claim);
    }else {
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
    }

    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const setExpertRequiredValueForClaimant = (expertRequired : boolean, claim: Claim): void => {

  if(!claim.claimantResponse.directionQuestionnaire) {
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
  }
  if(!claim.claimantResponse.directionQuestionnaire?.experts) {
    claim.claimantResponse.directionQuestionnaire.experts = new Experts();
  }
  claim.claimantResponse.directionQuestionnaire.experts.expertRequired = expertRequired;
  if(!expertRequired) {
    resetExperts(claim.claimantResponse.directionQuestionnaire.experts);
  }
};

const resetExperts = (experts : Experts) => {
  experts.expertReportDetails = null;
  experts.permissionForExpert = null;
  experts.expertCanStillExamine = null;
  experts.expertDetailsList = null;
};
