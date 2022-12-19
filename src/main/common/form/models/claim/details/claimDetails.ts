import {Reason} from './reason';
import {Evidence} from '../../evidence/evidence';
import {HelpWithFees} from './helpWithFees';
import {ClaimantTimeline} from '../../../../../common/form/models/timeLineOfEvents/claimantTimeline';
import {QualifiedStatementOfTruth} from '../../../../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {BreathingSpace} from '../../../../models/breathingSpace';

export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;
  timeline?: ClaimantTimeline;
  evidence?: Evidence;
  breathingSpace?: BreathingSpace;
  statementOfTruth?: QualifiedStatementOfTruth;

  constructor(reason?: Reason, timeline?: ClaimantTimeline, helpWithFees?: HelpWithFees, evidence?: Evidence,breathingSpace?: BreathingSpace, statementOfTruth?: QualifiedStatementOfTruth) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
    this.timeline = timeline;
    this.evidence = evidence;
    this.breathingSpace = breathingSpace;
    this.statementOfTruth = statementOfTruth;
  }
}
