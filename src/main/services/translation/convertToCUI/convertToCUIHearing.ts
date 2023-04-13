import {CCDClaim} from 'models/civilClaimResponse';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {UnavailableDatePeriod, UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CCDUnavailableDates, CCDUnavailableDateType} from 'models/ccdResponse/ccdSmallClaimHearing';
import {Support, SupportRequired} from 'models/directionsQuestionnaire/supportRequired';
import {CCDSupportRequirement, CCDSupportRequirements} from 'models/ccdResponse/ccdHearingSupport';

export const toCUIHearing = (ccdClaim: CCDClaim) : Hearing => {
  if(ccdClaim){
    const hearing: Hearing = new Hearing();
    if (ccdClaim.respondent1DQRequestedCourt) {
      hearing.specificCourtLocation = toCUISpecificCourtLocation(ccdClaim.respondent1DQRequestedCourt);
    }
    if (ccdClaim.respondent1DQHearingSmallClaim) {
      hearing.unavailableDatesForHearing = {
        items : toCUIUnavailableDates(ccdClaim.respondent1DQHearingSmallClaim.smallClaimUnavailableDate),
      };
      hearing.cantAttendHearingInNext12Months = toCUIGenericYesNo(ccdClaim.respondent1DQHearingSmallClaim.unavailableDatesRequired);
    }
    if(ccdClaim.respondent1DQHearingFastClaim) {
      hearing.unavailableDatesForHearing = {
        items : toCUIUnavailableDates(ccdClaim.respondent1DQHearingFastClaim.unavailableDates),
      };
      hearing.cantAttendHearingInNext12Months = toCUIGenericYesNo(ccdClaim.respondent1DQHearingFastClaim.unavailableDatesRequired);
    }
    if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.whyUnavailableForHearing) {
      hearing.whyUnavailableForHearing = {
        reason: (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.whyUnavailableForHearing),
      };
    }
    if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.wantPhoneOrVideoHearing) {
      hearing.phoneOrVideoHearing = {
        option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.wantPhoneOrVideoHearing),
        details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.whyPhoneOrVideoHearing,
      };
    }
    if (ccdClaim.respondent1LiPResponse?.respondent1DQHearingSupportLip) {
      hearing.supportRequiredList = {
        option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQHearingSupportLip?.supportRequirementLip),
        items: toCUISupportItems(ccdClaim.respondent1LiPResponse?.respondent1DQHearingSupportLip?.requirementsLip),
      };
    }
    return hearing;
  }
};

export const toCUISpecificCourtLocation = (specificCourtLocation: CCDSpecificCourtLocations) : SpecificCourtLocation=> {
  return new SpecificCourtLocation(toCUIYesNo(specificCourtLocation.requestHearingAtSpecificCourt),specificCourtLocation.caseLocation?.baseLocation,specificCourtLocation.reasonForHearingAtSpecificCourt);
};

function toCUIUnavailableDates(ccdUnavailableDates: CCDUnavailableDates[]) : UnavailableDatePeriod[] {
  if (!ccdUnavailableDates?.length) return undefined;
  return ccdUnavailableDates.map((ccdUnavailableDate: CCDUnavailableDates) => {
    return {
      from: ccdUnavailableDate.value.date,
      until: ccdUnavailableDate.value.toDate,
      type: toCUIUnavailableDateType(ccdUnavailableDate.value.unavailableDateType),
    };
  });
}

function toCUIUnavailableDateType(type: CCDUnavailableDateType) : UnavailableDateType {
  switch(type) {
    case CCDUnavailableDateType.SINGLE_DATE:
      return UnavailableDateType.SINGLE_DATE;
    case  CCDUnavailableDateType.DATE_RANGE:
      return UnavailableDateType.LONGER_PERIOD;
    default:
      return undefined;
  }
}

function toCUISupportItems(ccdSupportItems : CCDSupportRequirements[]) : SupportRequired[] {
  if (ccdSupportItems?.length) {
    return ccdSupportItems.map((ccdSupportItem: CCDSupportRequirements) => {
      return {
        fullName: ccdSupportItem.value?.name,
        disabledAccess: toCUISupportDetails(ccdSupportItem.value?.requirements, CCDSupportRequirement.DISABLED_ACCESS, CUISourceName.DISABLED_ACCESS, undefined),
        hearingLoop: toCUISupportDetails(ccdSupportItem.value?.requirements, CCDSupportRequirement.HEARING_LOOPS, CUISourceName.HEARING_LOOPS, undefined),
        signLanguageInterpreter: toCUISupportDetails(ccdSupportItem.value?.requirements, CCDSupportRequirement.SIGN_INTERPRETER, CUISourceName.SIGN_INTERPRETER, ccdSupportItem.value?.signLanguageRequired),
        languageInterpreter: toCUISupportDetails(ccdSupportItem.value?.requirements, CCDSupportRequirement.LANGUAGE_INTERPRETER, CUISourceName.LANGUAGE_INTERPRETER, ccdSupportItem.value?.languageToBeInterpreted),
        otherSupport: toCUISupportDetails(ccdSupportItem.value?.requirements, CCDSupportRequirement.OTHER_SUPPORT, CUISourceName.OTHER_SUPPORT, ccdSupportItem.value?.otherSupport),
        checkboxGrp: toCUISupportCheckBox(ccdSupportItem.value?.requirements),
      };
    });
  }
  return;
}

function toCUISupportDetails(ccdSupportRequirementItems : CCDSupportRequirement[], ccdSupportName : CCDSupportRequirement, cuiSourceName: string,  content: string) : Support {
  if (ccdSupportRequirementItems.includes(ccdSupportName)) {
    return {
      sourceName: cuiSourceName,
      selected: true,
      content: content,
    };
  }
  return;
}

function toCUISupportCheckBox(ccdSupportRequirementItems : CCDSupportRequirement[]) : boolean[] {
  const chkBoxList : boolean[] = [null, null, null, null, null];
  if (ccdSupportRequirementItems.includes(CCDSupportRequirement.DISABLED_ACCESS)) {
    chkBoxList[0] = true;
  }
  if (ccdSupportRequirementItems.includes(CCDSupportRequirement.HEARING_LOOPS)) {
    chkBoxList[1] = true;
  }
  if (ccdSupportRequirementItems.includes(CCDSupportRequirement.SIGN_INTERPRETER)) {
    chkBoxList[2] = true;
  }
  if (ccdSupportRequirementItems.includes(CCDSupportRequirement.LANGUAGE_INTERPRETER)) {
    chkBoxList[3] = true;
  }
  if (ccdSupportRequirementItems.includes(CCDSupportRequirement.OTHER_SUPPORT)) {
    chkBoxList[4] = true;
  }
  return chkBoxList;
}

enum CUISourceName{
  DISABLED_ACCESS =  'disabledAccess',
  HEARING_LOOPS = 'hearingLoop',
  SIGN_INTERPRETER = 'signLanguageInterpreter',
  LANGUAGE_INTERPRETER = 'languageInterpreter',
  OTHER_SUPPORT = 'otherSupport',
}

