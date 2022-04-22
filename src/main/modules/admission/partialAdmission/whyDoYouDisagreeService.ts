import {WhyDoYouDisagree} from '../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getWhyDoYouDisagreeForm = async (claimId: string): Promise<WhyDoYouDisagree> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (paymentOptionExists(claim)) {
      return new WhyDoYouDisagree();
    }
    return new WhyDoYouDisagree();
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

const saveWhyDoYouDisagreeData = async (claimId: string, form: WhyDoYouDisagree) => {
  try {
    let claim: Claim = await getCaseDataFromStore(claimId);
    if (!claim) {
      claim = new Claim();
    }
    claim.partialAdmission.whyDoYouDisagree.text = form.text;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

const paymentOptionExists = (claim: Claim): boolean => {
  return claim?.paymentOption?.length > 0;
};

export {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
};
