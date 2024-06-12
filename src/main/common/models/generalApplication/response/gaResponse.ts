import { RespondentAgreement } from './respondentAgreement';

export class GaResponse {
  respondentAgreement?: RespondentAgreement;
  acceptDefendantOffer?: AcceptDefendantOffer;

  constructor(respondentAgreement?: RespondentAgreement) {
    this.respondentAgreement = respondentAgreement;
    this.acceptDefendantOffer = acceptDefendantOffer;
  }
}