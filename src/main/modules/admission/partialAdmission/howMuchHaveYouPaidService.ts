import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {HowMuchHaveYouPaid} from '../../../common/form/models/admission/partialAdmission/howMuchHaveYouPaid';
import {Claim} from '../../../common/models/claim';
import {PartialAdmission} from '../../../common/models/partialAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('howMuchHaveYouPaidService');


class HowMuchHaveYouPaidService {

  public async getHowMuchHaveYouPaid(claimId: string): Promise<HowMuchHaveYouPaid> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      const totalClaimAmount = claim.totalClaimAmount;
      if (claim?.partialAdmission?.howMuchHaveYouPaid) {
        claim.partialAdmission.howMuchHaveYouPaid.totalClaimAmount = totalClaimAmount;
        return claim.partialAdmission.howMuchHaveYouPaid;
      }
      return new HowMuchHaveYouPaid(undefined, totalClaimAmount, undefined, undefined, undefined, undefined);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveHowMuchHaveYouPaid(claimId: string, howMuchHaveYouPaid: HowMuchHaveYouPaid) {
    try {
      const claim = await getCaseDataFromStore(claimId) || new Claim();
      howMuchHaveYouPaid.totalClaimAmount = claim.totalClaimAmount;
      if (claim.partialAdmission) {
        claim.partialAdmission.howMuchHaveYouPaid = howMuchHaveYouPaid;
      } else {
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.howMuchHaveYouPaid = howMuchHaveYouPaid;
      }
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public buildHowMuchHaveYouPaid(amount?: number, totalClaimAmount?: number, year?: string, month?: string, day?: string, text?: string): HowMuchHaveYouPaid {
    return new HowMuchHaveYouPaid(amount, totalClaimAmount, year, month, day, text);
  }

  public async getTotalClaimAmount(claimId: string) : Promise<number> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      return claim.totalClaimAmount;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

}

const howMuchHaveYouPaidService = new HowMuchHaveYouPaidService();
export default howMuchHaveYouPaidService;
