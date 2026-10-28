import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {PartialAdmission} from 'models/partialAdmission';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('howMuchHaveYouPaidService');

class HowMuchHaveYouPaidService {

  public async getHowMuchHaveYouPaid(req: AppRequest, type: ResponseType): Promise<HowMuchHaveYouPaid> {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      const totalClaimAmount = claim?.totalClaimAmount;
      if (type === ResponseType.PART_ADMISSION) {
        if (claim?.partialAdmission?.howMuchHaveYouPaid) {
          const paymentDate = new Date(claim.partialAdmission.howMuchHaveYouPaid.date);
          claim.partialAdmission.howMuchHaveYouPaid.year = paymentDate.getFullYear();
          claim.partialAdmission.howMuchHaveYouPaid.month = paymentDate.getMonth() + 1;
          claim.partialAdmission.howMuchHaveYouPaid.day = paymentDate.getDate();
          claim.partialAdmission.howMuchHaveYouPaid.totalClaimAmount = totalClaimAmount;
          return claim.partialAdmission.howMuchHaveYouPaid;
        }
      } else if (claim?.rejectAllOfClaim?.howMuchHaveYouPaid) {
        claim.rejectAllOfClaim.howMuchHaveYouPaid.totalClaimAmount = totalClaimAmount;
        return claim.rejectAllOfClaim.howMuchHaveYouPaid;
      }
      return new HowMuchHaveYouPaid({totalClaimAmount: totalClaimAmount});
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveHowMuchHaveYouPaid(req: AppRequest, howMuchHaveYouPaid: HowMuchHaveYouPaid, type: ResponseType) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[howMuchHaveYouPaidService] no draft response found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;
      howMuchHaveYouPaid.totalClaimAmount = claim.totalClaimAmount;
      if (type === ResponseType.PART_ADMISSION) {
        if (!claim.partialAdmission) {
          claim.partialAdmission = new PartialAdmission();
        }
        claim.partialAdmission.howMuchHaveYouPaid = howMuchHaveYouPaid;
      } else {
        if (!claim.rejectAllOfClaim) {
          claim.rejectAllOfClaim = new RejectAllOfClaim();
        }
        claim.rejectAllOfClaim.howMuchHaveYouPaid = howMuchHaveYouPaid;
      }
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public buildHowMuchHaveYouPaid(amount?: number, totalClaimAmount?: number, year?: string, month?: string, day?: string, text?: string): HowMuchHaveYouPaid {
    return new HowMuchHaveYouPaid({
      amount: amount,
      totalClaimAmount: totalClaimAmount,
      year: year,
      month: month,
      day: day,
      text: text,
    });
  }
}

const howMuchHaveYouPaidService = new HowMuchHaveYouPaidService();
export default howMuchHaveYouPaidService;
