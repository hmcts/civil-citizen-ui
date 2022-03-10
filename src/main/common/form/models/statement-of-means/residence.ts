import {ResidenceType} from 'common/form/models/statement-of-means/residenceType';
import {
  VALID_HOUSING,
  VALID_OPTION_SELECTION,
  VALID_TEXT_LENGTH,
} from 'common/form/validationErrors/errorMessageConstants';
import {IsDefined, IsIn, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from 'common/form/validators/validationConstraints';

export class Residence {
  @IsDefined({message: VALID_OPTION_SELECTION})
  @IsIn(ResidenceType.all(), {message: VALID_OPTION_SELECTION})
    type?: ResidenceType;

  @ValidateIf((o: Residence) => o.type && o.type.value === ResidenceType.OTHER.value)
  @IsDefined({message: VALID_HOUSING})
  @IsNotEmpty({message: VALID_HOUSING})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: VALID_TEXT_LENGTH})
    housingDetails?: string;

  constructor(type?: ResidenceType, housingDetails?: string) {
    this.type = type;
    this.housingDetails = housingDetails;
  }

  get residenceType() {
    if (this.type === ResidenceType.OTHER) {
      return this.housingDetails;
    } else {
      return this.type.displayValue;
    }
  }
}
