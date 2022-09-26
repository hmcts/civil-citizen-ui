import {ExpertDetails} from './expertDetails';
import {ValidateNested} from 'class-validator';
// import { AtLeastOneRowIsPopulated } from '../../../../common/form/validators/atLeastOneRowIsPopulated';

export class ExpertDetailsList {
  
  @ValidateNested()
  // @AtLeastOneRowIsPopulated({message: 'ERRORS.ENTER_AT_LEAST_ONE_EXPERT_DETAILS'})
    items: ExpertDetails[];

  constructor(items?: ExpertDetails[]) {
    this.items = items;
  }
}
