
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'common/form/models/partyDetails';

export class Party {
  type?: PartyType;
  partyDetails?: PartyDetails;

  constructor(value?: Party) {
    this.type = value?.type;
    this.partyDetails = value?.partyDetails;
  }
}
