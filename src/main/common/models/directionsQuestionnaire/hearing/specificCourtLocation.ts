import {IsDefined, IsNotEmpty} from 'class-validator';

export class SpecificCourtLocation {

  @IsDefined({message: 'ERRORS.SPECIFIC_COURT.SELECT_COURT_LOCATION'})
  @IsNotEmpty({message: 'ERRORS.SPECIFIC_COURT.SELECT_COURT_LOCATION'})
    courtLocation: string;

  @IsDefined({message: 'PAGES.SPECIFIC_COURT.REASON'})
  @IsNotEmpty({message: 'PAGES.SPECIFIC_COURT.REASON'})
    reason: string;

  constructor(courtLocation?: string, reason?: string) {
    this.courtLocation = courtLocation;
    this.reason = reason;
  }

  public static fromObject(record: Record<string, string>){
    return new SpecificCourtLocation(record?.courtLocation, record?.reason);
  }

}
