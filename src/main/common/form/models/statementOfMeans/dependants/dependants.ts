import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';

import {boolean, isBooleanable} from 'boolean';
import {
  VALID_ENTER_AT_LEAST_ONE_NUMBER,
  VALID_YES_NO_SELECTION,
} from '../../../validationErrors/errorMessageConstants';
import {NumberOfChildren} from './numberOfChildren';
import {AtLeastOneFieldIsPopulated} from '../../../validators/atLeastOneFieldIsPopulated';

export class Dependants {

  @IsDefined({message: VALID_YES_NO_SELECTION})
    declared?: boolean;

  @ValidateIf((d: Dependants) => d.declared === true)
  @ValidateNested()
  @AtLeastOneFieldIsPopulated({message: VALID_ENTER_AT_LEAST_ONE_NUMBER})
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

  public hasChildrenBetween16and19(): boolean {
    return this?.numberOfChildren?.between16and19 > 0;
  }
}
