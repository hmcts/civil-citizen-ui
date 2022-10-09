import {IsDefined, IsNotEmpty, Validate, ValidateIf, ValidateNested} from 'class-validator';
import {AtLeastOneCheckboxSelectedValidator} from '../../form/validators/atLeastOneCheckboxSelectedValidator';
import {YesNo} from '../../form/models/yesNo';

export enum SupportType {
  SIGN_LANGUAGE_INTERPRETER = 'signLanguageInterpreter',
  LANGUAGE_INTERPRETER = 'languageInterpreter',
  OTHER_SUPPORT = 'otherSupport',
}

export interface SupportRequiredParams{
  fullName?: string,
  disabledAccess?: Support,
  hearingLoop?: Support,
  signLanguageInterpreter?: Support,
  languageInterpreter?: Support,
  otherSupport?: Support,
  declared?: string,
}

export class SupportRequiredList {

  option: YesNo;
  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    items?: SupportRequired[];

  [key: string]: YesNo | SupportRequired[];

  constructor(option?: YesNo, items?: SupportRequired[]) {
    this.option = option;
    this.items = items;
  }
}

export class SupportRequired {
  @IsDefined({message: 'ERRORS.ENTER_PERSON_NAME'})
  @IsNotEmpty({message: 'ERRORS.ENTER_PERSON_NAME'})
    fullName?: string;
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

  [key: string]: string | Support | boolean[];
  constructor(params?: SupportRequiredParams) {
    this.fullName = params?.fullName;
    this.disabledAccess = params?.disabledAccess;
    this.hearingLoop = params?.hearingLoop;
    this.signLanguageInterpreter = params?.signLanguageInterpreter;
    this.languageInterpreter = params?.languageInterpreter;
    this.otherSupport = params?.otherSupport;
    this.checkboxGrp = [
      params?.disabledAccess?.selected,
      params?.hearingLoop?.selected,
      params?.signLanguageInterpreter?.selected,
      params?.languageInterpreter?.selected,
      params?.otherSupport?.selected,
    ];
  }
}

export class Support {
  sourceName?: string;
  selected?: boolean;
  @ValidateIf(o => o.selected)
  @IsDefined({message: withMessage(generateErrorMessage)})
  @IsNotEmpty({message: withMessage(generateErrorMessage)})
    content?: string;

  [key: string]: boolean | string;

  constructor(sourceName?: string, selected?: boolean, content?: string) {
    this.sourceName = sourceName;
    this.selected = selected;
    this.content = content;
  }
}

function generateErrorMessage (sourceName: string): string {
  switch (sourceName) {
    case SupportType.SIGN_LANGUAGE_INTERPRETER:
      return 'ERRORS.NO_SIGN_LANGUAGE_ENTERED';
    case SupportType.LANGUAGE_INTERPRETER:
      return 'ERRORS.NO_LANGUAGE_ENTERED';
    default:
      return 'ERRORS.NO_OTHER_SUPPORT';
  }
}

function withMessage (buildErrorFn: (sourceName: string) => string) {
  return (args: any): string => {
    return buildErrorFn(args.object.sourceName);
  };
}

