import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import {
  CCDGeneralApplication,
  CCDRespondToApplication,
} from 'models/gaEvents/eventDto';
import { OrderJudge } from 'models/generalApplication/orderJudge';
import {
  ApplicationType,
  ApplicationTypeOption,
} from 'models/generalApplication/applicationType';
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
  CcdGADebtorPaymentPlanGAspec,
  CcdGARespondentDebtorOfferOptionsGAspec,
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
import { CcdGeneralApplicationRespondentAgreement } from 'models/ccdGeneralApplication/ccdGeneralApplicationRespondentAgreement';
import { StatementOfTruthForm } from 'models/generalApplication/statementOfTruthForm';
import { CcdGeneralApplicationStatementOfTruth } from 'models/ccdGeneralApplication/ccdGeneralApplicationStatementOfTruth';
import { ProposedPaymentPlanOption } from 'common/models/generalApplication/response/acceptDefendantOffer';
import { convertToPenceFromStringToString } from '../claim/moneyConversation';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { exhaustiveMatchingGuard } from 'services/genericService';
import {translateCUItoCCD} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {
  CertificateOfSatisfactionOrCancellation,
} from 'models/generalApplication/CertificateOfSatisfactionOrCancellation';
import {CcdGeneralApplicationCertOfSC} from 'models/ccdGeneralApplication/ccdGeneralApplicationCertOfSC';
import {Document} from 'models/document/document';
import {CcdGeneralApplicationOrderJudge} from 'models/ccdGeneralApplication/ccdGeneralApplicationOrderJudge';
import {CcdGeneralApplicationRequestingReason} from 'models/ccdGeneralApplication/ccdGeneralAppRequestingReason';

export const translateDraftApplicationToCCD = (
  application: GeneralApplication,
): CCDGeneralApplication => {
  return {
    generalAppType: toCCDGeneralApplicationTypes(application.applicationTypes),
    generalAppRespondentAgreement: toCCDRespondentAgreement(
      application.agreementFromOtherParty,
    ),
    generalAppInformOtherParty: toCCDInformOtherParty(
      application.applicationTypes,
      application.agreementFromOtherParty,
      application.informOtherParties,
    ),
    generalAppAskForCosts: toCCDYesNo(application.applicationCosts),
    generalAppDetailsOfOrder: toCCDDetailsOfOrder(application.orderJudges),
    generalAppDetailsOfOrderColl: toCCDDetailsOfOrderColl(application.orderJudges),
    generalAppReasonsOfOrder: toCCDReasonsOfOrder(application.requestingReasons),
    generalAppReasonsOfOrderColl: toCCDReasonsOfOrderColl(application.requestingReasons),
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
    generalAppStatementOfTruth: toCCDStatementOfTruth(
      application.statementOfTruth,
    ),
    generalAppN245FormUpload: toCCDDocument(application.uploadN245Form),
  };
};

const toCCDDocument = (uploadDocument: UploadGAFiles): Document => {
  return uploadDocument
    ? {
      document_url: uploadDocument?.caseDocument?.documentLink?.document_url,
      document_binary_url: uploadDocument?.caseDocument?.documentLink?.document_binary_url,
      document_filename: uploadDocument?.caseDocument?.documentLink?.document_filename,
      category_id: uploadDocument?.caseDocument?.documentLink?.category_id,
    }
    : undefined;
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

const toCCDInformOtherParty = (applicationTypes: ApplicationType[], agreementFromOtherParty: YesNo, informOtherParty: InformOtherParties): CcdGeneralApplicationInformOtherParty => {
  if (applicationTypes.length === 1 && applicationTypes[0].option === ApplicationTypeOption.SET_ASIDE_JUDGEMENT && agreementFromOtherParty === YesNo.NO) {
    return {
      isWithNotice: toCCDYesNo(YesNo.YES),
    };
  }
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

const toCCDDetailsOfOrderColl = (orderJudges: OrderJudge[]): CcdGeneralApplicationOrderJudge[] => {
  return orderJudges?.map(orderJudge => {
    return {
      value: orderJudge.text,
    };
  });
};

const toCCDReasonsOfOrderColl = (requestingReasons: RequestingReason[]): CcdGeneralApplicationRequestingReason[] => {
  return requestingReasons?.map(requestingReason => {
    return {
      value: requestingReason.text,
    };
  });
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

export const fromCcdHearingType = (ccdHearingType: CcdHearingType): HearingTypeOptions => {
  switch (ccdHearingType) {
    case CcdHearingType.IN_PERSON : return HearingTypeOptions.PERSON_AT_COURT;
    case CcdHearingType.TELEPHONE : return HearingTypeOptions.TELEPHONE;
    case CcdHearingType.VIDEO : return HearingTypeOptions.VIDEO_CONFERENCE;
    default: exhaustiveMatchingGuard(ccdHearingType);
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

const toCcdPaymentPlan = (paymentPlan: ProposedPaymentPlanOption | undefined): CcdGADebtorPaymentPlanGAspec | undefined => {
  if (paymentPlan) {
    switch (paymentPlan) {
      case ProposedPaymentPlanOption.ACCEPT_INSTALMENTS: return CcdGADebtorPaymentPlanGAspec.INSTALMENT;
      case ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE: return CcdGADebtorPaymentPlanGAspec.PAYFULL;
      default: exhaustiveMatchingGuard(paymentPlan);
    }
  }
};

const toCcdDebtorOfferOptions = (acceptDefendantOfferOption: YesNo): CcdGARespondentDebtorOfferOptionsGAspec => {
  switch (acceptDefendantOfferOption) {
    case YesNo.YES: return CcdGARespondentDebtorOfferOptionsGAspec.ACCEPT;
    case YesNo.NO: return CcdGARespondentDebtorOfferOptionsGAspec.DECLINE;
  }
};

export const toCcdGeneralApplicationWithResponse = (response: GaResponse): CCDRespondToApplication => {
  const acceptDefendantOffer = response?.acceptDefendantOffer;
  return {
    hearingDetailsResp: toCCDGeneralAppHearingDetails(
      response?.hearingArrangement,
      response?.hearingContactDetails,
      response?.unavailableDatesHearing,
      response?.hearingSupport,
    ),
    gaRespondentDebtorOffer: {
      respondentDebtorOffer: toCcdDebtorOfferOptions(acceptDefendantOffer?.option),
      debtorObjections: acceptDefendantOffer?.reasonProposedInstalment ? acceptDefendantOffer?.reasonProposedInstalment : acceptDefendantOffer?.reasonProposedSetDate,
      paymentPlan: toCcdPaymentPlan(acceptDefendantOffer?.type),
      monthlyInstalment: convertToPenceFromStringToString(acceptDefendantOffer?.amountPerMonth),
      paymentSetDate: acceptDefendantOffer?.proposedSetDate,
    },
    gaRespondentConsent: toCCDYesNo(response.agreeToOrder),
    generalAppRespondent1Representative: {hasAgreed: toCCDYesNo(response.respondentAgreement?.option)},
    generalAppRespondReason: response.respondentAgreement?.reasonForDisagreement,
    generalAppRespondDocument: response.wantToUploadDocuments === YesNo.YES ? translateCUItoCCD(response.uploadEvidenceDocuments) : undefined,
  };
};

export const translateCoScApplicationToCCD = (
  application: GeneralApplication,
): CCDGeneralApplication => {
  return {
    generalAppType: toCCDGeneralApplicationTypes(application.applicationTypes),
    generalAppRespondentAgreement: toCCDRespondentAgreement(application.agreementFromOtherParty),
    certOfSC: toCCDCertOfSC(application.certificateOfSatisfactionOrCancellation, application.uploadEvidenceForApplication),
    generalAppStatementOfTruth: toCCDStatementOfTruth(
      application.statementOfTruth,
    ),
    generalAppInformOtherParty: toCCDInformOtherParty(
      application.applicationTypes,
      application.agreementFromOtherParty,
      application.informOtherParties,
    ),
    generalAppEvidenceDocument: toCCDEvidenceDocuments(
      isCoScProofOfDeptPaymentExists(application.certificateOfSatisfactionOrCancellation),
      application.uploadEvidenceForApplication,
    ),
  };
};

const toCCDCertOfSC = (certificateOfSatisfactionOrCancellation?: CertificateOfSatisfactionOrCancellation, uploadDocuments?: UploadGAFiles[]): CcdGeneralApplicationCertOfSC => {
  return (certificateOfSatisfactionOrCancellation)
    ? {
      defendantFinalPaymentDate: certificateOfSatisfactionOrCancellation.defendantFinalPaymentDate.date,
      debtPaymentEvidence: certificateOfSatisfactionOrCancellation.debtPaymentEvidence,
    }
    : undefined;
};

const isCoScProofOfDeptPaymentExists = (certificateOfSatisfactionOrCancellation?: CertificateOfSatisfactionOrCancellation): YesNo => {
  if (certificateOfSatisfactionOrCancellation && certificateOfSatisfactionOrCancellation.debtPaymentEvidence ) {
    switch (certificateOfSatisfactionOrCancellation.debtPaymentEvidence.debtPaymentOption) {
      case debtPaymentOptions.UPLOAD_EVIDENCE_DEBT_PAID_IN_FULL :
      case debtPaymentOptions.MADE_FULL_PAYMENT_TO_COURT : return YesNo.YES;
      default: return YesNo.NO;
    }
  }
};
