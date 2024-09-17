import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { CcdGeneralApplicationHearingDetails } from './ccdGeneralApplicationHearingDetails';

export interface CcdGeneralApplicationRespondentResponse {
  value: {
    generalAppRespondent1Representative?: YesNoUpperCamelCase,
    gaHearingDetails?: CcdGeneralApplicationHearingDetails,
    gaRespondentDetails?: string,
    gaRespondentResponseReason?: string,
  }
}
