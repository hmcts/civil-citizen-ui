import {
  IsDefined, IsNotEmpty,
  ValidateIf, ValidateNested,
} from 'class-validator';

export enum SupportType {
  STEP_FREE_ACCESS = 'stepFreeAccess',
  HEARING_LOOP = 'hearingLoop',
  SIGN_LANGUAGE_INTERPRETER = 'signLanguageInterpreter',
  LANGUAGE_INTERPRETER = 'languageInterpreter',
  OTHER_SUPPORT = 'otherSupport',
}

export class HearingSupport {

  stepFreeAccess?: Support;
  hearingLoop?: Support;
  @ValidateNested()
    signLanguageInterpreter?: Support;
  @ValidateNested()
    languageInterpreter?: Support;
  @ValidateNested()
    otherSupport?: Support;

  constructor(selectedSupport: SupportType[], signLanguageContent?: string, languageContent?: string, otherContent?: string) {
    this.stepFreeAccess = new Support(SupportType.STEP_FREE_ACCESS, selectedSupport.includes(SupportType.STEP_FREE_ACCESS));
    this.hearingLoop = new Support(SupportType.HEARING_LOOP, selectedSupport.includes(SupportType.HEARING_LOOP));
    this.signLanguageInterpreter = new Support(SupportType.SIGN_LANGUAGE_INTERPRETER, selectedSupport.includes(SupportType.SIGN_LANGUAGE_INTERPRETER), signLanguageContent);
    this.languageInterpreter = new Support(SupportType.LANGUAGE_INTERPRETER, selectedSupport.includes(SupportType.LANGUAGE_INTERPRETER), languageContent);
    this.otherSupport = new Support(SupportType.OTHER_SUPPORT, selectedSupport.includes(SupportType.OTHER_SUPPORT), otherContent);
  }

  static convertToArray(param: string[] | string): SupportType[] {
    if (Array.isArray(param)) {
      return param as SupportType[];
    }
    if (param) {
      return [param] as SupportType[];
    }
    return [];
  }
}

export class Support {
  sourceName: string;
  selected: boolean;
  @ValidateIf(o => o.selected)
  @IsDefined({message: withMessage(generateErrorMessage)})
  @IsNotEmpty({message: withMessage(generateErrorMessage)})
    content?: string;

  constructor(sourceName: string, selected: boolean, content?: string) {
    this.sourceName = sourceName;
    this.selected = selected;
    this.content = content;
  }
}

function generateErrorMessage (sourceName: string): string {
  switch (sourceName) {
    case SupportType.SIGN_LANGUAGE_INTERPRETER:
      return 'ERRORS.GENERAL_APPLICATION.MISSING_SIGN_LANGUAGE';
    case SupportType.LANGUAGE_INTERPRETER:
      return 'ERRORS.GENERAL_APPLICATION.MISSING_LANGUAGE';
    case SupportType.OTHER_SUPPORT:
      return 'ERRORS.GENERAL_APPLICATION.MISSING_OTHER';
    default:
      return undefined;
  }
}

function withMessage (buildErrorFn: (sourceName: string) => string) {
  return (args: any): string => {
    return buildErrorFn(args.object.sourceName);
  };
}
