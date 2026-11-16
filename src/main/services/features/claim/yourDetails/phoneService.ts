import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';
import {Party} from '../../../../common/models/party';
import {Claim} from '../../../../common/models/claim';
import {PartyPhone} from '../../../../common/models/PartyPhone';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantPhoneAsService');

const getTelephone = async (req: AppRequest, citizenType: ClaimantOrDefendant) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[phoneService] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);

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

const getTelephoneFromStore = async (claimId: string, citizenType: ClaimantOrDefendant) => {
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

const saveTelephone = async (req: AppRequest, form: CitizenTelephoneNumber, citizenType: ClaimantOrDefendant) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[phoneService] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    saveForm(claim, form, citizenType);
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveTelephoneToStore = async(claimId: string, form: CitizenTelephoneNumber, citizenType: ClaimantOrDefendant)=> {
  const claim = await getCaseDataFromStore(claimId);
  saveForm(claim, form, citizenType);
  await saveDraftClaim(claimId, claim);
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
  getTelephoneFromStore,
  saveTelephoneToStore,
};

