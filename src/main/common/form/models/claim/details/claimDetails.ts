import {Reason} from './reason';
import {ClaimantTimeline} from '../../../../../common/form/models/timeLineOfEvents/claimantTimeline';

export class ClaimDetails {
  reason?: Reason;
  timeline?: ClaimantTimeline;

  constructor(reason?: Reason, timeline?: ClaimantTimeline) {
    this.reason = reason;
    this.timeline = timeline;
  }
}
