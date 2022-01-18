import dayjs from 'dayjs';
import currencyFormat from '../utils/currencyFormat';

export class Claim {
  legacyCaseReference: string;
  applicant1: Individual;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;

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
