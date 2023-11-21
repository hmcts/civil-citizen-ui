import {PartyType} from '../models/partyType';
import {PartyDetailsCARM} from 'form/models/partyDetails-CARM';
import {Email} from '../models/Email';
import {CitizenDate} from '../../common/form/models/claim/claimant/citizenDate';
import {PartyPhone} from '../models/PartyPhone';

export class Party {
  partyDetails?: PartyDetailsCARM;
  type?: PartyType;
  responseType?: string;
  emailAddress?: Email;
  dateOfBirth?: CitizenDate;
  partyPhone?: PartyPhone;
}
