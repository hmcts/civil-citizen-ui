import {CCDClaim} from 'models/civilClaimResponse';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {UnavailableDatePeriod, UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CCDUnavailableDates, CCDUnavailableDateType} from 'models/ccdResponse/ccdSmallClaimHearing';
import {Support, SupportRequired} from 'models/directionsQuestionnaire/supportRequired';
import {CCDSupportRequirement, CCDSupportRequirements} from 'models/ccdResponse/ccdHearingSupport';
import {analyseClaimType, claimType} from 'common/form/models/claimType';
import {DeterminationWithoutHearing} from 'common/models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {ConsiderClaimantDocuments} from 'common/models/directionsQuestionnaire/hearing/considerClaimantDocuments';
import {YesNo} from 'form/models/yesNo';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';
import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument,
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';

export const toCUIHearing = (ccdClaim: CCDClaim) : Hearing => {
  if (ccdClaim) {
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

    const documentsType = [];
    if (ccdClaim.specRespondent1DQDisclosureOfElectronicDocuments) {
      documentsType.push(TypeOfDisclosureDocument.ELECTRONIC);
      const agreementReached = toCUIYesNo(ccdClaim.specRespondent1DQDisclosureOfElectronicDocuments?.reachedAgreement);
      const agreementLikely = toCUIYesNo(ccdClaim.specRespondent1DQDisclosureOfElectronicDocuments?.agreementLikely);
      if (agreementReached === YesNo.YES) {
        hearing.hasAnAgreementBeenReached = HasAnAgreementBeenReachedOptions.YES;
      } else {
        if (agreementLikely === YesNo.YES) {
          hearing.hasAnAgreementBeenReached = HasAnAgreementBeenReachedOptions.NO_BUT_AN_AGREEMENT_IS_LIKELY;
        } else {
          hearing.hasAnAgreementBeenReached = HasAnAgreementBeenReachedOptions.NO;
        }
      }
      hearing.disclosureOfElectronicDocumentsIssues = ccdClaim.specRespondent1DQDisclosureOfElectronicDocuments?.reasonForNoAgreement;

    }

    if (ccdClaim.specRespondent1DQDisclosureOfNonElectronicDocuments) {
      documentsType.push(TypeOfDisclosureDocument.NON_ELECTRONIC);
      hearing.disclosureNonElectronicDocument = ccdClaim.specRespondent1DQDisclosureOfNonElectronicDocuments?.bespokeDirections;
    }

    if (documentsType.length > 0) {
      hearing.disclosureOfDocuments = new DisclosureOfDocuments();
      hearing.disclosureOfDocuments.documentsTypeChosen = documentsType;
    }

    if (ccdClaim.respondent1DQClaimantDocumentsToBeConsidered?.hasDocumentsToBeConsidered) {
      hearing.hasDocumentsToBeConsidered = toCUIGenericYesNo(ccdClaim.respondent1DQClaimantDocumentsToBeConsidered?.hasDocumentsToBeConsidered);
      hearing.documentsConsideredDetails = ccdClaim.respondent1DQClaimantDocumentsToBeConsidered?.details;
    }

    if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.whyUnavailableForHearing) {
      hearing.whyUnavailableForHearing = {
        reason: (ccdClaim.respondent1LiPResponse.respondent1DQExtraDetails.whyUnavailableForHearing),
      };
    }
    if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.wantPhoneOrVideoHearing) {
      hearing.phoneOrVideoHearing = {
        option: toCUIYesNo(ccdClaim.respondent1LiPResponse.respondent1DQExtraDetails.wantPhoneOrVideoHearing),
        details: ccdClaim.respondent1LiPResponse.respondent1DQExtraDetails.whyPhoneOrVideoHearing,
      };
    }
    if (ccdClaim.respondent1LiPResponse?.respondent1DQHearingSupportLip) {
      hearing.supportRequiredList = {
        option: toCUIYesNo(ccdClaim.respondent1LiPResponse.respondent1DQHearingSupportLip.supportRequirementLip),
        items: toCUISupportItems(ccdClaim.respondent1LiPResponse.respondent1DQHearingSupportLip.requirementsLip),
      };
    }
    if (ccdClaim.responseClaimTrack === claimType.SMALL_CLAIM || analyseClaimType(ccdClaim.totalClaimAmount) === claimType.SMALL_CLAIM) {
      if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails) {
        hearing.determinationWithoutHearing = {
          option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingRequired),
          reasonForHearing: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingReason,
        } as DeterminationWithoutHearing;
      }
    } else {
      if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.triedToSettle) {
        hearing.triedToSettle = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.triedToSettle);
      }
      if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.requestExtra4weeks) {
        hearing.requestExtra4weeks = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.requestExtra4weeks);
      }
      if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocuments) {
        hearing.considerClaimantDocuments =
          {
            option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocuments),
            details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocumentsDetails,
          } as ConsiderClaimantDocuments;
      }
    }
    return hearing;
  }
};

export const toCUISpecificCourtLocation = (specificCourtLocation: CCDSpecificCourtLocations) : SpecificCourtLocation=> {
  return new SpecificCourtLocation(specificCourtLocation.caseLocation?.baseLocation,specificCourtLocation.reasonForHearingAtSpecificCourt);
};

function toCUIUnavailableDates(ccdUnavailableDates: CCDUnavailableDates[]) : UnavailableDatePeriod[] {
  if (ccdUnavailableDates?.length) {
    return ccdUnavailableDates.map((ccdUnavailableDate: CCDUnavailableDates) => {
      return {
        from: ccdUnavailableDate.value.date,
        until: ccdUnavailableDate.value.toDate,
        type: toCUIUnavailableDateType(ccdUnavailableDate.value.unavailableDateType),
      };
    });
  }
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
        fullName: ccdSupportItem.value.name,
        disabledAccess: toCUISupportDetails(ccdSupportItem.value.requirements, CCDSupportRequirement.DISABLED_ACCESS, CUISourceName.DISABLED_ACCESS, undefined),
        hearingLoop: toCUISupportDetails(ccdSupportItem.value.requirements, CCDSupportRequirement.HEARING_LOOPS, CUISourceName.HEARING_LOOPS, undefined),
        signLanguageInterpreter: toCUISupportDetails(ccdSupportItem.value.requirements, CCDSupportRequirement.SIGN_INTERPRETER, CUISourceName.SIGN_INTERPRETER, ccdSupportItem.value.signLanguageRequired),
        languageInterpreter: toCUISupportDetails(ccdSupportItem.value.requirements, CCDSupportRequirement.LANGUAGE_INTERPRETER, CUISourceName.LANGUAGE_INTERPRETER, ccdSupportItem.value.languageToBeInterpreted),
        otherSupport: toCUISupportDetails(ccdSupportItem.value.requirements, CCDSupportRequirement.OTHER_SUPPORT, CUISourceName.OTHER_SUPPORT, ccdSupportItem.value.otherSupport),
        checkboxGrp: toCUISupportCheckBox(ccdSupportItem.value.requirements),
      };
    });
  }
}

function toCUISupportDetails(ccdSupportRequirementItems : CCDSupportRequirement[], ccdSupportName : CCDSupportRequirement, cuiSourceName: string,  content: string) : Support {
  if (ccdSupportRequirementItems.includes(ccdSupportName)) {
    return {
      sourceName: cuiSourceName,
      selected: true,
      content: content,
    };
  }
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

export enum CUISourceName{
  DISABLED_ACCESS =  'disabledAccess',
  HEARING_LOOPS = 'hearingLoop',
  SIGN_INTERPRETER = 'signLanguageInterpreter',
  LANGUAGE_INTERPRETER = 'languageInterpreter',
  OTHER_SUPPORT = 'otherSupport',
}

