import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ConsiderClaimantDocuments} from 'models/directionsQuestionnaire/considerClaimantDocuments';
import {ExpertCanStillExamine} from '../../models/directionsQuestionnaire/expertCanStillExamine';
import {SentExpertReports} from './sentExpertReports';
import {Vulnerability} from '../../models/directionsQuestionnaire/vulnerability';
import {DeterminationWithoutHearing} from '../../models/directionsQuestionnaire/determinationWithoutHearing';
import {SupportRequired} from '../../models/directionsQuestionnaire/supportRequired';
import {Experts} from './experts/experts';
import {PhoneOrVideoHearing} from '../../models/directionsQuestionnaire/phoneOrVideoHearing';

export class DirectionQuestionnaire {
  permissionForExpert?: GenericYesNo;
  triedToSettle?: GenericYesNo;
  defendantExpertEvidence?: GenericYesNo;
  determinationWithoutHearing?: DeterminationWithoutHearing;
  considerClaimantDocuments?: ConsiderClaimantDocuments;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
  expertCanStillExamine?: ExpertCanStillExamine;
  defendantYourselfEvidence?: GenericYesNo;
  vulnerability?: Vulnerability;
  supportRequired?: SupportRequired;
  sentExpertReports?: SentExpertReports;
  experts?: Experts;
  phoneOrVideoHearing?: PhoneOrVideoHearing;

  constructor(
    triedToSettle?: GenericYesNo,
    defendantExpertEvidence?: GenericYesNo,
    requestExtra4weeks?: GenericYesNo,
    sharedExpert?: GenericYesNo,
    expertCanStillExamine?: ExpertCanStillExamine,
    defendantYourselfEvidence?: GenericYesNo,
    vulnerability?: Vulnerability,
    determinationWithoutHearing?: DeterminationWithoutHearing,
    supportRequired?: SupportRequired,
    sentExpertReports?: SentExpertReports,
    experts?: Experts,
    phoneOrVideoHearing?: PhoneOrVideoHearing,
  ) {
    this.triedToSettle = triedToSettle;
    this.defendantExpertEvidence = defendantExpertEvidence;
    this.requestExtra4weeks = requestExtra4weeks;
    this.sharedExpert = sharedExpert;
    this.expertCanStillExamine = expertCanStillExamine;
    this.defendantYourselfEvidence = defendantYourselfEvidence;
    this.sentExpertReports = sentExpertReports;
    this.vulnerability = vulnerability;
    this.determinationWithoutHearing = determinationWithoutHearing;
    this.supportRequired = supportRequired;
    this.experts = experts;
    this.phoneOrVideoHearing = phoneOrVideoHearing
  }
}
