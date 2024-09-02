import {IsNotEmpty} from 'class-validator';

export class ComplexityBand {

  @IsNotEmpty({message: 'ERRORS.CHOOSE_COMPLEXITY_BAND'})
    complexityBand?: string;

  constructor(complexityBand?: string) {
    this.complexityBand = complexityBand;
  }
}
