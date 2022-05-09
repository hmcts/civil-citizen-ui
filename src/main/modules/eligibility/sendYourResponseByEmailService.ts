import {WhyDoYouDisagree} from '../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sendYourResponseByEmailService');

const getsendYourResponseByEmailForm = async (claimId: string): Promise<WhyDoYouDisagreeForm> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const whyDoYouDisagreeForm = new WhyDoYouDisagreeForm();
    whyDoYouDisagreeForm.claimAmount = claim.totalClaimAmount;
    if (claim.partialAdmission?.whyDoYouDisagree) {
      whyDoYouDisagreeForm.whyDoYouDisagree = claim.partialAdmission.whyDoYouDisagree;
      return whyDoYouDisagreeForm;
    }
    whyDoYouDisagreeForm.whyDoYouDisagree = new WhyDoYouDisagree();
    return whyDoYouDisagreeForm;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};


export {
  getsendYourResponseByEmailForm,
};
