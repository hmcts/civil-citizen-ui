import {Reason} from './reason';
import {Evidence} from '../../evidence/evidence';
import {HelpWithFees} from './helpWithFees';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {BreathingSpace} from 'models/breathingSpace';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {PaymentInformation} from 'models/feePayment/paymentInformation';

export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;
  timeline?: ClaimantTimeline;
  evidence?: Evidence;
  breathingSpace?: BreathingSpace;
  statementOfTruth?: QualifiedStatementOfTruthClaimIssue;
  claimFeePayment?: PaymentInformation;

  constructor(reason?: Reason, timeline?: ClaimantTimeline, helpWithFees?: HelpWithFees, evidence?: Evidence,breathingSpace?: BreathingSpace, statementOfTruth?: QualifiedStatementOfTruth, claimFeePayment?: PaymentInformation) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
    this.timeline = timeline;
    this.evidence = evidence;
    this.breathingSpace = breathingSpace;
    this.statementOfTruth = statementOfTruth;
    this.claimFeePayment= claimFeePayment;
  }
}
