import {PaymentOption} from 'common/form/models/admission/paymentOption/paymentOption';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'common/models/claim';
import {ResponseType} from 'common/form/models/responseType';
import {PaymentOptionType}
  from 'common/form/models/admission/paymentOption/paymentOptionType';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';
import {getTotalAmountWithInterest} from 'modules/claimDetailsService';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getPaymentOptionForm = async (claim: Claim, responseType : ResponseType): Promise<PaymentOption> => {
  try {
    const totalClaimAmount = isPartAdmission(responseType) ? claim.partialAdmissionPaymentAmount() : await getTotalAmountWithInterest(claim);
    const paymentOption = getPaymentOptionType(claim, responseType);
    return new PaymentOption(paymentOption, totalClaimAmount);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getPaymentOptionType = (claim: Claim, responseType: ResponseType): PaymentOptionType | undefined => {
  if (isFullAdmission(responseType) && claim.isFullAdmissionPaymentOptionExists()) {
    return PaymentOptionType[claim.fullAdmission.paymentIntention.paymentOption as keyof typeof PaymentOptionType];
  }

  if (isPartAdmission(responseType) && claim.isPartialAdmissionPaymentOptionExists()) {
    return PaymentOptionType[claim.partialAdmission.paymentIntention.paymentOption as keyof typeof PaymentOptionType];
  }

  return undefined;
};

const savePaymentOptionData = async (req: AppRequest, form: PaymentOption, responseType: ResponseType) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[paymentOptionService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (isFullAdmission(responseType)) {
      if (!claim.fullAdmission?.paymentIntention) {
        claim.fullAdmission = new FullAdmission();
        claim.fullAdmission.paymentIntention = new PaymentIntention();
      }
      claim.fullAdmission.paymentIntention.paymentOption = form.paymentType;
    } else if (isPartAdmission(responseType)) {
      if (!claim.partialAdmission.paymentIntention) {
        claim.partialAdmission.paymentIntention = new PaymentIntention();
      }
      claim.partialAdmission.paymentIntention.paymentOption = form.paymentType;
    }

    if (!form.paymentOptionBySetDateSelected()) {
      logger.info('Resetting paymentDate to empty if paymentOptionType not BY_SET_DATE');
      if (isFullAdmission(responseType)) {
        claim.fullAdmission.paymentIntention.paymentDate = undefined;
      } else if (isPartAdmission(responseType)) {
        claim.partialAdmission.paymentIntention.paymentDate = undefined;
      }
    }

    if (form.paymentOptionByImmediately()) {
      delete claim.statementOfMeans;
    }
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const isFullAdmission = (type: ResponseType): boolean => {
  return type === ResponseType.FULL_ADMISSION;
};

const isPartAdmission = (type: ResponseType): boolean => {
  return type === ResponseType.PART_ADMISSION;
};

export {
  getPaymentOptionForm,
  savePaymentOptionData,
};
