import {YesNo} from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import {InformOtherParties} from './informOtherParties';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {OrderJudge} from './orderJudge';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {ClaimFeeData} from '../civilClaimResponse';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';

export class GeneralApplication {

  applicationTypes?: ApplicationType[];
  informOtherParties?: InformOtherParties;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  requestingReasons?: RequestingReason[];
  orderJudges?: OrderJudge[];
  uploadN245Form?: UploadGAFiles;
  unavailableDatesHearing?: UnavailableDatesGaHearing;
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  response?: GaResponse;
  wantToUploadDocuments?: YesNo;
  uploadEvidenceForApplication?: UploadGAFiles[];
  statementOfTruth?: StatementOfTruthForm;
  applicationFee?: ClaimFeeData;
  applyHelpWithFees?: YesNo;
  feeTypeHelpRequested?: FeeType;
  helpWithFeesRequested: string;
  helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm;

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
    statementOfTruth?: StatementOfTruthForm,
    applyHelpWithFees?: YesNo,
    helpWithFeesRequested?: string,
    feeTypeHelpRequested?: FeeType,
    helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm
  ) {
    this.applicationTypes = applicationType ? [applicationType] : [];
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.requestingReasons = requestingReason ? [requestingReason] : [];
    this.orderJudges = orderJudge ? [orderJudge] : [];
    this.unavailableDatesHearing = unavailableDatesHearing;
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.response = response;
    this.statementOfTruth = statementOfTruth;
    this.uploadEvidenceForApplication = uploadEvidenceForApplication ? [uploadEvidenceForApplication] : [];
    this.applyHelpWithFees = applyHelpWithFees;
    this.helpWithFeesRequested = helpWithFeesRequested;
    this.feeTypeHelpRequested = feeTypeHelpRequested;
    this.helpFeeReferenceNumberForm =  helpFeeReferenceNumberForm;
  }
}
