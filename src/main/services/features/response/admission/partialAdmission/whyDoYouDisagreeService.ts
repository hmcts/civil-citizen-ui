import {WhyDoYouDisagree} from '../../../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {PartialAdmission} from '../../../../../common/models/partialAdmission';
import {WhyDoYouDisagreeForm} from '../../../../../common/models/whyDoYouDisagreeForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getWhyDoYouDisagreeForm = async (claimId: string): Promise<WhyDoYouDisagreeForm> => {
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

const saveWhyDoYouDisagreeData = async (claimId: string, form: WhyDoYouDisagree) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.partialAdmission) {
      claim.partialAdmission = new PartialAdmission();
    }
    claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree(form.text);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
};
