import {PaymentOption} from 'common/form/models/admission/paymentOption/paymentOption';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {ResponseType} from 'common/form/models/responseType';
import {PaymentOptionType}
  from 'common/form/models/admission/paymentOption/paymentOptionType';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';
import {getTotalAmountWithInterest} from 'modules/claimDetailsService';

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

const savePaymentOptionData = async (claimId: string, form: PaymentOption, responseType: ResponseType) => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
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
    await saveDraftClaim(claimId, claim);
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
