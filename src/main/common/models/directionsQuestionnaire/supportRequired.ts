import {IsDefined, IsNotEmpty, MaxLength, ValidateIf, ValidateNested} from 'class-validator';
import {
  // NO_LANGUAGE_ENTERED,
  // NO_OTHER_SUPPORT,
  NO_SIGN_LANGUAGE_ENTERED,
  TEXT_TOO_LONG,
} from '../../form/validationErrors/errorMessageConstants';
import {FREE_TEXT_MAX_LENGTH} from '../../form/validators/validationConstraints';

export class Support {
  selected?: boolean;
  // TODO: change error message with dynamic values
  @ValidateIf(o => o.selected)
  @IsDefined({message: NO_SIGN_LANGUAGE_ENTERED})
  @IsNotEmpty({message: NO_SIGN_LANGUAGE_ENTERED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})
    content?: string;

  [key: string]: boolean | string;

  constructor(selected?: boolean, content?: string) {
    this.selected = selected;
    this.content = content;
  }
}
export class SupportRequired {
  name?: string;
  disabledAccess?: Support;
  hearingLoop?: Support;
  @ValidateNested()
    signLanguageInterpreter?: Support;
  @ValidateNested()
    languageInterpreter?: Support;
  @ValidateNested()
    otherSupport?: Support;

  // @ValidateIf(o => o.signLanguageSelected)
  // @IsDefined({message: NO_SIGN_LANGUAGE_ENTERED})
  // @IsNotEmpty({message: NO_SIGN_LANGUAGE_ENTERED})
  // @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})
  //   signLanguageInterpreted?: string;

  // @ValidateIf(o => o.languageSelected)
  // @IsDefined({message: NO_LANGUAGE_ENTERED})
  // @IsNotEmpty({message: NO_LANGUAGE_ENTERED})
  // @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})
  //   languageInterpreted?: string;

  // @ValidateIf(o => o.otherSupportSelected)
  // @IsDefined({message: NO_OTHER_SUPPORT})
  // @IsNotEmpty({message: NO_OTHER_SUPPORT})
  // @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})
  // otherSupport?: string;

  [key: string]: string | Support;

  // TODO : change any to relevant interface
  constructor(value?: any) {
    this.name = value?.name;
    this.disabledAccess = value?.disabledAccess;
    this.hearingLoop = value?.hearingLoop;
    this.signLanguageInterpreter = value?.signLanguageInterpreter;
    this.languageInterpreter = value?.languageInterpreter;
    this.otherSupport = value?.otherSupport;
    // this.languageInterpreted = languageInterpreted;
    // this.signLanguageSelected = signLanguageSelected;
    // this.signLanguageInterpreted = signLanguageInterpreted;
    // this.hearingLoopSelected = hearingLoopSelected;
    // this.disabledAccessSelected = disabledAccessSelected;
    // this.otherSupportSelected = otherSupportSelected;
    // this.otherSupport = otherSupport;
  }
}

export class SupportRequiredList{
  @ValidateNested()
    items?: SupportRequired[];

  [key: string]: SupportRequired[];

  constructor(items?: SupportRequired[]) {
    this.items = items;
  }
}
