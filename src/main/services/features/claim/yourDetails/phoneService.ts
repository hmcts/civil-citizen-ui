import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';
import {Party} from '../../../../common/models/party';
import {Claim} from '../../../../common/models/claim';
import {PartyPhone} from '../../../../common/models/PartyPhone';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

const getTelephone = async (claimId: string, citizenType: ClaimantOrDefendant) => {
  try {
    const claim = await getCaseDataFromStore(claimId);

    if (claim.applicant1 && citizenType === ClaimantOrDefendant.CLAIMANT) {
      return new CitizenTelephoneNumber(claim.applicant1?.partyPhone?.phone);
    } else if (claim.respondent1 && citizenType === ClaimantOrDefendant.DEFENDANT) {
      return new CitizenTelephoneNumber(claim.respondent1?.partyPhone?.phone);
    }

    return new CitizenTelephoneNumber();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveTelephone = async (claimId: string, form: CitizenTelephoneNumber, citizenType: ClaimantOrDefendant) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    saveForm(claim, form, citizenType);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveForm = (claim: Claim, form: CitizenTelephoneNumber, citizenType: ClaimantOrDefendant) => {
  if (citizenType === ClaimantOrDefendant.CLAIMANT) {
    if (!claim.applicant1) {
      claim.applicant1 = new Party();
    }
    claim.applicant1.partyPhone = new PartyPhone(form.telephoneNumber, form.ccdPhoneExist);
  } else if (citizenType === ClaimantOrDefendant.DEFENDANT) {
    if (!claim.respondent1) {
      claim.respondent1 = new Party();
    }
    claim.respondent1.partyPhone = new PartyPhone(form.telephoneNumber, form.ccdPhoneExist);
  }
};

export {
  getTelephone,
  saveTelephone,
};

