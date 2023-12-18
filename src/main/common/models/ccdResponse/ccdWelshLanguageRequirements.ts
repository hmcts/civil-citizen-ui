import {ClaimBilingualLanguagePreference} from "models/claimBilingualLanguagePreference";

export interface CCDWelshLanguageRequirements {
  evidence?: CCDLanguage ,
  court?: CCDLanguage,
  documents?: CCDLanguage,
}

export enum CCDLanguage {
   WELSH =  'WELSH',
   ENGLISH = 'ENGLISH',
   BOTH = 'BOTH',
}
export const toCCDLanguage = (language: ClaimBilingualLanguagePreference): CCDLanguage => {
  switch(language) {
    case ClaimBilingualLanguagePreference.ENGLISH :
      return CCDLanguage.ENGLISH;
    case ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH:
      return CCDLanguage.BOTH;
    default: return undefined;
  }
};
