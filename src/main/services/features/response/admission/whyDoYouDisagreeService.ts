import { WhyDoYouDisagree } from '../../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import { getCaseDataFromStore, saveDraftClaim } from '../../../../modules/draft-store/draftStoreService';
import { PartialAdmission } from '../../../../common/models/partialAdmission';
import { WhyDoYouDisagreeForm } from '../../../../common/models/whyDoYouDisagreeForm';
import { RejectAllOfClaim } from '../../../../common/form/models/rejectAllOfClaim';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getWhyDoYouDisagreeForm = async (claimId: string): Promise<WhyDoYouDisagreeForm> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const whyDoYouDisagreeForm = new WhyDoYouDisagreeForm();
    whyDoYouDisagreeForm.claimAmount = claim.totalClaimAmount;


    if (claim.isPartialAdmission() && claim.partialAdmission?.whyDoYouDisagree) {
      console.log('isPartialAdmission');

      whyDoYouDisagreeForm.whyDoYouDisagree = claim.partialAdmission.whyDoYouDisagree;
      return whyDoYouDisagreeForm;
    } else if (claim.isFullRejection() && claim.rejectAllOfClaim?.whyDoYouDisagree) {
      console.log('isFullRejection');
      whyDoYouDisagreeForm.whyDoYouDisagree = claim.rejectAllOfClaim.whyDoYouDisagree;
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

    console.log("SAVE CLAIM: ", claim.respondent1);


    if (claim.isPartialAdmission()) {
      console.log("SAVE isPartialAdmission: ", claim.respondent1);

      if (!claim.partialAdmission) {
        claim.partialAdmission = new PartialAdmission();
      }
      claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree(form.text);
    } else if (claim.isFullRejection()) {
      console.log("SAVE isFullRejection: ", claim.respondent1);

      if (!claim.rejectAllOfClaim) {
        claim.rejectAllOfClaim = new RejectAllOfClaim();
      }
      claim.rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree(form.text);
    }

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
