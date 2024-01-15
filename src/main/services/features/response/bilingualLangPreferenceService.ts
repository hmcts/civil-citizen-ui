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
    claim.claimBilingualLanguagePreference = form.option === ClaimBilingualLanguagePreference.ENGLISH ? ClaimBilingualLanguagePreference.ENGLISH : ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantBilingualLangPreference = async (userId: string, form: GenericYesNo) => {
  try {
    const claim = await getCaseDataFromStore(userId);
    claim.claimantBilingualLanguagePreference = form.option === ClaimBilingualLanguagePreference.ENGLISH ? ClaimBilingualLanguagePreference.ENGLISH : ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    await saveDraftClaim(userId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim.claimBilingualLanguagePreference) {
    claim.claimBilingualLanguagePreference = undefined;
  }
  return claim;
};

export {
  getBilingualLangPreference,
  saveBilingualLangPreference,
  saveClaimantBilingualLangPreference,
};
