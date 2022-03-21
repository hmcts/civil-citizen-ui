import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';

import {boolean} from 'boolean';
import {ENTER_AT_LEAST_ONE, YES_NO_REQUIRED} from '../../../validationErrors/errorMessageConstants';
import {NumberOfChildren} from './numberOfChildren';
import {AtLeastOneFieldIsPopulated} from '../../../../../common/form/validators/AtLeastOneFieldIsPopulated';

export class Dependants {

  @IsDefined({message: YES_NO_REQUIRED})
    declared?: boolean;

  @ValidateIf((d: Dependants) => d.declared === true)
  @ValidateNested()
  @AtLeastOneFieldIsPopulated({message: ENTER_AT_LEAST_ONE})
    numberOfChildren?: NumberOfChildren;

  constructor(declared?: boolean, numberOfChildren?: NumberOfChildren) {
    this.declared = declared;
    this.numberOfChildren = numberOfChildren;
  }

  static fromObject(value?: any): Dependants {
    if (!value) {
      return value;
    }

    const declared: boolean = value.declared !== undefined ? boolean(value.declared) : undefined;

    return new Dependants(
      declared,
      declared ? NumberOfChildren.fromObject(value.numberOfChildren) : undefined,
    );
  }
}
