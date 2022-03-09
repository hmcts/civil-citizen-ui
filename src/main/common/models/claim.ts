import dayjs from 'dayjs';
import currencyFormat from '../utils/currencyFormat';
import {Respondent} from './respondent';
import {CounterpartyType} from './counterpartyType';

export class Claim {
  legacyCaseReference: string;
  applicant1?: Individual | Organisation;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date = new Date();
  detailsOfClaim: string;
  respondent1?: Respondent;


  formattedResponseDeadline(): string {
    return this.respondent1ResponseDeadline ? dayjs(this.respondent1ResponseDeadline).format('D MMMM YYYY') : '';
  }

  formattedTotalClaimAmount(): string {
    return this.totalClaimAmount ? currencyFormat(this.totalClaimAmount) : '';
  }

  getApplicantCounterpartyType() : string {
    if (this.applicant1) {
      switch (this.applicant1.type) {
        case CounterpartyType.individual:
          return CounterpartyType.individual.toString();
        case CounterpartyType.organisation:
          return CounterpartyType.organisation.toString();
        case CounterpartyType.company:
          return CounterpartyType.company.toString();
        case CounterpartyType.soleTrader:
          return CounterpartyType.soleTrader.toString();
        default:
          throw Error('Error:: invalid applicant type');
      }
    }
  }

  getRespondentCounterpartyType() : string {
    if (this.respondent1) {
      switch (this.respondent1.type) {
        case CounterpartyType.individual:
          return CounterpartyType.individual.toString();
        case CounterpartyType.organisation:
          return CounterpartyType.organisation.toString();
        case CounterpartyType.company:
          return CounterpartyType.company.toString();
        case CounterpartyType.soleTrader:
          return CounterpartyType.soleTrader.toString();
        default:
          throw Error('Error: invalid respondent type');
      }
    }
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


