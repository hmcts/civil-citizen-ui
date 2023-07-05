import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {CCDRespondentLiPResponse, CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

describe('translate respondentLipResponse to CUI model', () => {
  it('should translate Bilingual response', () => {
    //Given
    const ccdRespondLipResponse : CCDRespondentLiPResponse = {
      respondent1MediationLiPResponse: undefined,
      respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH,
    };
    //When
    const responseLang = toCUIClaimBilingualLangPreference(ccdRespondLipResponse.respondent1ResponseLanguage);
    //then
    expect(responseLang).toBe(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH);

  });

  it('should translate response lang = ENGLISH correctly', () => {
    //Given
    const ccdRespondLipResponse : CCDRespondentLiPResponse = {
      respondent1MediationLiPResponse: undefined,
      respondent1ResponseLanguage: CCDRespondentResponseLanguage.ENGLISH,
    };
    //When
    const responseLang = toCUIClaimBilingualLangPreference(ccdRespondLipResponse.respondent1ResponseLanguage);
    //then
    expect(responseLang).toBe(ClaimBilingualLanguagePreference.ENGLISH);

  });

  it('when response language is undefined', () => {
    //Given
    const ccdRespondLipResponse : CCDRespondentLiPResponse = {
      respondent1MediationLiPResponse: undefined,
      respondent1ResponseLanguage: undefined,
    };
    //When
    const responseLang = toCUIClaimBilingualLangPreference(ccdRespondLipResponse.respondent1ResponseLanguage);
    //then
    expect(responseLang).toBe(undefined);

  });
});
