import { IsDefined } from 'class-validator';
import { VALID_ENTER_A_JOB_TITLE, VALID_ENTER_AN_EMPLOYER_NAME } from '../../../validationErrors/errorMessageConstants';

export class EmployerForm {

  @IsDefined({message: VALID_ENTER_AN_EMPLOYER_NAME})
  employerName: string;

  @IsDefined({message: VALID_ENTER_A_JOB_TITLE})
  jobTitle: string;

  constructor(employerName?: string, jobTitle?: string) {
    this.employerName = employerName;
    this.jobTitle = jobTitle;
  }

}
