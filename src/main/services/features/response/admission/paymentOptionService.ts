import PaymentOption from '../../../../common/form/models/admission/paymentOption/paymentOption';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import PaymentOptionType
  from '../../../../common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from '../../../../common/models/claim';
import {ResponseType} from '../../../../common/form/models/responseType';
import {PartialAdmission} from '../../../../common/models/partialAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getPaymentOptionForm = async (claimId: string, responseType : ResponseType): Promise<PaymentOption> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (isFullAdmission(responseType) && claim?.isFullAdmissionPaymentOptionExists()) {
      return new PaymentOption(PaymentOptionType[claim.paymentOption as keyof typeof PaymentOptionType]);
    } else if (isPartAdmission(responseType) && claim?.isPartialAdmissionPaymentOptionExists()) {
      return new PaymentOption(PaymentOptionType[claim.partialAdmission.paymentOption as keyof typeof PaymentOptionType]);    
    }
    return new PaymentOption();
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

const savePaymentOptionData = async (claimId: string, form: PaymentOption, responseType: ResponseType) => {  
  try {
    let claim: Claim = await getCaseDataFromStore(claimId);
    if (!claim) {
      claim = new Claim();
    }  
    if (isFullAdmission(responseType)) {
      claim.paymentOption = form.paymentType; 
    } else if (isPartAdmission(responseType)) {
      if (!claim.partialAdmission) {
        claim.partialAdmission = new PartialAdmission();
      }
      claim.partialAdmission.paymentOption = form.paymentType; 
    }

    if (!form.paymentOptionBySetDateSelected()) {
      logger.info('Resetting paymentDate to empty if paymentOptionType not BY_SET_DATE');
      if (isFullAdmission(responseType)) {
        claim.paymentDate = undefined;
      } else if (isPartAdmission(responseType)) {
        claim.partialAdmission.paymentDate = undefined;    
      }
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
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
