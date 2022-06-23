import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');


export const getSupportRequired = async (claimId: string): Promise<SupportRequired> => {
  try {
    let supportRequired;
    const case_data = await getCaseDataFromStore(claimId);
    if (!case_data?.supportRequired) {
      supportRequired = new SupportRequired();
    } else {
      supportRequired = case_data.supportRequired;
    }
    return supportRequired;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveSupportRequired = async (claimId: string, supportRequired: SupportRequired) => {
  try {
    const case_data = await getCaseDataFromStore(claimId) || new Claim();
    if (!case_data?.supportRequired) {
      case_data.supportRequired = new SupportRequired();
    }
    case_data.supportRequired = supportRequired;
    await saveDraftClaim(claimId, case_data);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
