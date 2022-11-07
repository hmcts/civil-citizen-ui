import {IsDefined, ValidateIf} from 'class-validator';
import {YesNoUpperCase} from 'common/form/models/yesNo';
import {CourtLocation} from 'models/courts/courtLocations';

export class SpecificCourtLocation {

  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option: YesNoUpperCase;
  @ValidateIf(o => {return o.isSpecificCourtRequired();})
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    courtLocation: CourtLocation;

  isSpecificCourtRequired(){
    return this.option === YesNoUpperCase.YES;
  }

}
