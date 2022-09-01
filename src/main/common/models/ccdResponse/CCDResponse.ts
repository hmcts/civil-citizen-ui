import {PaymentOptionCCD} from './paymentOptionCCD';
import {ClaimUpdate} from '../../models/events/eventDto';
import {Respondent} from '../../models/respondent';

export interface CCDResponse extends ClaimUpdate{
  respondent1?: Respondent
  paymentTypeSelection?: PaymentOptionCCD;

}
