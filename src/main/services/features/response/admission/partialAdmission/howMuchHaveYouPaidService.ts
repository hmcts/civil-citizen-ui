import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {HowMuchHaveYouPaid} from '../../../../../common/form/models/admission/partialAdmission/howMuchHaveYouPaid';
import {PartialAdmission} from '../../../../../common/models/partialAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('howMuchHaveYouPaidService');


class HowMuchHaveYouPaidService {

  public async getHowMuchHaveYouPaid(claimId: string): Promise<HowMuchHaveYouPaid> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      const totalClaimAmount = claim?.totalClaimAmount;
      if (claim?.partialAdmission?.howMuchHaveYouPaid) {
        claim.partialAdmission.howMuchHaveYouPaid.totalClaimAmount = totalClaimAmount;
        return claim.partialAdmission.howMuchHaveYouPaid;
      }
      return new HowMuchHaveYouPaid({totalClaimAmount: totalClaimAmount});
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveHowMuchHaveYouPaid(claimId: string, howMuchHaveYouPaid: HowMuchHaveYouPaid) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim) {
        howMuchHaveYouPaid.totalClaimAmount = claim.totalClaimAmount;
        if (!claim.partialAdmission) {
          claim.partialAdmission = new PartialAdmission();
        }
        claim.partialAdmission.howMuchHaveYouPaid = howMuchHaveYouPaid;
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
