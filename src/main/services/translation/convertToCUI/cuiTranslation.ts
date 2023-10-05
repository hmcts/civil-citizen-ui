import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {toCUIRejectAllOfClaim} from 'services/translation/convertToCUI/convertToCUIRejectAllOfClaim';
import {toCUIDQs} from 'services/translation/convertToCUI/convertToCUIDQs';
import {toCUIFullAdmission} from 'services/translation/convertToCUI/convertToCUIFullAdmission';
import {toCUIPartialAdmission} from './convertToCUIPartialAdmission';
import {toCUICaseProgressionHearing} from 'services/translation/convertToCUI/convertToCaseProgressionHearing';
import {DocumentType} from 'models/document/documentType';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUICaseProgression';
import {toCUIGenericYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {ClaimantResponse} from 'models/claimantResponse';
import {toCUICCJRequest} from 'services/translation/convertToCUI/convertToCUICCJRequest';

export const translateCCDCaseDataToCUIModel = (ccdClaim: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaim);
  const claimantResponse: ClaimantResponse = new ClaimantResponse();
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim?.specResponselistYourEvidenceList, ccdClaim?.respondent1LiPResponse?.evidenceComment);
  claim.applicant1 = toCUIParty(ccdClaim?.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim?.respondent1,ccdClaim?.respondent1LiPResponse);
  claim.respondent1.responseType = ccdClaim?.respondent1ClaimResponseTypeForSpec;
  claim.mediation = toCUIMediation(ccdClaim?.respondent1LiPResponse?.respondent1MediationLiPResponse);
  claim.statementOfMeans = toCUIStatementOfMeans(ccdClaim);
  claim.claimBilingualLanguagePreference = toCUIClaimBilingualLangPreference(ccdClaim?.respondent1LiPResponse?.respondent1ResponseLanguage);
  claim.rejectAllOfClaim = toCUIRejectAllOfClaim(ccdClaim);
  claim.directionQuestionnaire = toCUIDQs(ccdClaim);
  claim.sdoOrderDocument = ccdClaim?.systemGeneratedCaseDocuments?.find((documents) => documents.value.documentType === DocumentType.SDO_ORDER);
  claim.caseProgressionHearing = toCUICaseProgressionHearing(ccdClaim);
  claim.caseProgression = toCUICaseProgression(ccdClaim);
  claim.specClaimTemplateDocumentFiles = ccdClaim?.servedDocumentFiles?.timelineEventUpload ? ccdClaim.servedDocumentFiles.timelineEventUpload[0].value : undefined;
  if (claim.isFullAdmission()) {
    claim.fullAdmission = toCUIFullAdmission(ccdClaim);
    claimantResponse.fullAdmitSetDateAcceptPayment = toCUIGenericYesNo(ccdClaim?.applicant1AcceptFullAdmitPaymentPlanSpec);
  } else if (claim.isPartialAdmission()) {
    claim.partialAdmission = toCUIPartialAdmission(ccdClaim);
    claimantResponse.fullAdmitSetDateAcceptPayment = toCUIGenericYesNo(ccdClaim?.applicant1AcceptPartAdmitPaymentPlanSpec);
  } else if (claim.isFullDefence()) {
    claimantResponse.intentionToProceed = toCUIGenericYesNo(ccdClaim?.applicant1ProceedWithClaim);
  }
  if(ccdClaim?.partialPayment){
    claimantResponse.ccjRequest = toCUICCJRequest(ccdClaim);
  }
  claim.claimantResponse = claimantResponse;
  claim.caseRole = ccdClaim?.caseRole;

  return claim;
};

