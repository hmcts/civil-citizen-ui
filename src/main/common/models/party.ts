import {PartyType} from '../models/partyType';
import {PartyDetails} from '../../common/form/models/partyDetails';
import {Email} from '../models/Email';
import {DateOfBirth} from '../../common/form/models/claim/claimant/dateOfBirth';
import {PartyPhone} from '../models/PartyPhone';

export class Party {
  partyDetails?: PartyDetails;
  type?: PartyType;
  responseType?: string;
  emailAddress?: Email;
  dateOfBirth?: DateOfBirth;
  partyPhone?: PartyPhone;
}
