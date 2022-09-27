import {YesNo} from 'common/form/models/yesNo';
import {Witness} from './witness';
export interface Witnesses {
  option?: YesNo
  witnessItems?: Witness[];
}
