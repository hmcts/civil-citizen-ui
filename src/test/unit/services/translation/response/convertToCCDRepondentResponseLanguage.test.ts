import {CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {Claim} from 'models/claim';
import {toCCDRespondentResponseLanguage} from 'services/translation/response/convertToCCDRespondentLiPResponse';

describe('translate claimBilingualLanguagePreference to CCD model', () => {
  it('should translate Bilingual response ', () => {
    //Given
    const claim = new Claim();
    claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH
    //When
    const responseLang = toCCDRespondentResponseLanguage(claim.claimBilingualLanguagePreference);
    //then
    expect(responseLang).toBe(CCDRespondentResponseLanguage.BOTH);

  });

  it('should translate response lang = ENGLISH correctly ', () => {
    //Given
    const claim = new Claim();
    claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH
    //When
    const responseLang = toCCDRespondentResponseLanguage(claim.claimBilingualLanguagePreference);
    //then
    expect(responseLang).toBe(CCDRespondentResponseLanguage.ENGLISH);

  });
});
