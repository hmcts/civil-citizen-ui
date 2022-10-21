import {Reason} from './reason';
import {Evidence} from '../../evidence/evidence';
import {ClaimantTimeline} from '../../../../../common/form/models/timeLineOfEvents/claimantTimeline';

export class ClaimDetails {
  evidence?: Evidence;
  reason?: Reason;
  timeline?: ClaimantTimeline;

  constructor(reason?: Reason,evidence?: Evidence,timeline?: ClaimantTimeline) {
    this.reason = reason;
    this.evidence = evidence;
    this.timeline = timeline;
  }
}
