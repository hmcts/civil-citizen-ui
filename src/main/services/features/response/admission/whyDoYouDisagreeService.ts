import {WhyDoYouDisagree} from '../../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {PartialAdmission} from '../../../../common/models/partialAdmission';
import {WhyDoYouDisagreeForm} from '../../../../common/models/whyDoYouDisagreeForm';
import {RejectAllOfClaim} from '../../../../common/form/models/rejectAllOfClaim';
import {ResponseType} from '../../../../common/form/models/responseType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getWhyDoYouDisagreeForm = async (claimId: string, type: ResponseType): Promise<WhyDoYouDisagreeForm> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const whyDoYouDisagreeForm = new WhyDoYouDisagreeForm();
    whyDoYouDisagreeForm.claimAmount = claim.totalClaimAmount;

    if (type === ResponseType.PART_ADMISSION && claim.partialAdmission?.whyDoYouDisagree) {
      whyDoYouDisagreeForm.whyDoYouDisagree = claim.partialAdmission.whyDoYouDisagree;
      return whyDoYouDisagreeForm;
    } else if (type === ResponseType.FULL_DEFENCE && claim.rejectAllOfClaim?.whyDoYouDisagree) {
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

const saveWhyDoYouDisagreeData = async (claimId: string, form: WhyDoYouDisagree, type: ResponseType) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (type === ResponseType.PART_ADMISSION) {
      if (!claim.partialAdmission) {
        claim.partialAdmission = new PartialAdmission();
      }
      claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree(form.text);
    } else if (type === ResponseType.FULL_DEFENCE) {
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
