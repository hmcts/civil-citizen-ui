import dayjs from 'dayjs';
import currencyFormat from '../utils/currencyFormat';
import {Respondent} from './respondent';

export class Claim {
  legacyCaseReference: string;
  applicant1: Individual;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;
  detailsOfClaim: string;
  respondent1: Respondent;
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;

  formattedResponseDeadline(): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).format('D MMMM YYYY') : '';
  }

  formattedTotalClaimAmount(): string {
    return this.totalClaimAmount ? currencyFormat(this.totalClaimAmount) : '';
  }
}

class Individual {
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
}
