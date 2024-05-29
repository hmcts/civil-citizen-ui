import {YesNo} from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {OrderJudge} from './orderJudge';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';

export class GeneralApplication {

  applicationTypes?: ApplicationType[];
  informOtherParties?: InformOtherParties;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  respondentAgreeToOrder?: YesNo;
  requestingReasons?: RequestingReason[];
  orderJudges?: OrderJudge[];
  unavailableDatesHearing?: UnavailableDatesGaHearing;
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  wantToUploadDocuments?: YesNo;
  uploadEvidenceForApplication?: UploadGAFiles[];
  statementOfTruth?: StatementOfTruthForm;

  constructor(
    applicationType?: ApplicationType,
    agreementFromOtherParty?: YesNo,
    applicationCosts?: YesNo,
    respondentAgreeToOrder?: YesNo,
    requestingReason?: RequestingReason,
    orderJudge?: OrderJudge,
    unavailableDatesHearing?: UnavailableDatesGaHearing,
    hearingArrangement?: HearingArrangement,
    hearingContactDetails?: HearingContactDetails,
    uploadEvidenceForApplication?: UploadGAFiles,
    statementOfTruth?: StatementOfTruthForm,
  ) {
    this.applicationTypes = applicationType ? [applicationType] : [];
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.respondentAgreeToOrder = respondentAgreeToOrder;
    this.requestingReasons = requestingReason ? [requestingReason] : [];
    this.orderJudges = orderJudge ? [orderJudge] : [];
    this.unavailableDatesHearing = unavailableDatesHearing;
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.uploadEvidenceForApplication = uploadEvidenceForApplication ? [uploadEvidenceForApplication] : [];
    this.statementOfTruth = statementOfTruth;
  }
}
