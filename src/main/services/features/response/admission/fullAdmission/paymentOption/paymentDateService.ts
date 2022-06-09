import {getCaseDataFromStore, saveDraftClaim} from '../../../../../../modules/draft-store/draftStoreService';
import {ResponseType} from '../../../../../../common/form/models/responseType';
import {PartialAdmission} from '../../../../../../common/models/partialAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateService');


class PaymentDateService {

  public async getPaymentDate(claimId: string, responseType: ResponseType): Promise<Date> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (responseType === ResponseType.PART_ADMISSION) {
        if (claim?.partialAdmission?.paymentDate) {
          return claim.partialAdmission.paymentDate;
        }
      } else {
        if (claim?.paymentDate) {
          return claim.paymentDate;
        }
        return undefined;
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePaymentDate(claimId: string, paymentDate: Date, responseType: ResponseType) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (responseType === ResponseType.PART_ADMISSION) {
        if (case_data?.partialAdmission?.paymentDate) {
          case_data.partialAdmission.paymentDate = paymentDate;
        } else {
          case_data.partialAdmission = new PartialAdmission();
          case_data.partialAdmission.paymentDate = paymentDate;
        }
      } else {
        if (case_data?.paymentDate) {
          case_data.paymentDate = paymentDate;
        }
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

}

const paymentDateService = new PaymentDateService();
export default paymentDateService;
