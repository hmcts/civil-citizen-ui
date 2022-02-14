import dayjs from 'dayjs';
import currencyFormat from '../utils/currencyFormat';

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

export class PrimaryAddress {
  County: string;
  Country: string;
  PostCode: string;
  PostTown: string;
  AddressLine1: string;
  AddressLine2: string;
  AddressLine3: string;
}
export class Respondent {
  primaryAddress: PrimaryAddress;
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
  individualDateOfBirth: Date;
}
class Individual {
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
  individualDateOfBirth:Date;
}
