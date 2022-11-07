import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {YesNo} from 'common/form/models/yesNo';

export class SpecificCourtLocation {

  @IsDefined({message: 'ERRORS.SPECIFIC_COURT.SELECT_YES_NO'})
    option: string;
  @ValidateIf(o =>  o.isSpecificCourtRequired())
  @IsDefined({message: 'ERRORS.SPECIFIC_COURT.SELECT_COURT_LOCATION'})
    courtLocation: string;
  @ValidateIf(o => o.isSpecificCourtRequired())
  @IsDefined({message: 'PAGES.SPECIFIC_COURT.REASON'})
  @IsNotEmpty({message: 'PAGES.SPECIFIC_COURT.REASON'})
    reason: string;

  constructor(option?: string, courtLocation?: string, reason?: string) {
    this.option = option;
    this.courtLocation = courtLocation;
    this.reason = reason;
  }

  isSpecificCourtRequired(){
    return this.option === YesNo.YES;
  }

  public static fromObject(record: Record<string, string>){
    return new SpecificCourtLocation(record?.option, record?.courtLocation, record?.reason);
  }

}
