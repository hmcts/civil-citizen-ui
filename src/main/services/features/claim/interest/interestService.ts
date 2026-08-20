import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Interest} from 'form/models/interest/interest';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {Claim} from 'models/claim';
import {Logger} from'@hmcts/nodejs-logging';

const logger = Logger.getLogger('interestService');

const deleteSameRateInterest = (claim: Claim) => {
  delete claim.interest.sameRateInterestSelection;
  delete claim.interest.interestClaimFrom;
  delete claim.interest.interestStartDate;
  delete claim.interest.interestEndDate;
};

const deleteBreakDownInterest = (claim: Claim) => {
  delete claim.interest.totalInterest;
};

const getInterest = async (req: AppRequest): Promise<Interest> => {
  try {
    const draftResult = await getDraftClaim(req);
    const claim: Claim = Object.assign(new Claim(), draftResult?.claimResponse?.case_data as unknown as Claim);
    return Object.assign(new Interest(), claim.interest);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveInterest = async (req: AppRequest, value: unknown, interestPropertyName: string): Promise<void> => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[interestService] no draft claim found to update');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

    if (claim.interest) {

      if (claim.interest.interestClaimOptions) {
        if (claim.interest.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST) {
          // removing values all values from BREAK_DOWN_INTEREST
          deleteBreakDownInterest(claim);
        } else {
          // removing values all values from SAME_RATE_INTEREST
          deleteSameRateInterest(claim);
        }
      }

      (claim.interest as unknown as Record<string, unknown>)[interestPropertyName] = value;
    } else {
      const interest: Interest = new Interest();
      (interest as unknown as Record<string, unknown>)[interestPropertyName] = value;
      claim.interest = interest;
    }

    if(draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getInterest,
  saveInterest,
};
