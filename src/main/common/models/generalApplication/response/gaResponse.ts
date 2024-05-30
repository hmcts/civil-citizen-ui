import { RespondentAgreement } from './respondentAgreement';

export class GaResponse {
  respondentAgreement?: RespondentAgreement;

  constructor(respondentAgreement?: RespondentAgreement) {
    this.respondentAgreement = respondentAgreement;
  }
}