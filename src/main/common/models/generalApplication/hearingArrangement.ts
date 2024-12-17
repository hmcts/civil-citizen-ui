import {IsDefined, IsNotEmpty, MaxLength} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';

export enum HearingTypeOptions {
    PERSON_AT_COURT = 'PERSON_AT_COURT',
    VIDEO_CONFERENCE = 'VIDEO_CONFERENCE',
    TELEPHONE = 'TELEPHONE',
    WITHOUT_HEARING = 'WITHOUT_HEARING',
}

export class HearingArrangement {
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.CHOOSE_HEARING_TYPE'})
    option?: HearingTypeOptions;

  @IsDefined({ message: 'ERRORS.GENERAL_APPLICATION.WHY_PREFER_THIS_HEARING_TYPE' })
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.WHY_PREFER_THIS_HEARING_TYPE'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, { message: 'ERRORS.VALID_TEXT_LENGTH' })
    reasonForPreferredHearingType?: string;
  courtLocation?: string;
  constructor(option?: HearingTypeOptions, reasonForPreferredHearingType?: string, courtLocation?: string) {
    this.option = option;
    this.reasonForPreferredHearingType = reasonForPreferredHearingType;
    this.courtLocation = courtLocation;
  }
}
