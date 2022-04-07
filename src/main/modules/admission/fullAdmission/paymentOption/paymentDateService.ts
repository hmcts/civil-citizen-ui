import {getDraftClaimFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {PaymentDate} from '../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateService');


class PaymentDateService {

  public async getPaymentDate(claimId: string): Promise<PaymentDate> {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse?.case_data?.paymentDate) {
        return civilClaimResponse.case_data.paymentDate;
      }
      return new PaymentDate();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePaymentDate(claimId: string, paymentDate: PaymentDate) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse?.case_data?.paymentDate) {
        civilClaimResponse.case_data.paymentDate = paymentDate;
      } else {
        const paymentDate = new PaymentDate();
        civilClaimResponse.case_data.paymentDate = paymentDate;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
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
