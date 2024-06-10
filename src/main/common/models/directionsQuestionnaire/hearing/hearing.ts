import {GenericYesNo} from 'form/models/genericYesNo';
import {DeterminationWithoutHearing} from './determinationWithoutHearing';
import {ConsiderClaimantDocuments} from './considerClaimantDocuments';
import {WhyUnavailableForHearing} from './whyUnavailableForHearing';
import {PhoneOrVideoHearing} from './phoneOrVideoHearing';
import {SupportRequiredList} from '../supportRequired';
import {SpecificCourtLocation} from './specificCourtLocation';
import {UnavailableDates} from './unavailableDates';

export class Hearing {
  triedToSettle?: GenericYesNo;
  determinationWithoutHearing?: DeterminationWithoutHearing;
  requestExtra4weeks?: GenericYesNo;
  considerClaimantDocuments?: ConsiderClaimantDocuments;
  whyUnavailableForHearing?: WhyUnavailableForHearing;
  phoneOrVideoHearing?: PhoneOrVideoHearing;
  cantAttendHearingInNext12Months?: GenericYesNo;
  supportRequiredList?: SupportRequiredList;
  specificCourtLocation?: SpecificCourtLocation;
  unavailableDatesForHearing?: UnavailableDates;
  disclosureNonElectronicDocument?: string;
  hasAnAgreementBeenReached?: HasAnAgreementBeenReachedOptions;
}
