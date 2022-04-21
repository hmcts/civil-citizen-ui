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
      console.log(totalClaimAmount);
      if (claim.partialAdmission?.howMuchHaveYouPaid) {
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
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data.partialAdmission) {
        case_data.partialAdmission.howMuchHaveYouPaid = howMuchHaveYouPaid;
      } else {
        case_data.partialAdmission = new PartialAdmission();
        case_data.partialAdmission.howMuchHaveYouPaid = howMuchHaveYouPaid;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public buildHowMuchHaveYouPaid(amount?: number, totalClaimAmount?: number, year?: string, month?: string, day?: string, text?: string): HowMuchHaveYouPaid {
    console.log('Total claim amount is ' + totalClaimAmount);
    return new HowMuchHaveYouPaid(amount, totalClaimAmount, year, month, day, text);
  }

}

const howMuchHaveYouPaidService = new HowMuchHaveYouPaidService();
export default howMuchHaveYouPaidService;
