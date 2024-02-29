import {SupportRequired, SupportRequiredList} from 'models/directionsQuestionnaire/supportRequired';
import {CCDSupportRequirement} from 'models/ccdResponse/ccdHearingSupport';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {YesNo} from 'form/models/yesNo';
import { CCDDQSupportRequirements, SupportDetails } from 'common/models/ccdResponse/ccdExpert';

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

function ccdHearingSupportRequirementListToStringFormat(hearingSupportItem: SupportRequired) {
  const supportRequirementsList: string[] = [];
  if (hearingSupportItem?.disabledAccess?.selected) {
    supportRequirementsList.push(SupportDetails.DISABLED_ACCESS);
  }
  if (hearingSupportItem?.hearingLoop?.selected) {
    supportRequirementsList.push(SupportDetails.HEARING_LOOPS);
  }
  if (hearingSupportItem?.languageInterpreter?.selected) {
    supportRequirementsList.push(`${SupportDetails.LANGUAGE_INTERPRETER}:${hearingSupportItem.languageInterpreter.content}`);
  }
  if (hearingSupportItem?.signLanguageInterpreter?.selected) {
    supportRequirementsList.push(`${SupportDetails.SIGN_INTERPRETER}:${hearingSupportItem.signLanguageInterpreter.content}`);
  }
  if (hearingSupportItem?.otherSupport?.selected) {
    supportRequirementsList.push(`${SupportDetails.OTHER_SUPPORT}:${hearingSupportItem.otherSupport.content}`);
  }
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

const ccdHearingSupportAdditionalRequirements = (items: SupportRequired[]): string => {
  let supportRequirementsAdditional = '';
  items.forEach((supportRequired: SupportRequired) => {
    const supportedList = ccdHearingSupportRequirementListToStringFormat(supportRequired);
    if (supportedList.length) {
      supportRequirementsAdditional = supportRequirementsAdditional + `${supportRequired.fullName} :${supportedList.toString()};`;
    }
  });
  return supportRequirementsAdditional;
};

export const toCCDDQHearingSupport = (supportRequiredList: SupportRequiredList): CCDDQSupportRequirements => {
  const supportRequirements = toCCDYesNo(supportRequiredList?.option);

  if (supportRequiredList?.option === YesNo.YES) {
    const supportRequirementsAdditional = ccdHearingSupportAdditionalRequirements(supportRequiredList?.items);
    return {
      supportRequirements,
      supportRequirementsAdditional,
    };
  }
  return {
    supportRequirements,
  };
};