import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getBilingualLangPreference = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.claimBilingualLanguagePreference) {
      return new GenericYesNo(claim.claimBilingualLanguagePreference);
    }
    return new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveBilingualLangPreference = async (claimId: string, form: GenericYesNo, req: Request) => {
  try {
    const claim = await getClaim(claimId, req);
    claim.claimBilingualLanguagePreference = form.option === ClaimBilingualLanguagePreference.ENGLISH ? ClaimBilingualLanguagePreference.ENGLISH : ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string, req: Request): Promise<Claim> => {
  const claim = await getClaimById(claimId, req);
  if (!claim.claimBilingualLanguagePreference) {
    claim.claimBilingualLanguagePreference = undefined;
  }
  return claim;
};

export {
  getBilingualLangPreference,
  saveBilingualLangPreference,
};
