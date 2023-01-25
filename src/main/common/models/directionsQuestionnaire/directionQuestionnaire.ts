import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {Experts} from './experts/experts';
import {VulnerabilityQuestions} from './vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from './welshLanguageRequirements/welshLanguageRequirements';
import {Witnesses} from './witnesses/witnesses';
import {Hearing} from './hearing/hearing';
import {YesNo} from 'common/form/models/yesNo';

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

  get expertReportDetailsNotAvailable(): boolean {
    return this.experts?.expertReportDetails?.option === YesNo.NO;
  }

  get requestedToAskPermissiontoUseExpert(): boolean {
    return this.experts?.permissionForExpert?.option === YesNo.YES;
  }

  get expertCanStillExamineSomething(): boolean {
    return this.experts?.expertCanStillExamine?.option === YesNo.YES;
  }

  get isExpertDetailsAvailable(): boolean {
    return !!this.experts?.expertDetailsList?.items?.length;
  }

  get isExpertJourneyCompleted(): boolean {
    if (!this.experts?.expertRequired) {
      return true;
    }
    if (this.expertReportDetailsAvailable) {
      return true;
    } else if (this.expertReportDetailsNotAvailable &&
      this.experts?.permissionForExpert?.option === YesNo.NO) {
      return true;
    } else if (this.expertReportDetailsNotAvailable &&
      this.requestedToAskPermissiontoUseExpert &&
      this.experts?.expertCanStillExamine?.option === YesNo.NO) {
      return true;
    } else if (this.expertReportDetailsNotAvailable &&
      this.requestedToAskPermissiontoUseExpert &&
      this.expertCanStillExamineSomething &&
      this.isExpertDetailsAvailable) {
      return true;
    }
    return false;
  }

  get isUnavailabilityDatesCompleted(): boolean {
    // TODO : include completion logic for unavailable dates when `unavailable-for-hearing` page is developed
    if (!this.hearing?.whyUnavailableForHearing) {
      return false;
    }
    return true;
  }
}
