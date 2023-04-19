import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {CCDLanguage, CCDWelshLanguageRequirements} from 'models/ccdResponse/ccdWelshLanguageRequirements';

export const toCUIWelshLanguageRequirements = (ccdWelshLanguage: CCDWelshLanguageRequirements) : WelshLanguageRequirements => {
  if(ccdWelshLanguage){
    const welshLanguageRequirements : WelshLanguageRequirements = new WelshLanguageRequirements();
    welshLanguageRequirements.language = {
      speakLanguage: toRequireLanguage(ccdWelshLanguage.court),
      documentsLanguage: toRequireLanguage(ccdWelshLanguage.documents),
    };
    return welshLanguageRequirements;
  }
};

const toRequireLanguage = (language : CCDLanguage) : LanguageOptions => {
  switch(language) {
    case CCDLanguage.WELSH :
      return LanguageOptions.WELSH;
    case CCDLanguage.ENGLISH:
      return LanguageOptions.ENGLISH;
    case CCDLanguage.BOTH:
      return LanguageOptions.WELSH_AND_ENGLISH;
    default:
      return undefined;
  }
};
