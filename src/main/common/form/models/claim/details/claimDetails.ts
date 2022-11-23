import {Reason} from './reason';
import {Evidence} from '../../evidence/evidence';
import {HelpWithFees} from './helpWithFees';
import {ClaimantTimeline} from 'common/form/models/timeLineOfEvents/claimantTimeline';
import {BreathingSpace} from 'models/breathingSpace';

export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;
  timeline?: ClaimantTimeline;
  evidence?: Evidence;
  breathingSpace?: BreathingSpace;

  constructor(reason?: Reason,timeline?: ClaimantTimeline,helpWithFees?: HelpWithFees,evidence?: Evidence,breathingSpace?: BreathingSpace) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
    this.timeline = timeline;
    this.evidence = evidence;
    this.breathingSpace = breathingSpace;
  }
}
