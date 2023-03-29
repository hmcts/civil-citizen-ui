import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {CCDLanguage} from 'models/ccdResponse/ccdWelshLanguageRequirements';

export const toCCDWelshLanguageRequirements = (welshLanguageRequirements: WelshLanguageRequirements)  => {
  return {
    evidence: toRequireLanguage(undefined),
    court: toRequireLanguage(welshLanguageRequirements?.language?.speakLanguage),
    documents: toRequireLanguage(welshLanguageRequirements?.language?.documentsLanguage),
  };
};

const toRequireLanguage = (language : string) : CCDLanguage => {
  switch(language) {
    case LanguageOptions.WELSH :
      return CCDLanguage.WELSH;
    case LanguageOptions.ENGLISH:
      return CCDLanguage.ENGLISH;
    case LanguageOptions.WELSH_AND_ENGLISH:
      return CCDLanguage.BOTH;
    default:
      return undefined;
  }
};
