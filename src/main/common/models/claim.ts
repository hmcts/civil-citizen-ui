import dayjs from 'dayjs';
import format from '../../common/utils/moneyFormatter';

export class Claim {
  legacyCaseReference: string;
  applicant1: Individual;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;

  formattedResponseDeadline(): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).format('D MMMM YYYY') : '';
  }

  formattedTotalClaimAmount(): string {
    return this.totalClaimAmount ? format(this.totalClaimAmount) : '';
  }
}

class Individual {
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
}
