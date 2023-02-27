import {SupportRequired, SupportRequiredList} from 'models/directionsQuestionnaire/supportRequired';
import {CCDSupportRequirements} from 'models/ccdResponse/ccdHearingSupport';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
let signLanguage: string , languageInterpreter: string, otherSupport: string;

function ccdHearingSupportRequirmentList(items: SupportRequired[]) {
  if (!items?.length) return undefined;

  const hearingSupportList: CCDSupportRequirements[] = [];
  items.forEach((hearingSupportItem, index) => {
    if (hearingSupportItem.disabledAccess)
      hearingSupportList.push(CCDSupportRequirements.DISABLED_ACCESS);
    if (hearingSupportItem.hearingLoop)
      hearingSupportList.push(CCDSupportRequirements.HEARING_LOOPS);
    if (hearingSupportItem.languageInterpreter?.selected) {
      hearingSupportList.push(CCDSupportRequirements.LANGUAGE_INTERPRETER);
      languageInterpreter = hearingSupportItem.languageInterpreter.content;
    }
    if (hearingSupportItem.signLanguageInterpreter?.selected) {
      hearingSupportList.push(CCDSupportRequirements.SIGN_INTERPRETER);
      signLanguage = hearingSupportItem.signLanguageInterpreter.content;
    }
    if (hearingSupportItem.otherSupport?.selected) {
      hearingSupportList.push(CCDSupportRequirements.OTHER_SUPPORT);
      otherSupport = hearingSupportItem.otherSupport.content;
    }
  });
  return hearingSupportList;
}

export const toCCDSHearingSupport = (supportRequiredList: SupportRequiredList | undefined) => {
  return {
    requirements:ccdHearingSupportRequirmentList(supportRequiredList?.items),
    signLanguageRequired: signLanguage,
    languageToBeInterpreted: languageInterpreter,
    otherSupport: otherSupport,
    supportRequirements: toCCDYesNo(supportRequiredList?.option),
    supportRequirementsAdditional: '',
  };
};
