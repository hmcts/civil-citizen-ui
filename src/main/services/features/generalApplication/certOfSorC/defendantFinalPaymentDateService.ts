import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';
import {Request} from 'express';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantFinalPaymentDateService');

export class DefendantFinalPaymentDateService {
  public async getDefendantResponse( req: Request): Promise<DefendantFinalPaymentDate> {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      if (claim?.certificateOfSatisfactionOrCanceled?.defendantFinalPaymentDate) {
        return this.setDate(claim.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate);
      }
      return undefined;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePaymentDate(req: Request, paymentDate: DefendantFinalPaymentDate) {
    try {
      const claimId = req.params.id;
      const case_data = await getClaimById(claimId, req, true);
      const redisKey = generateRedisKey(<AppRequest>req);
      if (!case_data.certificateOfSatisfactionOrCanceled) {
        case_data.certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();
      }
      if (!case_data.certificateOfSatisfactionOrCanceled?.defendantFinalPaymentDate) {
        case_data.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate = new DefendantFinalPaymentDate();
      }
      case_data.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate = paymentDate;

      await saveDraftClaim(redisKey, case_data);
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
