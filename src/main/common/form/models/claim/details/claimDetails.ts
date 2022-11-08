import {Reason} from './reason';
import {Evidence} from '../../evidence/evidence';
import {HelpWithFees} from './helpWithFees';
import {ClaimantTimeline} from '../../../../../common/form/models/timeLineOfEvents/claimantTimeline';
import {QualifiedStatementOfTruth} from '../../../../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';

export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;
  timeline?: ClaimantTimeline;
  evidence?: Evidence;
  statementOfTruth?: QualifiedStatementOfTruth;

  constructor(reason?: Reason, timeline?: ClaimantTimeline, helpWithFees?: HelpWithFees, evidence?: Evidence, statementOfTruth?: QualifiedStatementOfTruth) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
    this.timeline = timeline;
    this.evidence = evidence;
    this.statementOfTruth = statementOfTruth;
  }
}
