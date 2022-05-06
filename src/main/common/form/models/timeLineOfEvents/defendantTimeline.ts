import TimelineRow from './timelineRow';
import {MaxLength, ValidateIf} from 'class-validator';
import {VALID_TEXT_LENGTH} from '../../validationErrors/errorMessageConstants';
import {FREE_TEXT_MAX_LENGTH} from '../../validators/validationConstraints';

export class DefendantTimeline {
  rows: TimelineRow[];

  @ValidateIf(o => o.comment !== undefined)
  @MaxLength(FREE_TEXT_MAX_LENGTH, { message: VALID_TEXT_LENGTH})
    comment?: string;
}
