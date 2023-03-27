import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {toCCDWelshLanguageRequirements} from 'services/translation/response/convertToCCDWelshLanguageRequirements';
import {CCDLanguage, CCDWelshLanguageRequirements} from 'models/ccdResponse/ccdWelshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';

describe('translate Welsh Language requirement to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();

  it('should return undefined if items doesnt exist', () => {
    //given
    const expected: CCDWelshLanguageRequirements = {
      'court': undefined,
      'documents': undefined,
      'evidence': undefined,
    };
    //When
    const welshLanguageRequirementsCCD = toCCDWelshLanguageRequirements( claim.directionQuestionnaire.welshLanguageRequirements);
    //then
    expect(welshLanguageRequirementsCCD).toEqual(expected);
  });

  it('should return item when data set', () => {
    //given
    claim.directionQuestionnaire.welshLanguageRequirements = {
      language : {
        speakLanguage: LanguageOptions.ENGLISH,
        documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH,
      },
    };
    const expected: CCDWelshLanguageRequirements = {
      'court': CCDLanguage.ENGLISH,
      'documents': CCDLanguage.BOTH,
      'evidence': undefined,
    };

    //When
    const welshLanguageRequirementsCCD = toCCDWelshLanguageRequirements( claim.directionQuestionnaire.welshLanguageRequirements);
    //then
    expect(welshLanguageRequirementsCCD).toEqual(expected);
  });

});
