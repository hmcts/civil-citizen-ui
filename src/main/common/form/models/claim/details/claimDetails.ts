import {Reason} from './reason';
import {HelpWithFees} from './helpWithFees';
import {ClaimantTimeline} from '../../../../../common/form/models/timeLineOfEvents/claimantTimeline';

export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;
  timeline?: ClaimantTimeline;

  constructor(reason?: Reason, helpWithFees?: HelpWithFees, timeline?: ClaimantTimeline) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
    this.timeline = timeline;
  }
}
