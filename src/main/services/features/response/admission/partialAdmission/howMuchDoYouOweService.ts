import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PartialAdmission} from 'models/partialAdmission';
import {getInterestData} from 'common/utils/interestUtils';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('howMuchDoYouOweService');

export const getHowMuchDoYouOweForm = async (req: AppRequest, lang: string): Promise<HowMuchDoYouOwe> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);
    const claimHasInterest = claim.hasInterest();
    const interestDetails = claimHasInterest ? await getInterestData(claim, lang) : undefined;
    const interestAmount = (interestDetails ? Number(interestDetails.interestToDate) : undefined);
    let totalClaimAmount = claim.totalClaimAmount;
    if(totalClaimAmount && interestAmount) {
      totalClaimAmount = totalClaimAmount + interestAmount;
    }
    if (claim.partialAdmission?.howMuchDoYouOwe?.amount) {
      const admittedAmount = claim.partialAdmission.howMuchDoYouOwe.amount;
      return new HowMuchDoYouOwe(admittedAmount, totalClaimAmount);
    }
    return new HowMuchDoYouOwe(undefined, totalClaimAmount);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHowMuchDoYouOweData = async (req: AppRequest, form: HowMuchDoYouOwe) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[howMuchDoYouOweService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;
    if (!claim.partialAdmission) {
      claim.partialAdmission = new PartialAdmission();
    }
    claim.partialAdmission.howMuchDoYouOwe = form;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

