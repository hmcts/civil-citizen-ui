import PaymentOption from '../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOption';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import PaymentOptionType from '../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';
import {Claim} from '../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentOptionService');

const getPaymentOptionForm = async (claimId: string): Promise<PaymentOption> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (paymentOptionExists(claim)) {
      return new PaymentOption(PaymentOptionType[claim.paymentOption as keyof typeof PaymentOptionType]);
    }
    return new PaymentOption();
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

const savePaymentOptionData = async (claimId: string, form: PaymentOption) => {
  try {
    let claim: Claim = await getCaseDataFromStore(claimId);
    if (!claim) {
      claim = new Claim();
    }
    claim.paymentOption = form.paymentType;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

const paymentOptionExists = (claim: Claim): boolean => {
  return claim?.paymentOption?.length > 0;
};

export {
  getPaymentOptionForm,
  savePaymentOptionData,
};
