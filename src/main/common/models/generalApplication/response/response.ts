import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {YesNo} from 'form/models/yesNo';

export class Response {
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  agreeToOrder?: YesNo;

  constructor(hearingArrangement?: HearingArrangement, hearingContactDetails?: HearingContactDetails, agreeToOrder?: YesNo) {
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.agreeToOrder = agreeToOrder;
  }
}
