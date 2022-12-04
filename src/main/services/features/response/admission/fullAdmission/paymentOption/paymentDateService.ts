import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateService');

export class PaymentDateService {
  public async getPaymentDate(claimId: string, responseType: ResponseType): Promise<PaymentDate> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (responseType === ResponseType.PART_ADMISSION && claim?.partialAdmission?.paymentIntention?.paymentDate) {
        return this.setDate(claim.partialAdmission.paymentIntention.paymentDate);
      } else if (claim?.fullAdmission?.paymentIntention?.paymentDate) {
        return this.setDate(claim.fullAdmission.paymentIntention.paymentDate);
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
          const paymentType = case_data.partialAdmission?.paymentIntention?.paymentOption;
          case_data.partialAdmission.paymentIntention = new PaymentIntention();
          case_data.partialAdmission.paymentIntention.paymentOption = paymentType;
        }
        case_data.partialAdmission.paymentIntention.paymentDate = paymentDate;
      } else {
        if (!case_data.fullAdmission?.paymentIntention?.paymentDate) {
          case_data.fullAdmission = new FullAdmission();
          case_data.fullAdmission.paymentIntention = new PaymentIntention();
          case_data.fullAdmission.paymentIntention.paymentDate = new Date();
        }
        case_data.fullAdmission.paymentIntention.paymentDate = paymentDate;
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

export const paymentDateService = new PaymentDateService();
