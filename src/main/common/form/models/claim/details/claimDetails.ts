import {Reason} from './reason';
import {Evidence} from '../../evidence/evidence';
export class ClaimDetails {
  evidence: Evidence;
  reason?: Reason;

  constructor(reason?: Reason,evidence?: Evidence) {
    this.reason = reason;
    this.evidence = evidence;
  }
}
