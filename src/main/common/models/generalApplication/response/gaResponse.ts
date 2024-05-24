import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {YesNo} from 'form/models/yesNo';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';

export class GaResponse {
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  hearingSupport?: HearingSupport;
  unavailableDatesHearing?: UnavailableDatesGaHearing;
  agreeToOrder?: YesNo;

  constructor(hearingArrangement?: HearingArrangement, hearingContactDetails?: HearingContactDetails, agreeToOrder?: YesNo, hearingSupport?: HearingSupport, unavailableDatesHearing?: UnavailableDatesGaHearing) {
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.agreeToOrder = agreeToOrder;
    this.hearingSupport = hearingSupport;
    this.unavailableDatesHearing = unavailableDatesHearing;
  }
}
