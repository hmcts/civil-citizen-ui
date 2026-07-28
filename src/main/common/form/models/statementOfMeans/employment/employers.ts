import {ValidateNested} from 'class-validator';
import {Employer} from './employer';

export class Employers {
  @ValidateNested()
    rows: Employer[];

  constructor(rows?: Employer[]) {
    this.rows = rows;
  }
}
