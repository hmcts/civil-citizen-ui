import {toCUIWelshLanguageRequirements} from "services/translation/convertToCUI/convertToCUIWelshLanguageRequirements";
import {CCDLanguage, CCDWelshLanguageRequirements} from "models/ccdResponse/ccdWelshLanguageRequirements";
import {WelshLanguageRequirements} from "models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements";
import {LanguageOptions} from "models/directionsQuestionnaire/languageOptions";

describe('translate CCDWelshLanguage to CUI Welsh Language model', () => {
  it('should return undefined if CCDWelshLanguage doesnt exist', () => {
    //Given
    const input: CCDWelshLanguageRequirements = undefined;
    //When
    const output = toCUIWelshLanguageRequirements(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if CCDWelshLanguage data doesnt exist', () => {
    //Given
    const input: CCDWelshLanguageRequirements = {
      evidence: undefined,
      court: undefined,
      documents: undefined,
    };
    //When
    const output = toCUIWelshLanguageRequirements(input);
    const expected : WelshLanguageRequirements = {
      language: {
        speakLanguage: undefined,
        documentsLanguage: undefined,
      }
    }
    //Then
    expect(output).toEqual(expected);
  });

  it('should return data if CCDWelshLanguage data exist with welsh', () => {
    //Given
    const input: CCDWelshLanguageRequirements = {
      evidence: undefined,
      court: CCDLanguage.WELSH,
      documents: CCDLanguage.WELSH,
    };
    //When
    const output = toCUIWelshLanguageRequirements(input);
    const expected : WelshLanguageRequirements = {
      language: {
        speakLanguage: LanguageOptions.WELSH,
        documentsLanguage: LanguageOptions.WELSH,
      }
    }
    //Then
    expect(output).toEqual(expected);
  });

  it('should return data if CCDWelshLanguage data exist with english', () => {
    //Given
    const input: CCDWelshLanguageRequirements = {
      evidence: undefined,
      court: CCDLanguage.ENGLISH,
      documents: CCDLanguage.ENGLISH,
    };
    //When
    const output = toCUIWelshLanguageRequirements(input);
    const expected : WelshLanguageRequirements = {
      language: {
        speakLanguage: LanguageOptions.ENGLISH,
        documentsLanguage: LanguageOptions.ENGLISH,
      }
    }
    //Then
    expect(output).toEqual(expected);
  });

  it('should return data if CCDWelshLanguage data exist with both', () => {
    //Given
    const input: CCDWelshLanguageRequirements = {
      evidence: undefined,
      court: CCDLanguage.BOTH,
      documents: CCDLanguage.BOTH,
    };
    //When
    const output = toCUIWelshLanguageRequirements(input);
    const expected : WelshLanguageRequirements = {
      language: {
        speakLanguage: LanguageOptions.WELSH_AND_ENGLISH,
        documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH,
      }
    }
    //Then
    expect(output).toEqual(expected);
  });
});
