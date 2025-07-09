import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

export const toCUIClaimBilingualLangPreference = (responseLanguage: string) : ClaimBilingualLanguagePreference => {
  switch(responseLanguage) {
    case 'BOTH' :
      return ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    case 'ENGLISH' :
      return ClaimBilingualLanguagePreference.ENGLISH;
    case 'WELSH' :
      return ClaimBilingualLanguagePreference.WELSH;
    default: return undefined;
  }
};
