import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CCDLanguage, toCCDLanguage} from 'models/ccdResponse/ccdWelshLanguageRequirements';

describe('translate claimant language preference', ()=> {
  it('translate claimant language preference both', ()=> {
    //Given
    const both = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    //When
    const result = toCCDLanguage(both);
    //Then
    expect(result).toBe(CCDLanguage.BOTH);
  });
  it('translate claimant language preference English', ()=> {
    //Given
    const both = ClaimBilingualLanguagePreference.ENGLISH;
    //When
    const result = toCCDLanguage(both);
    //Then
    expect(result).toBe(CCDLanguage.ENGLISH);
  });
});
