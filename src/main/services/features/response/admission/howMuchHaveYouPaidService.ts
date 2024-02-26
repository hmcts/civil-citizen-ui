import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {PartialAdmission} from 'models/partialAdmission';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {ResponseType} from 'form/models/responseType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('howMuchHaveYouPaidService');

class HowMuchHaveYouPaidService {

  public async getHowMuchHaveYouPaid(claimId: string, type: ResponseType): Promise<HowMuchHaveYouPaid> {
    try {
      const claim = await getCaseDataFromStore(claimId);
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

  public async saveHowMuchHaveYouPaid(claimId: string, howMuchHaveYouPaid: HowMuchHaveYouPaid, type: ResponseType) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim) {
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
      }
      await saveDraftClaim(claimId, claim);
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
