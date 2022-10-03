import {IsDefined, IsNotEmpty, ValidateIf, ValidateNested} from 'class-validator';

export enum supportType {
  SIGN_LANGUAGE_INTERPRETER = 'signLanguageInterpreter',
  LANGUAGE_INTERPRETER = 'languageInterpreter',
  OTHER_SUPPORT = 'otherSupport',
}

const generateErrorMessage = (sourceName: string): string => {
  switch (sourceName) {
    case supportType.SIGN_LANGUAGE_INTERPRETER:
      return 'ERRORS.NO_SIGN_LANGUAGE_ENTERED';
    case supportType.LANGUAGE_INTERPRETER:
      return 'ERRORS.NO_LANGUAGE_ENTERED';
    default:
      return 'ERRORS.NO_OTHER_SUPPORT';
  }
};

const withMessage = (buildErrorFn: (name: string) => string) => {
  return (args: any): string => {
    return buildErrorFn(args.object.name);
  };
};

export class Support {
  name?: string;
  selected?: boolean;
  @ValidateIf(o => o.selected)
  @IsDefined({message: withMessage(generateErrorMessage)})
  @IsNotEmpty({message: withMessage(generateErrorMessage)})
  // @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})
    content?: string;

  [key: string]: boolean | string;

  constructor(name?: string, selected?: boolean, content?: string) {
    this.selected = selected;
    this.content = content;
    this.name = name;
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

  [key: string]: string | Support;

  // TODO : change any to relevant interface
  constructor(value?: any) {
    this.name = value?.name;
    this.disabledAccess = value?.disabledAccess;
    this.hearingLoop = value?.hearingLoop;
    this.signLanguageInterpreter = value?.signLanguageInterpreter;
    this.languageInterpreter = value?.languageInterpreter;
    this.otherSupport = value?.otherSupport;
  }
}

// TODO missing validatins
// at least one sopprt : 'ERRORS.SELECT_SUPPORT'
// name of person : 'ERRORS.ENTER_PERSON_NAME'

export class SupportRequiredList{
  @ValidateNested()
    items?: SupportRequired[];

  [key: string]: SupportRequired[];

  constructor(items?: SupportRequired[]) {
    this.items = items;
  }
}
