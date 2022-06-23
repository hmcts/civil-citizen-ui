import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {
  NO_LANGUAGE_ENTERED,
  NO_OTHER_SUPPORT,
  NO_SIGN_LANGUAGE_ENTERED,
  TEXT_TOO_LONG,
} from '../../form/validationErrors/errorMessageConstants';
import {FREE_TEXT_MAX_LENGTH} from '../../form/validators/validationConstraints';


export class SupportRequired {

  disabledAccessSelected?: boolean;
  hearingLoopSelected?: boolean;
  signLanguageSelected?: boolean;
  languageSelected?: boolean;
  otherSupportSelected?: boolean;

  @ValidateIf(o => o.signLanguageSelected)
  @IsDefined({message: NO_SIGN_LANGUAGE_ENTERED})
  @IsNotEmpty({message: NO_SIGN_LANGUAGE_ENTERED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})

    signLanguageInterpreted?: string;

  @ValidateIf(o => o.languageSelected)
  @IsDefined({message: NO_LANGUAGE_ENTERED})
  @IsNotEmpty({message: NO_LANGUAGE_ENTERED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})
    languageInterpreted?: string;

  @ValidateIf(o => o.otherSupportSelected)
  @IsDefined({message: NO_OTHER_SUPPORT})
  @IsNotEmpty({message: NO_OTHER_SUPPORT})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})

    otherSupport?: string;

  constructor(languageSupportItem?: LanguageSupportItem, signLanguageItem?: SignLanguageSupportItem, hearingLoopSelected?: boolean, disabledAccessSelected?: boolean, otherSupportItem?: OtherSupportItem) {
    this.languageSelected = languageSupportItem?.languageSelected;
    this.languageInterpreted = languageSupportItem?.languageInterpreted;
    this.signLanguageSelected = signLanguageItem?.signLanguageSelected;
    this.signLanguageInterpreted = signLanguageItem?.signLanguageInterpreted;
    this.hearingLoopSelected = hearingLoopSelected;
    this.disabledAccessSelected = disabledAccessSelected;
    this.otherSupportSelected = otherSupportItem?.otherSupportSelected;
    this.otherSupport = otherSupportItem?.otherSupport;
  }

}

export class LanguageSupportItem {
  languageSelected?: boolean;
  languageInterpreted?: string;

  constructor(languageSelected?: boolean, languageInterpreted?: string) {
    this.languageSelected = languageSelected;
    this.languageInterpreted = languageInterpreted;
  }
}

export class SignLanguageSupportItem {
  signLanguageSelected?: boolean;
  signLanguageInterpreted?: string;

  constructor(signLanguageSelected?: boolean, signLanguageInterpreted?: string) {
    this.signLanguageSelected = signLanguageSelected;
    this.signLanguageInterpreted = signLanguageInterpreted;
  }
}

export class OtherSupportItem {
  otherSupportSelected?: boolean;
  otherSupport?: string;

  constructor(otherSupportSelected?: boolean, otherSupport?: string) {
    this.otherSupportSelected = otherSupportSelected;
    this.otherSupport = otherSupport;
  }
}
