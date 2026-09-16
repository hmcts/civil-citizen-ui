import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {FeeType} from 'form/models/helpWithFees/feeType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ClaimFeeMakePaymentAgainService');

export const getRedirectUrl = async (claimId: string,  req: AppRequest): Promise<string> => {
  try {
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimFeeMakePaymentAgainService] no draft claim found to update');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

    claim.claimDetails.claimFeePayment = paymentRedirectInformation;

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, claim, draftId);
    return paymentRedirectInformation?.nextUrl;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
