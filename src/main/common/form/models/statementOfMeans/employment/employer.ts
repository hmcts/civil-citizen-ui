import {ValidateIf, IsNotEmpty} from 'class-validator';

export class Employer {
  @ValidateIf(o => o.employerName !== '' || o.jobTitle !== '')
  @IsNotEmpty({ message: 'ERRORS.VALID_ENTER_AN_EMPLOYER_NAME' })
    employerName: string;

  @ValidateIf(o => o.employerName !== '' || o.jobTitle !== '')
  @IsNotEmpty({ message: 'ERRORS.JOB_TITLE_REQUIRED' })
    jobTitle: string;

  constructor(employerName?: string, jobTitle?: string) {
    this.employerName = employerName;
    this.jobTitle = jobTitle;
  }
}
