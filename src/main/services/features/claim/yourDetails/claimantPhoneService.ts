import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

const getClaimantPhone = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.applicant1) {
      return new CitizenTelephoneNumber(claim.applicant1.phoneNumber);
    }
    return new CitizenTelephoneNumber();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantPhone = async (claimId: string, form: CitizenTelephoneNumber) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.applicant1.phoneNumber = form.telephoneNumber;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimantPhone,
  saveClaimantPhone,
};
