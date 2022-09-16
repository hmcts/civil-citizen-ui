import {IsDefined} from 'class-validator';
import {ExpertReportsOptions} from "../../models/directionsQuestionnaire/expertReportsOptions";

export class ExpertReports {

  @IsDefined({ message: 'ERRORS.VALID_EXPERT_REPORTS' })
    option?: ExpertReportsOptions;

  constructor(option?: ExpertReportsOptions) {
    this.option = option;
  }
}
