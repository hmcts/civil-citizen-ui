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
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {CaseLink} from 'models/generalApplication/CaseLink';
import { UploadAdditionalDocument } from './UploadAdditionalDocument';
import {CertificateOfSatisfactionOrCancellation} from 'models/generalApplication/CertificateOfSatisfactionOrCancellation';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';

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
  hasUnavailableDatesHearing?: YesNo;
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;
  wantToUploadDocuments?: YesNo;
  uploadEvidenceForApplication?: UploadGAFiles[];
  statementOfTruth?: StatementOfTruthForm | QualifiedStatementOfTruth;
  applicationFee?: ClaimFeeData;
  helpWithFees?: GaHelpWithFees;
  applicationFeePaymentDetails : PaymentInformation;
  caseLink?: CaseLink;
  uploadAdditionalDocuments?: UploadAdditionalDocument[] = [];
  generalAppAddlnInfoUpload?: UploadGAFiles[];
  certificateOfSatisfactionOrCancellation?: CertificateOfSatisfactionOrCancellation;
  addType?: boolean;

  constructor(
    applicationType?: ApplicationType,
    agreementFromOtherParty?: YesNo,
    applicationCosts?: YesNo,
    requestingReason?: RequestingReason,
    orderJudge?: OrderJudge,
    unavailableDatesHearing?: UnavailableDatesGaHearing,
    hearingArrangement?: HearingArrangement,
    hearingContactDetails?: HearingContactDetails,
    uploadEvidenceForApplication?: UploadGAFiles,
    statementOfTruth?: StatementOfTruthForm,
    helpWithFees?: GaHelpWithFees,
    wantToUploadDocuments?: YesNo,
    uploadN245Form?: UploadGAFiles,
    informOtherParties?: InformOtherParties,
    applicationFee?: ClaimFeeData,
    certificateOfSatisfactionOrCancellation?: CertificateOfSatisfactionOrCancellation,
    hasUnavailableDatesHearing?: YesNo) {
    this.applicationTypes = applicationType ? [applicationType] : [];
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.requestingReasons = requestingReason ? [requestingReason] : [];
    this.orderJudges = orderJudge ? [orderJudge] : [];
    this.unavailableDatesHearing = unavailableDatesHearing;
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
    this.statementOfTruth = statementOfTruth;
    this.wantToUploadDocuments = wantToUploadDocuments;
    this.uploadEvidenceForApplication = uploadEvidenceForApplication ? [uploadEvidenceForApplication] : [];
    this.helpWithFees = helpWithFees;
    this.uploadN245Form = uploadN245Form;
    this.informOtherParties = informOtherParties;
    this.applicationFee = applicationFee;
    this.certificateOfSatisfactionOrCancellation = certificateOfSatisfactionOrCancellation;
    this.hasUnavailableDatesHearing = hasUnavailableDatesHearing;
  }
}
