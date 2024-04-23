import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType} from 'common/models/generalApplication/applicationType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

// export const getGeneralApplication = async (claimId: string): Promise<GeneralApplication> => {
//   try {
//     const claim= await getClaimById(currentClaimId, req, true);
//     // const claim = await getCaseDataFromStore(claimId, true);
//     const generalApplication = new GeneralApplication();
//     return Object.assign(generalApplication, claim.generalApplication);
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// };

export const saveApplicationType = async (claimId: string, applicationType: ApplicationType): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.applicationType = applicationType;
    await saveDraftClaim(claimId, claim);
  } catch (error) {

    logger.error(error);
    throw error;
  }
};
