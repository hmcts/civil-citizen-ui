import {GenericYesNo} from '../../../form/models/genericYesNo';
import {DeterminationWithoutHearing} from './determinationWithoutHearing';
import {ConsiderClaimantDocuments} from './considerClaimantDocuments';
import {WhyUnavailableForHearing} from './whyUnavailableForHearing';
import {PhoneOrVideoHearing} from './phoneOrVideoHearing';

export class Hearing {
  triedToSettle?: GenericYesNo;
  determinationWithoutHearing?: DeterminationWithoutHearing;
  requestExtra4weeks?: GenericYesNo;
  considerClaimantDocuments?: ConsiderClaimantDocuments;
  whyUnavailableForHearing?: WhyUnavailableForHearing;
  phoneOrVideoHearing?: PhoneOrVideoHearing;
}
