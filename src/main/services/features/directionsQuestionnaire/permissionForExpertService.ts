import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Permission for expert');

const getPermissionForExpert = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.permissionForExpert ?
      caseData.directionQuestionnaire.permissionForExpert :
      new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getPermissionForExpertForm = (permissionForExpert: string): GenericYesNo => {
  return new GenericYesNo(permissionForExpert);
};

const savePermissionForExpert = async (claimId: string, permissionForExpert: GenericYesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData?.directionQuestionnaire) {
      caseData.directionQuestionnaire = {...caseData.directionQuestionnaire, permissionForExpert};
    } else {
      caseData.directionQuestionnaire = {...new DirectionQuestionnaire(), permissionForExpert};
    }
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getPermissionForExpert,
  getPermissionForExpertForm,
  savePermissionForExpert,
};
