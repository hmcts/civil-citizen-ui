import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ClaimantPhoneNumber} from '../../../common/form/models/claim/claimantPhoneNumber';
import {AppRequest} from '../../../common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

const getClaimantPhone = async (claimId:string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.applicant1) {
      return new ClaimantPhoneNumber(claim.applicant1.phoneNumber);
    }
    return new ClaimantPhoneNumber();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantPhone = async (claimId:string,form: ClaimantPhoneNumber) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.applicant1.phoneNumber = form.phoneNumber;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getUserId = (): string => {
  let req: AppRequest;
  return req.session.user.id;
};

export {
  getClaimantPhone,
  saveClaimantPhone,
  getUserId,
};
