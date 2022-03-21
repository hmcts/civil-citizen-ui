import { IsInt, Min, ValidateIf } from 'class-validator';
import {INTEGER_REQUIRED, NON_NEGATIVE_NUMBER_REQUIRED} from '../../../validationErrors/errorMessageConstants';

export class NumberOfChildren {

  @ValidateIf((o: NumberOfChildren) => o.under11 !== undefined)
  @IsInt({ message: INTEGER_REQUIRED })
  @Min(0, { message: NON_NEGATIVE_NUMBER_REQUIRED })
    under11: number;

  @ValidateIf((o: NumberOfChildren) => o.between11and15 !== undefined)
  @IsInt({ message: INTEGER_REQUIRED })
  @Min(0, { message: NON_NEGATIVE_NUMBER_REQUIRED })
    between11and15: number;

  @ValidateIf((o: NumberOfChildren) => o.between16and19 !== undefined)
  @IsInt({ message: INTEGER_REQUIRED })
  @Min(0, { message: NON_NEGATIVE_NUMBER_REQUIRED })
    between16and19: number;

  constructor (under11?: number, between11and15?: number, between16and19?: number) {
    this.under11 = under11;
    this.between11and15 = between11and15;
    this.between16and19 = between16and19;
  }

  static fromObject(value?: any) {
    if (!value) {
      return value;
    }

    return new NumberOfChildren(
      parseInt(value.under11),
      parseInt(value.between11and15),
      parseInt(value.between16and19),
    );
  }
}
