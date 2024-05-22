import { RespondentAgreement } from './respondentAgreement';

export class Response {
  respondentAgreement?: RespondentAgreement;

  constructor(respondentAgreement?: RespondentAgreement) {
    this.respondentAgreement = respondentAgreement;
  }
}