import {IsDefined, IsNotEmpty, Validate, ValidateIf, ValidateNested} from 'class-validator';
import {AtLeastOneCheckboxSelectedValidator} from '../../form/validators/atLeastOneCheckboxSelectedValidator';
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

const withMessage = (buildErrorFn: (sourceName: string) => string) => {
  return (args: any): string => {
    return buildErrorFn(args.object.sourceName);
  };
};

export class Support {
  sourceName?: string;
  selected?: boolean;
  @ValidateIf(o => o.selected)
  @IsDefined({message: withMessage(generateErrorMessage)})
  @IsNotEmpty({message: withMessage(generateErrorMessage)})
  // @MaxLength(FREE_TEXT_MAX_LENGTH, {message: TEXT_TOO_LONG})
    content?: string;

  [key: string]: boolean | string;

  constructor(sourceName?: string, selected?: boolean, content?: string) {
    this.selected = selected;
    this.content = content;
    this.sourceName = sourceName;
  }
}
export class SupportRequired {
  @IsDefined({message: 'ERRORS.ENTER_PERSON_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_PERSON_NAME'})
    name?: string;
  disabledAccess?: Support;
  hearingLoop?: Support;
  @ValidateNested()
    signLanguageInterpreter?: Support;
  @ValidateNested()
    languageInterpreter?: Support;
  @ValidateNested()
    otherSupport?: Support;
  @Validate(AtLeastOneCheckboxSelectedValidator, {message: 'ERRORS.SELECT_SUPPORT' })
    checkboxGrp: boolean [];

  [key: string]: string | Support | any[] | (() => boolean);
  // [key: string]: string | Support ;

  // TODO : change any to relevant interface
  constructor(value?: any) {
    this.name = value?.name;
    this.disabledAccess = value?.disabledAccess;
    this.hearingLoop = value?.hearingLoop;
    this.signLanguageInterpreter = value?.signLanguageInterpreter;
    this.languageInterpreter = value?.languageInterpreter;
    this.otherSupport = value?.otherSupport;
    this.checkboxGrp = [
      value?.disabledAccess?.selected,
      value?.hearingLoop?.selected,
      value?.signLanguageInterpreter?.selected,
      value?.languageInterpreter?.selected,
    ];
  }
// TODO : it might me unnecessary
  public isAtLeastOneCheckBoxSelected(): boolean {
    return this.disabledAccess?.selected ||
      this.hearingLoop?.selected ||
      this.signLanguageInterpreter?.selected ||
      this.languageInterpreter?.selected ||
      this.otherSupport?.selected;
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
