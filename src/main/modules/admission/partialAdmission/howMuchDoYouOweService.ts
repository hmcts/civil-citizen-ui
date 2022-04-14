import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {HowMuchDoYouOwe} from '../../../common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PartialAdmission} from '../../../common/models/PartialAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('howMuchDoYouOweService');

export const getHowMuchDoYouOweForm = async (claimId: string): Promise<HowMuchDoYouOwe> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const { totalClaimAmount } = claim;
    if (claim?.partialAdmission?.howMuchDoYouOwe?.amount) {
      const addmittedAmount = claim.partialAdmission.howMuchDoYouOwe.amount;
      return new HowMuchDoYouOwe(addmittedAmount, totalClaimAmount);
    }
    return new HowMuchDoYouOwe(null,totalClaimAmount);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHowMuchDoYouOweData = async (
  claimId: string,
  form: HowMuchDoYouOwe,
) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.partialAdmission) {
      claim.partialAdmission = new PartialAdmission();
    }
    claim.partialAdmission.howMuchDoYouOwe = form;

    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

