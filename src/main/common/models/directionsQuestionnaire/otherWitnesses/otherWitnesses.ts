import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {YesNo} from '../../../form/models/yesNo';
import {OtherWitnessItems} from './otherWitnessItems';
export class OtherWitnesses {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    witnessItems?: OtherWitnessItems[];

  constructor(option?: YesNo, witnessItems?: OtherWitnessItems[]) {
    this.option = option;
    this.witnessItems = witnessItems;
  }
}
