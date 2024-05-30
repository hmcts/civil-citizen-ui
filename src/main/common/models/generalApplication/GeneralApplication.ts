import { YesNo } from 'common/form/models/yesNo';
import { ApplicationType } from './applicationType';
import { InformOtherParties } from './informOtherParties';
import { HearingSupport } from 'models/generalApplication/hearingSupport';
import { RequestingReason } from 'models/generalApplication/requestingReason';
import { OrderJudge } from './orderJudge';
import { HearingArrangement } from 'models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'models/generalApplication/hearingContactDetails';
import { GaResponse } from './response/gaResponse';
import { UnavailableDatesGaHearing } from 'models/generalApplication/unavailableDatesGaHearing';
import { UploadGAFiles } from 'models/generalApplication/uploadGAFiles';

export class GeneralApplication {

  applicationType?: ApplicationType;
  informOtherParties?: InformOtherParties;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  requestingReason?: RequestingReason;
  orderJudge?: OrderJudge;
  unavailableDatesHearing?: UnavailableDatesGaHearing;
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  response?: GaResponse;
  wantToUploadDocuments?: YesNo;
  uploadEvidenceForApplication?: UploadGAFiles[];

  constructor(
    applicationType?: ApplicationType,
    agreementFromOtherParty?: YesNo,
    applicationCosts?: YesNo,
    requestingReason?: RequestingReason,
    orderJudge?: OrderJudge,
    unavailableDatesHearing?: UnavailableDatesGaHearing,
    hearingArrangement?: HearingArrangement,
    hearingContactDetails?: HearingContactDetails,
    response?: GaResponse,
    uploadEvidenceForApplication?: UploadGAFiles,
  ) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.requestingReason = requestingReason;
    this.orderJudge = orderJudge;
    this.unavailableDatesHearing = unavailableDatesHearing;
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.response = response;
    this.uploadEvidenceForApplication = uploadEvidenceForApplication ? [uploadEvidenceForApplication] : [];
  }
}
