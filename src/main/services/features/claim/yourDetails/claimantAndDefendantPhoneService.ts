import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';
import {Party} from '../../../../common/models/party';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

const getTelephone = async (claimId:string, citizenType: ClaimantOrDefendant) => {
  try {
    const claim = await getCaseDataFromStore(claimId);

    if (claim.applicant1 && citizenType === ClaimantOrDefendant.CLAIMANT) {
      return new CitizenTelephoneNumber(claim.applicant1.phoneNumber);
    } else if (claim.respondent1 && citizenType === ClaimantOrDefendant.DEFENDANT) {
      return new CitizenTelephoneNumber(claim.respondent1.phoneNumber);
    }

    return new CitizenTelephoneNumber();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveTelephone = async (claimId:string,form: CitizenTelephoneNumber,citizenType: ClaimantOrDefendant) => {
  try {
    const claim = await getCaseDataFromStore(claimId);

    if (citizenType === ClaimantOrDefendant.CLAIMANT) {
      !claim.applicant1 ? claim.applicant1 = new Party() : claim;
      claim.applicant1.phoneNumber = form.telephoneNumber;
    } else if (citizenType === ClaimantOrDefendant.DEFENDANT) {
      !claim.respondent1 ? claim.respondent1 = new Party() : claim;
      claim.respondent1.phoneNumber = form.telephoneNumber;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getTelephone,
  saveTelephone,
};
