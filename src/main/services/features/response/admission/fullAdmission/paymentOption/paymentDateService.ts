import {getCaseDataFromStore, saveDraftClaim} from '../../../../../../modules/draft-store/draftStoreService';
import {ResponseType} from '../../../../../../common/form/models/responseType';
import {PartialAdmission} from '../../../../../../common/models/partialAdmission';
import {PaymentDate} from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {PaymentIntention} from '../../../../../../common/form/models/admission/partialAdmission/paymentIntention';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateService');


class PaymentDateService {

  public async getPaymentDate(claimId: string, responseType: ResponseType): Promise<PaymentDate> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (responseType === ResponseType.PART_ADMISSION && claim?.partialAdmission?.paymentIntention?.paymentDate) {
        return this.setDate(claim.partialAdmission.paymentIntention.paymentDate);
      } else if (claim?.paymentDate) {
        return this.setDate(claim.paymentDate);
      }
      return undefined;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePaymentDate(claimId: string, paymentDate: Date, responseType: ResponseType) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (responseType === ResponseType.PART_ADMISSION) {
        if (!case_data.partialAdmission) {
          case_data.partialAdmission = new PartialAdmission();
        }
        if (!case_data.partialAdmission?.paymentIntention?.paymentDate) {
          case_data.partialAdmission.paymentIntention = new PaymentIntention();
        }
        case_data.partialAdmission.paymentIntention.paymentDate = paymentDate;
      } else {
        if (!case_data.paymentDate) {
          case_data.paymentDate = new Date();
        }
        case_data.paymentDate = paymentDate;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  private setDate(claimPaymentDate: Date): PaymentDate {

    const dateOfPayment = new Date(claimPaymentDate);
    const paymentDate = new PaymentDate();
    paymentDate.date = dateOfPayment;
    paymentDate.year = dateOfPayment.getFullYear();
    paymentDate.month = dateOfPayment.getMonth() + 1;
    paymentDate.day = dateOfPayment.getDate();
    return paymentDate;

  }

}

const paymentDateService = new PaymentDateService();
export default paymentDateService;
