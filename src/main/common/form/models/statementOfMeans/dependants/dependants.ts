import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';

import {boolean, isBooleanable} from 'boolean';
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

  static fromObject(_declared: unknown, under11?: string, between11and15?: string, between16and19?: string): Dependants {
    const declared: boolean = isBooleanable(_declared) ? boolean(_declared) : undefined;

    return new Dependants(
      declared,
      declared ? NumberOfChildren.fromObject(under11, between11and15, between16and19) : undefined,
    );
  }
}
