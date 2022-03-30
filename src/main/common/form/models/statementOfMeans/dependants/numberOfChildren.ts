import {IsInt, Min, ValidateIf} from 'class-validator';
import {VALID_INTEGER, VALID_POSITIVE_NUMBER} from '../../../validationErrors/errorMessageConstants';

export class NumberOfChildren {

  @ValidateIf((o: NumberOfChildren) => o.under11 !== undefined)
  @IsInt({message: VALID_INTEGER})
  @Min(0, {message: VALID_POSITIVE_NUMBER})
    under11?: number;

  @ValidateIf((o: NumberOfChildren) => o.between11and15 !== undefined)
  @IsInt({message: VALID_INTEGER})
  @Min(0, {message: VALID_POSITIVE_NUMBER})
    between11and15?: number;

  @ValidateIf((o: NumberOfChildren) => o.between16and19 !== undefined)
  @IsInt({message: VALID_INTEGER})
  @Min(0, {message: VALID_POSITIVE_NUMBER})
    between16and19?: number;

  constructor(under11?: number, between11and15?: number, between16and19?: number) {
    this.under11 = under11;
    this.between11and15 = between11and15;
    this.between16and19 = between16and19;
  }

  static fromObject(under11?: string, between11and15?: string, between16and19?: string) {

    return new NumberOfChildren(
      toNumberOrUndefined(under11),
      toNumberOrUndefined(between11and15),
      toNumberOrUndefined(between16and19),
    );
  }
}

export function totalNumberOfChildren(numberOfChildren: NumberOfChildren) {
  let total = 0;
  if (!Number.isNaN(numberOfChildren.under11)){
    total += numberOfChildren.under11;
  }
  if (!Number.isNaN(numberOfChildren.between11and15)){
    total += numberOfChildren.between11and15;
  }
  if (!Number.isNaN(numberOfChildren.between16and19)) {
    total += numberOfChildren.between16and19;
  }
  return total;
}

function toNumberOrUndefined(value: string): number {
  const numberValue: number = parseFloat(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
}
