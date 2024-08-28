import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import { CCDGeneralApplication } from 'models/gaEvents/eventDto';
import { OrderJudge } from 'models/generalApplication/orderJudge';
import { ApplicationType } from 'models/generalApplication/applicationType';
import { CcdGeneralApplicationTypes } from 'models/ccdGeneralApplication/ccdGeneralApplicationTypes';
import { toCCDYesNo } from 'services/translation/response/convertToCCDYesNo';
import { InformOtherParties } from 'models/generalApplication/informOtherParties';
import { CcdGeneralApplicationInformOtherParty } from 'models/ccdGeneralApplication/ccdGeneralApplicationInformOtherParty';
import { YesNo, YesNoUpperCamelCase } from 'form/models/yesNo';
import { RequestingReason } from 'models/generalApplication/requestingReason';
import {
  HearingArrangement,
  HearingTypeOptions,
} from 'models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'models/generalApplication/hearingContactDetails';
import {
  CcdGeneralApplicationHearingDetails,
  CcdHearingType,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import { UnavailableDatesGaHearing } from 'models/generalApplication/unavailableDatesGaHearing';
import { CcdGeneralApplicationUnavailableHearingDatesElement } from 'models/ccdGeneralApplication/ccdGeneralApplicationUnavailableHearingDates';
import { DateTime } from 'luxon';
import { HearingSupport } from 'models/generalApplication/hearingSupport';
import { CcdSupportRequirement } from 'models/ccdGeneralApplication/ccdSupportRequirement';
import { UploadGAFiles } from 'models/generalApplication/uploadGAFiles';
import { CcdGeneralApplicationEvidenceDocument } from 'models/ccdGeneralApplication/ccdGeneralApplicationEvidenceDocument';
import {
  CcdGeneralApplicationRespondentAgreement,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationRespondentAgreement';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {
  CcdGeneralApplicationStatementOfTruth,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationStatementOfTruth';

export const translateDraftApplicationToCCD = (
  application: GeneralApplication,
): CCDGeneralApplication => {
  return {
    generalAppType: toCCDGeneralApplicationTypes(application.applicationTypes),
    generalAppRespondentAgreement: toCCDRespondentAgreement(application.agreementFromOtherParty),
    generalAppInformOtherParty: toCCDInformOtherParty(
      application.informOtherParties,
    ),
    generalAppAskForCosts: toCCDYesNo(application.applicationCosts),
    generalAppDetailsOfOrder: toCCDDetailsOfOrder(application.orderJudges),
    generalAppReasonsOfOrder: toCCDReasonsOfOrder(
      application.requestingReasons,
    ),
    generalAppEvidenceDocument: toCCDEvidenceDocuments(
      application.wantToUploadDocuments,
      application.uploadEvidenceForApplication,
    ),
    generalAppHearingDetails: toCCDGeneralAppHearingDetails(
      application.hearingArrangement,
      application.hearingContactDetails,
      application.unavailableDatesHearing,
      application.hearingSupport,
    ),
    generalAppStatementOfTruth: toCCDStatementOfTruth(application.statementOfTruth),
  };
};

const toCCDGeneralApplicationTypes = (applicationTypes: ApplicationType[]): CcdGeneralApplicationTypes => {
  return {
    types: applicationTypes?.map(applicationType => applicationType.option),
  };
};

const toCCDRespondentAgreement = (agreementFromOtherParty: YesNo): CcdGeneralApplicationRespondentAgreement => {
  return agreementFromOtherParty
    ? {
      hasAgreed: toCCDYesNo(agreementFromOtherParty),
    }
    : undefined;
};

const toCCDInformOtherParty = (informOtherParty: InformOtherParties): CcdGeneralApplicationInformOtherParty => {
  return informOtherParty
    ? {
      isWithNotice: toCCDYesNo(informOtherParty.option as YesNo),
      reasonsForWithoutNotice: (informOtherParty.reasonForCourtNotInformingOtherParties),
    }
    : undefined;
};

const toCCDDetailsOfOrder = (orderJudges: OrderJudge[]): string => {
  return orderJudges?.map(orderJudge => orderJudge.text)?.join('\n\n');
};

const toCCDReasonsOfOrder = (requestingReasons: RequestingReason[]): string => {
  return requestingReasons?.map(requestingReason => requestingReason.text)?.join('\n\n');
};

const toCCDEvidenceDocuments = (wantToUpload: YesNo, uploadDocuments: UploadGAFiles[]): CcdGeneralApplicationEvidenceDocument[] => {
  return wantToUpload == YesNo.YES
    ? uploadDocuments?.map(uploadDocument => {
      return {
        value: {
          document_url: uploadDocument?.caseDocument?.documentLink?.document_url,
          document_binary_url: uploadDocument?.caseDocument?.documentLink?.document_binary_url,
          document_filename: uploadDocument?.caseDocument?.documentLink?.document_filename,
          category_id: uploadDocument?.caseDocument?.documentLink?.category_id,
        },
      };
    })
    : undefined;
};

const toCCDGeneralAppHearingDetails = (hearingArrangement: HearingArrangement, hearingContactDetails: HearingContactDetails,
  unavailableHearingDates: UnavailableDatesGaHearing, hearingSupport: HearingSupport): CcdGeneralApplicationHearingDetails => {
  return (hearingArrangement && hearingContactDetails)
    ? {
      HearingPreferencesPreferredType: toCCDHearingPreferencesPreferredType(hearingArrangement.option),
      ReasonForPreferredHearingType:  hearingArrangement.reasonForPreferredHearingType,
      HearingPreferredLocation: {
        value: {
          label: hearingArrangement.courtLocation,
        },
      },
      HearingDetailsTelephoneNumber: hearingContactDetails.telephoneNumber,
      HearingDetailsEmailID: hearingContactDetails.emailAddress,
      unavailableTrialRequiredYesOrNo: toUnavailableHearingDatesYesNo(unavailableHearingDates),
      generalAppUnavailableDates: toCCDUnavailableHearingDates(unavailableHearingDates),
      SupportRequirement: toCCDSupportRequirements(hearingSupport),
      SupportRequirementSignLanguage: hearingSupport?.signLanguageInterpreter?.content,
      SupportRequirementLanguageInterpreter: hearingSupport?.languageInterpreter?.content,
      SupportRequirementOther: hearingSupport?.otherSupport?.content,
    }
    : undefined;
};

const toCCDHearingPreferencesPreferredType = (hearingTypeOption: HearingTypeOptions): CcdHearingType => {
  switch (hearingTypeOption) {
    case HearingTypeOptions.PERSON_AT_COURT:
      return CcdHearingType.IN_PERSON;
    case HearingTypeOptions.TELEPHONE:
      return CcdHearingType.TELEPHONE;
    case HearingTypeOptions.VIDEO_CONFERENCE:
      return CcdHearingType.VIDEO;
    default:
      return undefined;
  }
};

const toUnavailableHearingDatesYesNo = (unavailableHearingDates: UnavailableDatesGaHearing): YesNoUpperCamelCase => {
  return unavailableHearingDates?.items?.length > 0
    ? YesNoUpperCamelCase.YES
    : YesNoUpperCamelCase.NO;
};

const toCCDUnavailableHearingDates = (unavailableHearingDates: UnavailableDatesGaHearing): CcdGeneralApplicationUnavailableHearingDatesElement[] => {
  return unavailableHearingDates?.items?.map(unavailableDatePeriod => {
    return {
      value: {
        unavailableTrialDateFrom: DateTime.fromJSDate(new Date(unavailableDatePeriod.from)).toFormat('yyyy-MM-dd'),
        unavailableTrialDateTo: unavailableDatePeriod.until ? DateTime.fromJSDate(new Date(unavailableDatePeriod.until)).toFormat('yyyy-MM-dd') : undefined,
      },
    };
  });
};

const toCCDSupportRequirements = (hearingSupport: HearingSupport): CcdSupportRequirement[] => {
  const ccdSupportRequirement: CcdSupportRequirement[] = [];
  if (hearingSupport?.languageInterpreter?.selected) {
    ccdSupportRequirement.push(CcdSupportRequirement.LANGUAGE_INTERPRETER);
  }
  if (hearingSupport?.signLanguageInterpreter?.selected) {
    ccdSupportRequirement.push(CcdSupportRequirement.SIGN_INTERPRETER);
  }
  if (hearingSupport?.hearingLoop?.selected) {
    ccdSupportRequirement.push(CcdSupportRequirement.HEARING_LOOPS);
  }
  if (hearingSupport?.stepFreeAccess?.selected) {
    ccdSupportRequirement.push(CcdSupportRequirement.DISABLED_ACCESS);
  }
  if (hearingSupport?.otherSupport?.selected) {
    ccdSupportRequirement.push(CcdSupportRequirement.OTHER_SUPPORT);
  }
  return ccdSupportRequirement;
};

const toCCDStatementOfTruth = (statementOfTruth: StatementOfTruthForm): CcdGeneralApplicationStatementOfTruth => {
  return {
    name: statementOfTruth?.name,
  };
};
