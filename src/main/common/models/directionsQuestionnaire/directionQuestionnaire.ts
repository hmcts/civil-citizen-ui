import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {Experts} from './experts/experts';
import {VulnerabilityQuestions} from './vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from './welshLanguageRequirements/welshLanguageRequirements';
import {Witnesses} from './witnesses/witnesses';
import {Hearing} from './hearing/hearing';

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

  get isExpertRequired(): boolean{
    return !!this.experts?.expertReportDetails?.option;
  }

  get isWithoutExpertJournetCompleted(): boolean {
    return !!this.defendantYourselfEvidence?.option &&
      !!this.witnesses?.otherWitnesses.option;
  }
}
