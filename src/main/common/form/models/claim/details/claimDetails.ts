import {Reason} from './reason';
import {Evidence} from '../../evidence/evidence';
import {HelpWithFees} from './helpWithFees';
import {ClaimantTimeline} from '../../../../../common/form/models/timeLineOfEvents/claimantTimeline';

export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;
  timeline?: ClaimantTimeline;
  evidence?: Evidence;

  constructor(reason?: Reason,timeline?: ClaimantTimeline,helpWithFees?: HelpWithFees,evidence?: Evidence) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
    this.timeline = timeline;
    this.evidence = evidence;
  }
}
