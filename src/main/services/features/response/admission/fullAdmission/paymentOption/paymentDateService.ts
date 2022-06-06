import {getCaseDataFromStore, saveDraftClaim} from '../../../../../../modules/draft-store/draftStoreService';
import {PaymentDate} from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {Claim} from '../../../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateService');


class PaymentDateService {

  public async getPaymentDate(claimId: string): Promise<Date> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim?.paymentDate) {
        return claim.paymentDate;
      }
      return undefined;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePaymentDate(claimId: string, paymentDate: Date) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      case_data.paymentDate = paymentDate;
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public buildPaymentDate(year?: string, month?: string, day?: string): PaymentDate {
    return new PaymentDate(year, month, day);
  }

}

const paymentDateService = new PaymentDateService();
export default paymentDateService;
