import dayjs from 'dayjs';
import currencyFormat from '../utils/currencyFormat';
import {Respondent} from './respondent';
import {StatementOfMeans} from './statementOfMeans';
import {CounterpartyType} from './counterpartyType';
import {NumberOfDays} from '../form/models/numberOfDays';
import {RepaymentPlan} from './repaymentPlan';
import {PartialAdmission} from './partialAdmission';
import {DefendantEvidence} from './evidence/evidence';
import {Mediation} from './mediation/mediation';
import {RejectAllOfClaim} from '../form/models/rejectAllOfClaim';
import {CorrespondenceAddress} from './correspondenceAddress';
import {TimeLineOfEvents} from './timelineOfEvents/timeLineOfEvents';
import {Defence} from '../form/models/defence';
import {convertDateToLuxonDate, currentDateTime, isPastDeadline} from '../utils/dateUtils';
import {StatementOfTruthForm} from '../form/models/statementOfTruth/statementOfTruthForm';
import PaymentOptionType from '../form/models/admission/fullAdmission/paymentOption/paymentOptionType';

export const MAX_CLAIM_AMOUNT = 10000;

export class Claim {
  legacyCaseReference: string;
  applicant1?: Party;
  specApplicantCorrespondenceAddressdetails?: CorrespondenceAddress;
  applicantSolicitor1ServiceAddress?: CorrespondenceAddress;
  applicantSolicitor1ClaimStatementOfTruth?: StatementOfTruth;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;
  detailsOfClaim: string;
  respondent1?: Respondent;
  statementOfMeans?: StatementOfMeans;
  defence?: Defence;
  paymentOption?: string;
  repaymentPlan?: RepaymentPlan;
  paymentDate?: Date;
  partialAdmission?: PartialAdmission;
  rejectAllOfClaim?: RejectAllOfClaim;
  mediation?: Mediation;
  evidence?: DefendantEvidence;
  timelineOfEvents?: TimeLineOfEvents[];
  taskSharedFinancialDetails?: boolean;
  defendantStatementOfTruth?: StatementOfTruthForm;


  formattedResponseDeadline(): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).format('DD MMMM YYYY') : '';
  }

  formattedTotalClaimAmount(): string {
    return this.totalClaimAmount ? currencyFormat(this.totalClaimAmount) : '';
  }

  responseInDays(): NumberOfDays {
    return this.totalClaimAmount < MAX_CLAIM_AMOUNT ? NumberOfDays.FOURTEEN : NumberOfDays.TWENTYEIGHT;
  }

  getRemainingDays(): number {
    const remainingDuration = convertDateToLuxonDate(this.respondent1ResponseDeadline).diff(currentDateTime(), 'days');
    return Math.trunc(remainingDuration.days);
  }

  isDeadLinePassed(): boolean {
    return isPastDeadline(this.respondent1ResponseDeadline);
  }

  isEmpty(): boolean {
    return !this.applicant1;
  }

  isPaymentOptionBySetDate(): boolean {
    return this.paymentOption === PaymentOptionType.BY_SET_DATE;
  }
}

export interface Party {
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  companyName?: string;
  type: CounterpartyType;
  primaryAddress?: CorrespondenceAddress;
  phoneNumber?: string;
}

export interface StatementOfTruth {
  name?: string;
  role?: string;
}
