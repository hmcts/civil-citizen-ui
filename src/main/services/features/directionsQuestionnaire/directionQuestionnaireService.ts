import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {DirectionQuestionnaireErrorMessages} from '../../../common/form/models/directionQuestionnaireErrorMessages';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('directionQuestionnaireService');

const getDirectionQuestionnaire = async (claimId: string): Promise<DirectionQuestionnaire> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    return (claim?.directionQuestionnaire) ? claim.directionQuestionnaire : new DirectionQuestionnaire();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGenericOption = async (claimId: string, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    const directionQuestionnaire: any = caseData?.directionQuestionnaire ? caseData.directionQuestionnaire : new DirectionQuestionnaire();
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
    if (claim.directionQuestionnaire) {
      if (parentPropertyName && claim.directionQuestionnaire[parentPropertyName]) {
        claim.directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName] = value;
      } else if (parentPropertyName && !claim.directionQuestionnaire[parentPropertyName]) {
        claim.directionQuestionnaire[parentPropertyName] = {[directionQuestionnairePropertyName]: value};
      } else {
        claim.directionQuestionnaire[directionQuestionnairePropertyName] = value;
      }
    } else {
      const directionQuestionnaire: any = new DirectionQuestionnaire();
      if (parentPropertyName) {
        directionQuestionnaire[parentPropertyName] = {[directionQuestionnairePropertyName]: value};
      } else {
        directionQuestionnaire[directionQuestionnairePropertyName] = value;
      }
      claim.directionQuestionnaire = directionQuestionnaire;
    }
    console.log('save--->', claim.directionQuestionnaire.hearing.supportRequiredList);
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