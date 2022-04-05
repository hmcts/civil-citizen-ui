import {IsInt, Min, ValidateIf} from 'class-validator';
import {VALID_INTEGER, VALID_POSITIVE_NUMBER} from '../../../validationErrors/errorMessageConstants';
import {toNumberOrUndefined} from '../../../../utils/numberConverter';

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


