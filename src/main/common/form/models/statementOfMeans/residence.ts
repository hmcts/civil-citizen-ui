import {ResidenceType} from './residenceType';
import {IsIn, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../validators/validationConstraints';

export class Residence {
  @IsIn(ResidenceType.all(), {message: 'ERRORS.VALID_OPTION_SELECTION'})
    type?: ResidenceType;

  @ValidateIf((o: Residence) => o.type?.value === ResidenceType.OTHER.value)
  @IsNotEmpty({message: 'ERRORS.VALID_HOUSING'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.VALID_TEXT_LENGTH'})
    housingDetails?: string;

  constructor(type?: ResidenceType, housingDetails?: string) {
    this.type = type;
    this.housingDetails = housingDetails;
  }
}
