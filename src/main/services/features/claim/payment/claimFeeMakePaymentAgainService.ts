
import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {FeeType} from 'form/models/helpWithFees/feeType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ClaimFeeMakePaymentAgainService');

export const getRedirectUrl = async (claimId: string,  req: AppRequest): Promise<string> => {
  try {
    const draftId = req.session?.draftId;
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    const claim = await getDraftClaim(req);
    if(!claim.claimDetails) {
      claim.claimDetails = {};
    }
    claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    await updateDraftClaim(req, claim, draftId);
    return paymentRedirectInformation?.nextUrl;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
