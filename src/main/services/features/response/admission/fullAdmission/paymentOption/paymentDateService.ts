import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateService');

export class PaymentDateService {
  public async getPaymentDate(req: AppRequest, responseType: ResponseType): Promise<PaymentDate> {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
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

  public async savePaymentDate(req: AppRequest, paymentDate: Date, responseType: ResponseType) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[paymentDateService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (responseType === ResponseType.PART_ADMISSION) {
        if (!claim.partialAdmission) {
          claim.partialAdmission = new PartialAdmission();
        }
        if (!claim.partialAdmission?.paymentIntention?.paymentDate) {
          const paymentType = claim.partialAdmission?.paymentIntention?.paymentOption;
          claim.partialAdmission.paymentIntention = new PaymentIntention();
          claim.partialAdmission.paymentIntention.paymentOption = paymentType;
        }
        claim.partialAdmission.paymentIntention.paymentDate = paymentDate;
      } else if (responseType === ResponseType.FULL_ADMISSION) {
        if (!claim.fullAdmission) {
          claim.fullAdmission = new FullAdmission();
        }
        if (!claim.fullAdmission?.paymentIntention?.paymentDate) {
          const paymentType = claim.fullAdmission?.paymentIntention?.paymentOption;
          claim.fullAdmission.paymentIntention = new PaymentIntention();
          claim.fullAdmission.paymentIntention.paymentOption = paymentType;
        }
        claim.fullAdmission.paymentIntention.paymentDate = paymentDate;
      }
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
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
