import {IsDefined} from 'class-validator';
import {LanguageOptions} from '../languageOptions';

export class Language {

  @IsDefined({message: 'ERRORS.SELECT_LANGUAGE_SPEAK'})
    speakLanguage: LanguageOptions;

  @IsDefined({message: 'ERRORS.SELECT_LANGUAGE_DOCUMENTS'})
    documentsLanguage: LanguageOptions;

  constructor(speakLanguage?: LanguageOptions, documentsLanguage?: LanguageOptions) {
    this.speakLanguage = speakLanguage;
    this.documentsLanguage = documentsLanguage;
  }
}
