import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {PaymentDate} from '../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {Claim} from '../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateService');


class PaymentDateService {

  public async getPaymentDate(claimId: string): Promise<PaymentDate> {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.paymentDate) {
        return case_data.paymentDate;
      }
      return new PaymentDate();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePaymentDate(claimId: string, paymentDate: PaymentDate) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data.paymentDate) {
        case_data.paymentDate = paymentDate;
      } else {
        const paymentDate = new PaymentDate();
        case_data.paymentDate = paymentDate;
      }
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
