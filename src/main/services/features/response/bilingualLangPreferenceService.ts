import {AppRequest} from 'models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'common/models/claim';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getBilingualLangPreference = (draftResult: DraftClaimManagerResult): GenericYesNo => {
  const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
  if (claim.claimBilingualLanguagePreference) {
    return new GenericYesNo(claim.claimBilingualLanguagePreference);
  }
  return new GenericYesNo();
};

const saveBilingualLangPreference = async (req: AppRequest, form: GenericYesNo) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[bilingualLangPreferenceService] no response draft found');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;
    claim.claimBilingualLanguagePreference = await getSelectedLanguage(form.option);

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantBilingualLangPreference = async (req: AppRequest, form: GenericYesNo) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[bilingualLangPreferenceService] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    claim.claimantBilingualLanguagePreference = await getSelectedLanguage(form.option);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, claim, draftId);
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
