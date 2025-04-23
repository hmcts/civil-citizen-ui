import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {Request} from 'express';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getBilingualLangPreference = async (req: Request): Promise<GenericYesNo> => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    if (claim.claimBilingualLanguagePreference) {
      return new GenericYesNo(claim.claimBilingualLanguagePreference);
    }
    return new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveBilingualLangPreference = async (claimId: string, form: GenericYesNo) => {
  try {
    const claim = await getClaim(claimId);
    claim.claimBilingualLanguagePreference = await getSelectedLanguage(form.option);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantBilingualLangPreference = async (userId: string, form: GenericYesNo) => {
  try {
    const claim = await getCaseDataFromStore(userId);
    claim.claimantBilingualLanguagePreference = await getSelectedLanguage(form.option);
    await saveDraftClaim(userId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getSelectedLanguage = async (language: string) => {
  switch(language) {
    case ClaimBilingualLanguagePreference.ENGLISH:
      return ClaimBilingualLanguagePreference.ENGLISH;
    case ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH:
      return ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    case ClaimBilingualLanguagePreference.WELSH:
      return ClaimBilingualLanguagePreference.WELSH;
    default:
      return undefined;
  }
};
const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim.claimBilingualLanguagePreference) {
    claim.claimBilingualLanguagePreference = undefined;
  }
  return claim;
};

const getCookieLanguage =  (isWelsh: boolean, language: string) => {
  switch (language) {
    case ClaimBilingualLanguagePreference.ENGLISH:
      return 'en';
    case ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH:
      return isWelsh ? 'en' : 'cy';
    case ClaimBilingualLanguagePreference.WELSH:
      return 'cy';
    default:
      return 'en';
  }
};

export {
  getBilingualLangPreference,
  saveBilingualLangPreference,
  saveClaimantBilingualLangPreference,
  getCookieLanguage,
};
