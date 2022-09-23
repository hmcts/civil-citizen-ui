import { getCaseDataFromStore, saveDraftClaim } from '../../../modules/draft-store/draftStoreService';
import { ExpertDetails } from '../../../common/models/directionsQuestionnaire/experts/expertDetails';
import { DirectionQuestionnaire } from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import { Experts } from '../../../common/models/directionsQuestionnaire/experts/experts';
// import { GenericForm } from '../../../common/form/models/genericForm';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getExpertDetails = async (claimId: string): Promise<ExpertDetails[]> => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    const expertDetails = case_data.directionQuestionnaire?.experts?.expertDetailsList?.items
      ? case_data.directionQuestionnaire.experts.expertDetailsList?.items
      : [new ExpertDetails()];
    return expertDetails;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveExpertDetails = async (claimId: string, expertDetails: ExpertDetails[]) => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (!case_data.directionQuestionnaire?.experts.expertDetailsList.items) {
      case_data.directionQuestionnaire = new DirectionQuestionnaire();
      case_data.directionQuestionnaire.experts = new Experts();
      case_data.directionQuestionnaire.experts.expertDetailsList.items = [];
    }
    case_data.directionQuestionnaire.experts.expertDetailsList.items = expertDetails;
    await saveDraftClaim(claimId, case_data);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// export const getExpertDetailsForm = async (claimId: string): Promise<GenericForm<ExpertDetails>[]> => {
//   try {
//     const case_data = await getCaseDataFromStore(claimId);
//     const expertDetailsForm = [];

//     if (!case_data.directionQuestionnaire?.experts?.expertDetails){
//       expertDetailsForm.push(new GenericForm(new ExpertDetails()));
//     } else {
//       case_data.directionQuestionnaire?.experts?.expertDetails.forEach(expertDetail => {
//         expertDetailsForm.push(new GenericForm(expertDetail));
//       });
//     }
//     return expertDetailsForm;
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// };
