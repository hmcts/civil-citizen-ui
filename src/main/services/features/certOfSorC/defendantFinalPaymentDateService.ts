import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantFinalPaymentDateService');

export class DefendantFinalPaymentDateService {
  public async getDefendantResponse(claimId: string): Promise<DefendantFinalPaymentDate> {
    try {
      const claim = await getCaseDataFromStore(claimId, true);
      if (claim?.certificateOfSatisfactionOrCanceled?.defendantFinalPaymentDate) {
        return this.setDate(claim.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate);
      }
      return undefined;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePaymentDate(claimId: string, paymentDate: DefendantFinalPaymentDate) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (!case_data.certificateOfSatisfactionOrCanceled) {
        case_data.certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();
      }
      if (!case_data.certificateOfSatisfactionOrCanceled?.defendantFinalPaymentDate) {
        case_data.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate = new DefendantFinalPaymentDate();
      }
      case_data.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate = paymentDate;

      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  private setDate(claimPaymentDate: DefendantFinalPaymentDate): DefendantFinalPaymentDate {
    const paymentDate = new DefendantFinalPaymentDate();
    paymentDate.year = claimPaymentDate.year;
    paymentDate.month = claimPaymentDate.month;
    paymentDate.day = claimPaymentDate.day;
    return paymentDate;
  }
}

export const defendantFinalPaymentDateService = new DefendantFinalPaymentDateService();
