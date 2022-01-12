import dayjs from 'dayjs';

export class Claim {
  legacyCaseReference: string;
  applicant1: Individual;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;

  formattedResponseDeadline(): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).format('D MMMM YYYY') : '';
  }
}

class Individual {
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
}
