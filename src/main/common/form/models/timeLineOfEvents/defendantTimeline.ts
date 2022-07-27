import TimelineRow from './timelineRow';
import {MaxLength, ValidateIf, ValidateNested} from 'class-validator';
import {VALID_TEXT_LENGTH} from '../../validationErrors/errorMessageConstants';
import {FREE_TEXT_MAX_LENGTH} from '../../validators/validationConstraints';

const MINIMUM_ROWS = 4;

export class DefendantTimeline {
  @ValidateNested({each: true})
    rows: TimelineRow[];

  @ValidateIf(o => o.comment !== undefined)
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: VALID_TEXT_LENGTH})
    comment?: string;

  constructor(rows?: TimelineRow[], comment?: string) {
    this.rows = rows;
    this.comment = comment;
  }

  public static buildEmptyForm(): DefendantTimeline {
    return new DefendantTimeline(DefendantTimeline.addRemainingRows([]));
  }

  public static buildPopulatedForm(timelineOfEvents: TimelineRow[], comment?: string): DefendantTimeline {
    return new DefendantTimeline(DefendantTimeline.addRemainingRows(
      timelineOfEvents.map((timeline: TimelineRow) => {
        return TimelineRow.buildPopulatedForm(timeline.date, timeline.description);
      })), comment);
  }

  private static addRemainingRows(timelineOfEvents: TimelineRow[]): TimelineRow[] {
    const additionalRows = [];
    if (timelineOfEvents?.length < MINIMUM_ROWS) {
      for (let i = 0; i < MINIMUM_ROWS - timelineOfEvents.length; i++) {
        additionalRows.push(new TimelineRow());
      }
    }
    return timelineOfEvents.concat(additionalRows);
  }

  filterOutEmptyRows() {
    if (this.rows?.length) {
      this.rows = this.rows.filter(row => row.isAtLeastOneFieldPopulated());
    }
  }
}
