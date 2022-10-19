import {TimelineRow} from '../../models/timeLineOfEvents/timelineRow';
import {ValidateNested} from 'class-validator';
import {AtLeastOneRowIsPopulated} from '../../../../common/form/validators/atLeastOneRowIsPopulated';

const MINIMUM_ROWS = 4;

export class ClaimantTimeline {
  @AtLeastOneRowIsPopulated( {message: 'ERRORS.ONE_ROW_REQUIRED'})
  @ValidateNested({each: true})
    rows: TimelineRow[];

  constructor(rows?: TimelineRow[]) {
    this.rows = rows;
  }

  public static buildEmptyForm(): ClaimantTimeline {
    return new ClaimantTimeline(ClaimantTimeline.addRemainingRows([]));
  }

  public static buildPopulatedForm(timelineOfEvents: TimelineRow[]): ClaimantTimeline {
    return new ClaimantTimeline(ClaimantTimeline.addRemainingRows(
      timelineOfEvents.map((timeline: TimelineRow) => {
        return TimelineRow.buildPopulatedForm(timeline.date, timeline.description);
      })));
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

  atLeastOneRowPopulated(): boolean {
    const emptyRows = this.rows?.filter(row => row.isAtLeastOneFieldPopulated());
    return emptyRows.length > 0;
  }

  filterOutEmptyRows() {
    if (this.rows?.length) {
      this.rows = this.rows.filter(row => row.isAtLeastOneFieldPopulated());
    }
  }
}
