import dayjs from 'dayjs';
import currencyFormat from '../utils/currencyFormat';
import {Respondent} from './respondent';
import {StatementOfMeans} from './statementOfMeans';
import {CounterpartyType} from './counterpartyType';

export class Claim {
  legacyCaseReference: string;
  applicant1?: Individual | Organisation;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date = new Date();
  detailsOfClaim: string;
  respondent1?: Respondent;
  statementOfMeans?: StatementOfMeans;


  formattedResponseDeadline(): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).format('D MMMM YYYY') : '';
  }

  formattedTotalClaimAmount(): string {
    return this.totalClaimAmount ? currencyFormat(this.totalClaimAmount) : '';
  }
}

export class Individual {
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
  type: CounterpartyType;
}

export class Organisation {
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
  type: CounterpartyType;
}


