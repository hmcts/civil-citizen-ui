import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {Experts} from './experts/experts';
import {VulnerabilityQuestions} from './vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from './welshLanguageRequirements/welshLanguageRequirements';
import {Witnesses} from './witnesses/witnesses';
import {Hearing} from './hearing/hearing';
import {YesNo} from 'common/form/models/yesNo';
import {getNumberOfUnavailableDays} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';

const UNAVAILABLE_DAYS_LIMIT = 30;

export class DirectionQuestionnaire {
  defendantYourselfEvidence?: GenericYesNo;
  hearing?: Hearing;
  vulnerabilityQuestions?: VulnerabilityQuestions;
  experts?: Experts;
  welshLanguageRequirements?: WelshLanguageRequirements;
  witnesses?: Witnesses;
  confirmYourDetailsEvidence?: ConfirmYourDetailsEvidence;

  constructor(
    defendantYourselfEvidence?: GenericYesNo,
    hearing?: Hearing,
    vulnerabilityQuestions?: VulnerabilityQuestions,
    experts?: Experts,
    welshLanguageRequirements?: WelshLanguageRequirements,
    witnesses?: Witnesses,
    confirmYourDetailsEvidence?: ConfirmYourDetailsEvidence,
  ) {
    this.defendantYourselfEvidence = defendantYourselfEvidence;
    this.hearing = hearing;
    this.vulnerabilityQuestions = vulnerabilityQuestions;
    this.experts = experts;
    this.welshLanguageRequirements = welshLanguageRequirements;
    this.witnesses = witnesses;
    this.confirmYourDetailsEvidence = confirmYourDetailsEvidence;
  }

  get expertReportDetailsAvailable(): boolean {
    return this.experts?.expertReportDetails?.option === YesNo.YES;
  }

  get notRequestedToAskPermissiontoUseExpert(): boolean {
    return this.experts?.permissionForExpert?.option === YesNo.NO;
  }

  get nothingExpertCanExamine(): boolean {
    return this.experts?.expertCanStillExamine?.option === YesNo.NO;
  }

  get isExpertDetailsAvailable(): boolean {
    return !!this.experts?.expertDetailsList?.items?.length;
  }

  get isSmallClaimsDQJourneyCompleted(): boolean {
    if (
      this.hearing?.determinationWithoutHearing &&
      this.isExpertJourneyCompleted &&
      this.isCommonDQJourneyCompleted
    ) {
      return true;
    }
    return false;
  }

  get isFastTrackDQJourneyCompleted(): boolean {
    if (
      this.hearing?.triedToSettle &&
      this.hearing?.requestExtra4weeks &&
      this.hearing?.considerClaimantDocuments &&
      this.isExpertEvidenceJourneyCompleted &&
      this.isCommonDQJourneyCompleted
    ) {
      return true;
    }
    return false;
  }

  get isCommonDQJourneyCompleted(): boolean {
    if (
      this.defendantYourselfEvidence &&
      this.witnesses?.otherWitnesses &&
      this.isUnavailabilityDatesCompleted &&
      this.hearing?.phoneOrVideoHearing &&
      this.vulnerabilityQuestions?.vulnerability &&
      this.hearing?.supportRequiredList &&
      this.hearing?.specificCourtLocation &&
      this.welshLanguageRequirements?.language
    ) {
      return true;
    }
    return false;
  }

  get isExpertJourneyCompleted(): boolean {
    if (!this.experts?.expertRequired) {
      return true;
    }
    if (this.expertReportDetailsAvailable ||
      this.notRequestedToAskPermissiontoUseExpert ||
      this.nothingExpertCanExamine ||
      this.isExpertDetailsAvailable) {
      return true;
    }
    return false;
  }

  get isExpertEvidenceJourneyCompleted(): boolean {
    if (this.experts?.expertEvidence?.option === YesNo.NO) {
      return true;
    }
    if (this.experts?.sentExpertReports &&
      this.experts?.sharedExpert &&
      this.isExpertDetailsAvailable) {
      return true;
    }
    return false;
  }

  get isUnavailabilityDatesCompleted(): boolean {
    if (this.hearing?.cantAttendHearingInNext12Months?.option === YesNo.NO) {
      return true;
    }
    if (this.hearing?.cantAttendHearingInNext12Months?.option === YesNo.YES) {
      const numberOfUnavailableDays = getNumberOfUnavailableDays(this.hearing?.unavailableDatesForHearing);
      if (numberOfUnavailableDays > UNAVAILABLE_DAYS_LIMIT && !this.hearing?.whyUnavailableForHearing) {
        return false;
      }
      if (numberOfUnavailableDays) {
        return true;
      }
    }
    return false;
  }

  getReasonForHearing(): string {
    return this.hearing?.determinationWithoutHearing?.reasonForHearing;
  }

  getDecisionDeterminationWithoutHearing() : string {
    return this.hearing?.determinationWithoutHearing?.option;
  }
}
