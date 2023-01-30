import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {Experts} from './experts/experts';
import {VulnerabilityQuestions} from './vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from './welshLanguageRequirements/welshLanguageRequirements';
import {Witnesses} from './witnesses/witnesses';
import {Hearing} from './hearing/hearing';
import {YesNo} from 'common/form/models/yesNo';
import {getCalculatedDays} from 'services/features/directionsQuestionnaire/whyUnavailableForHearingService';

export class DirectionQuestionnaire {
  defendantYourselfEvidence?: GenericYesNo;
  hearing?: Hearing;
  vulnerabilityQuestions?: VulnerabilityQuestions;
  experts?: Experts;
  welshLanguageRequirements?: WelshLanguageRequirements;
  witnesses?: Witnesses;

  constructor(
    defendantYourselfEvidence?: GenericYesNo,
    hearing?: Hearing,
    vulnerabilityQuestions?: VulnerabilityQuestions,
    experts?: Experts,
    welshLanguageRequirements?: WelshLanguageRequirements,
    witnesses?: Witnesses,
  ) {
    this.defendantYourselfEvidence = defendantYourselfEvidence;
    this.hearing = hearing;
    this.vulnerabilityQuestions = vulnerabilityQuestions;
    this.experts = experts;
    this.welshLanguageRequirements = welshLanguageRequirements;
    this.witnesses = witnesses;
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
    if (this.experts?.defendantExpertEvidence?.option === YesNo.NO) {
      return true;
    }
    if (this.experts?.sentExpertReports &&
      this.experts?.sharedExpert &&
      this.isExpertDetailsAvailable) {
      return true;
    }
    return false;
  }

  async isUnavailabilityDatesCompleted (): Promise<boolean> {
    // TODO : include completion logic for unavailable dates when `unavailable-for-hearing` page is developed
    const days = await getCalculatedDays();
    if (days > 30 && !this.hearing?.whyUnavailableForHearing) {
      return false;
    }
    return true;
  }
}
