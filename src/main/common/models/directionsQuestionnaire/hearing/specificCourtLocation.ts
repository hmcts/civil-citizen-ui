import {IsDefined, ValidateIf} from 'class-validator';
import {YesNoUpperCase} from 'common/form/models/yesNo';
import {CourtLocation} from 'models/courts/courtLocations';

export class SpecificCourtLocation {

  @IsDefined({message: 'ERRORS.SPECIFIC_COURT.SELECT_YES_NO'})
    option: YesNoUpperCase;
  @ValidateIf(o => {return o.isSpecificCourtRequired();})
  @IsDefined({message: 'ERRORS.SPECIFIC_COURT.SELECT_COURT_LOCATION'})
    courtLocation: CourtLocation;

  isSpecificCourtRequired(){
    return this.option === YesNoUpperCase.YES;
  }

}
