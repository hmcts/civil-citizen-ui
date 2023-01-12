import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from 'form/models/genericYesNo';
import {DirectionQuestionnaireErrorMessages} from 'form/models/directionQuestionnaireErrorMessages';
import {ClaimantResponse} from 'common/models/claimantResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('directionQuestionnaireService');

const getDirectionQuestionnaire = async (claimId: string): Promise<DirectionQuestionnaire> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      return claim.claimantResponse?.directionQuestionnaire ? claim.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    }
    return (claim?.directionQuestionnaire) ? claim.directionQuestionnaire : new DirectionQuestionnaire();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGenericOption = async (claimId: string, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    let directionQuestionnaire: any;
    if(caseData.isClaimantIntentionPending()){
      directionQuestionnaire = caseData.claimantResponse.directionQuestionnaire ? caseData.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    }else{
      directionQuestionnaire = caseData?.directionQuestionnaire ? caseData.directionQuestionnaire : new DirectionQuestionnaire();
    }
    if (parentPropertyName && directionQuestionnaire[parentPropertyName] && directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName]) {
      return directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName];
    } else if (!parentPropertyName && directionQuestionnaire[directionQuestionnairePropertyName]) {
      return directionQuestionnaire[directionQuestionnairePropertyName];
    } else {
      return new GenericYesNo(undefined, getDirectionQuestionnaireErrorMessage(directionQuestionnairePropertyName));
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGenericOptionForm = (option: string, propertyName: string): GenericYesNo => {
  return new GenericYesNo(option, getDirectionQuestionnaireErrorMessage(propertyName));
};

const saveDirectionQuestionnaire = async (claimId: string, value: any, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);

    if (claim.isClaimantIntentionPending() && !claim.claimantResponse) {
      claim.claimantResponse = new ClaimantResponse();
    }
    const baseProperty = claim.isClaimantIntentionPending() ? claim.claimantResponse : claim;

    if (baseProperty?.directionQuestionnaire) {
      if (parentPropertyName && baseProperty.directionQuestionnaire[parentPropertyName]) {
        baseProperty.directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName] = value;
      } else if (parentPropertyName && !baseProperty.directionQuestionnaire[parentPropertyName]) {
        baseProperty.directionQuestionnaire[parentPropertyName] = {[directionQuestionnairePropertyName]: value};
      } else {
        baseProperty.directionQuestionnaire[directionQuestionnairePropertyName] = value;
      }
    } else {
      const directionQuestionnaire: any = new DirectionQuestionnaire();
      if (parentPropertyName) {
        directionQuestionnaire[parentPropertyName] = {[directionQuestionnairePropertyName]: value};
      } else {
        directionQuestionnaire[directionQuestionnairePropertyName] = value;
      }
      baseProperty.directionQuestionnaire = directionQuestionnaire;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getDirectionQuestionnaireErrorMessage = (propertyName: string): string => {
  return (DirectionQuestionnaireErrorMessages[propertyName as keyof typeof DirectionQuestionnaireErrorMessages]) ?
    DirectionQuestionnaireErrorMessages[propertyName as keyof typeof DirectionQuestionnaireErrorMessages] :
    undefined;
};

export {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
  getGenericOption,
  getGenericOptionForm,
};
