import {WhyDoYouDisagree} from '../../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {getResponseDraft, getResponseClaimById, updateResponseDraft} from '../../../../modules/draft-store/response/responseDraftStoreService';
import {PartialAdmission} from '../../../../common/models/partialAdmission';
import {WhyDoYouDisagreeForm} from '../../../../common/models/whyDoYouDisagreeForm';
import {RejectAllOfClaim} from '../../../../common/form/models/rejectAllOfClaim';
import {ResponseType} from '../../../../common/form/models/responseType';
import {getTotalAmountWithInterest} from 'modules/claimDetailsService';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getWhyDoYouDisagreeForm = async (req: AppRequest, type: ResponseType): Promise<WhyDoYouDisagreeForm> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);
    const whyDoYouDisagreeForm = new WhyDoYouDisagreeForm();
    whyDoYouDisagreeForm.claimAmount = await getTotalAmountWithInterest(claim);

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

const saveWhyDoYouDisagreeData = async (req: AppRequest, form: WhyDoYouDisagree, type: ResponseType) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[whyDoYouDisagreeService] no draft response found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;
    switch (type) {
      case ResponseType.PART_ADMISSION:
        if (!claim.partialAdmission) {
          claim.partialAdmission = new PartialAdmission();
        }
        claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree(form.text);
        break;
      case ResponseType.FULL_DEFENCE:
        if (!claim.rejectAllOfClaim) {
          claim.rejectAllOfClaim = new RejectAllOfClaim();
        }
        claim.rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree(form.text);
        break;
    }
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
};
