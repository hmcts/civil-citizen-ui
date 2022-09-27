import {ExpertDetails} from './expertDetails';
import {ValidateNested} from 'class-validator';

export class ExpertDetailsList {

  @ValidateNested()
    items: ExpertDetails[];

  constructor(items?: ExpertDetails[]) {
    this.items = items;
  }
}
