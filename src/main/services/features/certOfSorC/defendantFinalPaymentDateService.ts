import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
// import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';
// import {PaymentDate} from "form/models/admission/fullAdmission/paymentOption/paymentDate";
// import {DefendantPaymentDate} from "form/models/admission/partialAdmission/defendantPaymentDate";
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';

//import {BaseDate} from "form/models/admission/fullAdmission/baseDate";
//import {ResponseType} from "form/models/responseType";
//import {PaymentDate} from "form/models/admission/fullAdmission/paymentOption/paymentDate";

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantFinalPaymentDateService');

export class DefendantFinalPaymentDateService {
  public async getDefendantResponse(claimId: string): Promise<DefendantFinalPaymentDate> {
    try {
      const claim = await getCaseDataFromStore(claimId, true);
      if (claim?.certificateOfSatisfactionOrCanceled?.defendantFinalPaymentDate) {
        return this.setDate(claim.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate);
      }
      // const certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();
      // return Object.assign(certificateOfSatisfactionOrCanceled, claim.certificateOfSatisfactionOrCanceled);
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
// const getDefendantResponse = async (claimId: string): Promise<CertificateOfSatisfactionOrCanceled> => {
//   try {
//     const claim = await getCaseDataFromStore(claimId, true);
//     if (claim?.certificateOfSatisfactionOrCanceled?.defendantFinalPaymentDate){
//       return this.setDate(claim.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate);
//     }
//     const certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();
//     return Object.assign(certificateOfSatisfactionOrCanceled, claim.certificateOfSatisfactionOrCanceled);
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// };

// const saveFinalPaymentDateResponse = async (claimId: string, value: any, claimantResponsePropertyName: string, parentPropertyName?: string): Promise<void> => {
//   try {
//     const claim: any = await getCaseDataFromStore(claimId, true);
//     await saveDraftClaim(claimId, claim, true);
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// };
//
// export {
//   getDefendantResponse,
//   saveFinalPaymentDateResponse,
// };
