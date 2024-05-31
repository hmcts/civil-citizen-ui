import { AcceptDefendantOffer } from './acceptDefendantOffer';
import { RespondentAgreement } from './respondentAgreement';

export class GaResponse {
  respondentAgreement?: RespondentAgreement;
  acceptDefendantOffer?: AcceptDefendantOffer;

  constructor(respondentAgreement?: RespondentAgreement, acceptDefendantOffer?: AcceptDefendantOffer) {
    this.respondentAgreement = respondentAgreement;
    this.acceptDefendantOffer = acceptDefendantOffer;
  }
}