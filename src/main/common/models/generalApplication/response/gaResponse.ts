import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {YesNo} from 'form/models/yesNo';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RespondentAgreement} from './respondentAgreement';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {AcceptDefendantOffer} from './acceptDefendantOffer';

export class GaResponse {
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  hearingSupport?: HearingSupport;
  unavailableDatesHearing?: UnavailableDatesGaHearing;
  agreeToOrder?: YesNo;
  respondentAgreement?: RespondentAgreement;
  acceptDefendantOffer?: AcceptDefendantOffer;

  constructor(hearingArrangement?: HearingArrangement, hearingContactDetails?: HearingContactDetails, agreeToOrder?: YesNo, hearingSupport?: HearingSupport, unavailableDatesHearing?: UnavailableDatesGaHearing, respondentAgreement?: RespondentAgreement, acceptDefendantOffer?: AcceptDefendantOffer) {
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.agreeToOrder = agreeToOrder;
    this.hearingSupport = hearingSupport;
    this.unavailableDatesHearing = unavailableDatesHearing;
    this.respondentAgreement = respondentAgreement;
    this.acceptDefendantOffer = acceptDefendantOffer;
  }
}
