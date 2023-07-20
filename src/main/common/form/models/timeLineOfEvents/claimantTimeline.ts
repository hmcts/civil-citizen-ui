import {TimelineRow} from '../../models/timeLineOfEvents/timelineRow';
import {ValidateNested} from 'class-validator';
import {AtLeastOneRowIsPopulated} from '../../../../common/form/validators/atLeastOneRowIsPopulated';

export const MINIMUM_ROWS = 4;

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

  public static buildPopulatedForm(rows: TimelineRow[]): ClaimantTimeline {
    return new ClaimantTimeline(ClaimantTimeline.addRemainingRows(
      rows.map((timeline: TimelineRow) => {
        return TimelineRow.buildPopulatedForm(timeline.day, timeline.month, timeline.year, timeline.description);
      })));
  }

  private static addRemainingRows(rows: TimelineRow[]): TimelineRow[] {
    const additionalRows = [];
    if (rows?.length < MINIMUM_ROWS) {
      for (let i = 0; i < MINIMUM_ROWS - rows.length; i++) {
        additionalRows.push(new TimelineRow());
      }
    }
    return rows.concat(additionalRows);
  }

  filterOutEmptyRows() {
    if (this.rows?.length) {
      this.rows = this.rows.filter(row => row.isAtLeastOneFieldPopulated());
    }
  }
}
