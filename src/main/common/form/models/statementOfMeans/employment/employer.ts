import {ValidateIf, IsNotEmpty} from 'class-validator';

export class Employer {
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({ message: 'ERRORS.VALID_ENTER_AN_EMPLOYER_NAME' })
    employerName: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({ message: 'ERRORS.JOB_TITLE_REQUIRED' })
    jobTitle: string;

  constructor(employerName?: string, jobTitle?: string) {
    this.employerName = employerName;
    this.jobTitle = jobTitle;
  }

  public isEmpty(): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value?.length === 0 || value === 0 || value === null);
  }

  isAtLeastOneFieldPopulated(): boolean {
    return !this.isEmpty();
  }
}
