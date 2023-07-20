import {SupportRequired, SupportRequiredList} from 'models/directionsQuestionnaire/supportRequired';
import {CCDSupportRequirement} from 'models/ccdResponse/ccdHearingSupport';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {YesNo} from 'form/models/yesNo';

function ccdHearingSupportRequirementList(hearingSupportItem: SupportRequired) {
  const supportRequirementsList: CCDSupportRequirement[] = [];
  if (hearingSupportItem?.disabledAccess?.selected)
    supportRequirementsList.push(CCDSupportRequirement.DISABLED_ACCESS);
  if (hearingSupportItem?.hearingLoop?.selected)
    supportRequirementsList.push(CCDSupportRequirement.HEARING_LOOPS);
  if (hearingSupportItem?.languageInterpreter?.selected)
    supportRequirementsList.push(CCDSupportRequirement.LANGUAGE_INTERPRETER);
  if (hearingSupportItem?.signLanguageInterpreter?.selected)
    supportRequirementsList.push(CCDSupportRequirement.SIGN_INTERPRETER);
  if (hearingSupportItem?.otherSupport?.selected)
    supportRequirementsList.push(CCDSupportRequirement.OTHER_SUPPORT);

  return supportRequirementsList;
}

function ccdHearingSupportRequirement(items: SupportRequired[] | undefined) {
  if (!items?.length) return undefined;

  const hearingSupportList = items.map((supportRequired: SupportRequired) => {
    return {
      value : {
        name:supportRequired.fullName,
        requirements: ccdHearingSupportRequirementList(supportRequired),
        signLanguageRequired: supportRequired.signLanguageInterpreter?.content,
        languageToBeInterpreted: supportRequired.languageInterpreter?.content,
        otherSupport: supportRequired.otherSupport?.content,
      },
    };
  });
  return hearingSupportList;
}

export const toCCDSHearingSupport = (supportRequiredList: SupportRequiredList | undefined) => {
  return {
    supportRequirementLip: toCCDYesNo(supportRequiredList?.option),
    requirementsLip: supportRequiredList?.option === YesNo.YES ? ccdHearingSupportRequirement(supportRequiredList?.items) : undefined,
  };
};
