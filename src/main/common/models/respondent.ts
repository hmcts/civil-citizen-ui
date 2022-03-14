import {PrimaryAddress} from './primaryAddress';
import { CorrespondenceAddress } from '././correspondenceAddress';
export class Respondent {
  primaryAddress: PrimaryAddress;
  correspondenceAddress: CorrespondenceAddress;
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
  telephoneNumber: string;
  dateOfBirth: Date;
  responseType: string;
}
