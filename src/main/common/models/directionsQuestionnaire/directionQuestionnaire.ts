import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {SupportRequired} from '../../models/directionsQuestionnaire/supportRequired';
import {Experts} from './experts/experts';
import {VulnerabilityQuestions} from './vulnerabilityQuestions/vulnerabilityQuestions';
import {Witnesses} from './witnesses/witnesses';
import {Hearing} from './hearing/hearing';

export class DirectionQuestionnaire {
  defendantYourselfEvidence?: GenericYesNo;
  supportRequired?: SupportRequired;
  hearing?: Hearing;
  vulnerabilityQuestions?: VulnerabilityQuestions;
  experts?: Experts;
  witnesses?: Witnesses;

  constructor(
    defendantYourselfEvidence?: GenericYesNo,
    supportRequired?: SupportRequired,
    hearing?: Hearing,
    vulnerabilityQuestions?: VulnerabilityQuestions,
    experts?: Experts,
    witnesses?: Witnesses,
  ) {
    this.defendantYourselfEvidence = defendantYourselfEvidence;
    this.supportRequired = supportRequired;
    this.hearing = hearing;
    this.vulnerabilityQuestions = vulnerabilityQuestions;
    this.experts = experts;
    this.witnesses = witnesses;
  }
}
