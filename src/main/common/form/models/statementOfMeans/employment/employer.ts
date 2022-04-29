import {ValidateIf, IsNotEmpty} from 'class-validator';
import {VALID_ENTER_A_JOB_TITLE, VALID_ENTER_AN_EMPLOYER_NAME} from '../../../validationErrors/errorMessageConstants';

export class Employer {

  @ValidateIf(o => o.employerName !== '' || o.jobTitle !== '')
  @IsNotEmpty({ message: VALID_ENTER_AN_EMPLOYER_NAME })
    employerName: string;

  @ValidateIf(o => o.employerName !== '' || o.jobTitle !== '')
  @IsNotEmpty({ message: VALID_ENTER_A_JOB_TITLE })
    jobTitle: string;

  constructor(employerName?: string, jobTitle?: string) {
    this.employerName = employerName;
    this.jobTitle = jobTitle;
  }
}
