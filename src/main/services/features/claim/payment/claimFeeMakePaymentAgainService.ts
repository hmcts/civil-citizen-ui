
import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ClaimFeeMakePaymentAgainService');

export const getRedirectUrl = async (claimId: string,  req: AppRequest): Promise<string> => {
  try {
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimFeeMakePaymentAgainService] no draft claim found');
    }

    const claim: Claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    if (!draftId) {
      throw new Error('[claimFeeMakePaymentAgainService] no draft id found');
    }

    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    await updateDraftClaim(req, claim, draftId);
    return paymentRedirectInformation?.nextUrl;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
