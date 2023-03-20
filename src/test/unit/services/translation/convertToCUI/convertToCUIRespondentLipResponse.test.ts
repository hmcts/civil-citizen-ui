import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {CCDRespondentLiPResponse, CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

describe('translate respondentLipResponse to CUI model', () => {
  it('should translate Bilingual response ', () => {
    //Given
    const ccdRespondLipResponse : CCDRespondentLiPResponse = {
      respondent1LiPFinancialDetails: undefined,
      respondent1MediationLiPResponse: undefined,
      respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH,
    };
    //When
    const responseLang = toCUIClaimBilingualLangPreference(ccdRespondLipResponse.respondent1ResponseLanguage);
    //then
    expect(ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH).toBe(responseLang);

  });

  it('should translate response lang = ENGLISH correctly ', () => {
    //Given
    const ccdRespondLipResponse : CCDRespondentLiPResponse = {
      respondent1LiPFinancialDetails: undefined,
      respondent1MediationLiPResponse: undefined,
      respondent1ResponseLanguage: CCDRespondentResponseLanguage.ENGLISH,
    };
    //When
    const responseLang = toCUIClaimBilingualLangPreference(ccdRespondLipResponse.respondent1ResponseLanguage);
    //then
    expect(ClaimBilingualLanguagePreference.ENGLISH).toBe(responseLang);

  });
});
