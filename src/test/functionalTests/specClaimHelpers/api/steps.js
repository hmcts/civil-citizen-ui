const config = require('../../../config');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const breathingSpace = require('../fixtures/events/breathingSpace.js');
const mediation = require('../fixtures/events/mediation.js');
const admitAllClaimantResponse = require('../fixtures/events/admitAllClaimantResponse.js');
const partAdmitClaimantResponse = require('../fixtures/events/partAdmitClaimantResponse.js');
const rejectAllClaimantResponse = require('../fixtures/events/rejectAllClaimantResponse.js');
const rejectAllClaimantResponseCarm = require('../fixtures/events/rejectAllClaimantResponseCarm.js');
const createSDOReqPayload = require('../fixtures/events/createSDO.js');
const createAnAssistedOrder = require('../fixtures/events/createAnAssistedOrder');
const createRequestForReconsideration = require('../fixtures/events/createRequestForReconsideration');
const createATrialArrangement = require('../fixtures/events/createATrialArrangement');
const evidenceUpload = require('../fixtures/events/evidenceUpload');
const testingSupport = require('./testingSupport');
const lodash = require('lodash');

let chai, expect, assert;

(async () => {
  chai = await import('chai');

  chai.use(deepEqualInAnyOrder);
  chai.config.truncateThreshold = 0;

  expect = chai.expect;
  assert = chai.assert;

})().catch(error => {
  console.error('Failed to load chai:', error);
});

const {
  waitForFinishedBusinessProcess, waitForGAFinishedBusinessProcess, hearingFeeUnpaid, bundleGeneration, uploadDocument, triggerTrialArrangements,
} = require('./testingSupport');
const {assignCaseRoleToUser, addUserCaseMapping, unAssignAllUsers} = require('./caseRoleAssignmentHelper');
const apiRequest = require('./apiRequest.js');
const claimSpecData = require('../fixtures/events/createClaimSpec.js');
const smallClaimSpecData = require('../fixtures/events/createSmallTrackClaimSpec');
const claimSpecDataFastTrack = require('../fixtures/events/createClaimSpecFastTrack');
const claimSpecDataLRvLR = require('../fixtures/events/createClaimSpecLRvLR.js');
const claimSpecDataFastTrackLRvLR = require('../fixtures/events/createClaimSpecFastTrackLrvLR');
const defendantResponse = require('../fixtures/events/createDefendantResponse.js');
const claimantResponse = require('../fixtures/events/createClaimantResponseToDefence.js');
const caseProgressionToSDOState = require('../fixtures/events/createCaseProgressionToSDOState');
const translatedDocUpload = require('../fixtures/events/translatedDocUpload');
const caseProceedsInCaseman = require('../fixtures/events/caseProceedsInCaseman');
const caseProgressionToHearingInitiated = require('../fixtures/events/createCaseProgressionToHearingInitiated');
const hwfPayloads = require('../fixtures/events/hwfPayloads.js');
const {fetchCaseDetails} = require('./apiRequest');
const idamHelper = require('./idamHelper');
const mediationDocumentsCui = require('../fixtures/events/mediation/uploadMediationDocuments');
const mediationDocumentsLr = require('../fixtures/events/mediation/uploadMediationDocumentsLR');
const createLipClaim = require('../fixtures/events/createLiPClaim.js');
const createLiPClaimForCompany = require('../fixtures/events/createLiPClaimForCompany.js');
const createLipClaimDefendantCompany = require('../fixtures/events/createLiPClaimDefendantCompany');
const createLipClaimDefendantSoleTrader = require('../fixtures/events/createLiPClaimDefendantSoleTrader.js');
const createLipClaimSoleTraderVCompany = require('../fixtures/events/createLiPClaimSoleTraderVCompany.js');
const createLipClaimIndVOrg = require('../fixtures/events/createLiPClaimIndVOrg.js');
const makeAnOrderGA = require('../fixtures/events/makeAnOrderGA.js');
const uploadTranslatedDoc = require('../fixtures/events/uploadTranslatedDoc');

const data = {
  CREATE_SPEC_CLAIM: (mpScenario) => claimSpecData.createClaim(mpScenario),
  CREATE_SPEC_CLAIM_SMALLTRACK: (defType) => smallClaimSpecData.createClaim(defType),
  CREATE_SPEC_CLAIMLRvLR: (mpScenario) => claimSpecDataLRvLR.createClaim(mpScenario),
  CREATE_SPEC_CLAIM_FASTTRACK: (mpScenario) => claimSpecDataFastTrack.createClaim(mpScenario),
  CREATE_SPEC_CLAIM_FASTTRACKLRvLR: (mpScenario) => claimSpecDataFastTrackLRvLR.createClaim(mpScenario),
  CREATE_LIP_CLAIM: (user, userId, totalClaimAmount, language) => createLipClaim(user, userId, totalClaimAmount, language),
  CREATE_LIP_CLAIM_FOR_COMPANY: (user, userId, totalClaimAmount) => createLiPClaimForCompany(user, userId, totalClaimAmount),
  CREATE_LIP_CLAIM_DEFENDANT_COMPANY: (user, userId, totalClaimAmount) => createLipClaimDefendantCompany(user, userId, totalClaimAmount),
  CREATE_LIP_CLAIM_DEFENDANT_SOLE_TRADER: (user, userId, totalClaimAmount) => createLipClaimDefendantSoleTrader(user, userId, totalClaimAmount),
  CREATE_LIP_CLAIM_SOLE_TRADER_V_COMPANY: (user, userId, totalClaimAmount) => createLipClaimSoleTraderVCompany(user, userId, totalClaimAmount),
  CREATE_LIP_CLAIM_IND_V_ORGANISATION: (user, userId, totalClaimAmount) => createLipClaimIndVOrg(user, userId, totalClaimAmount),
  DEFENDANT_RESPONSE: (response, camundaEvent) => require('../fixtures/events/defendantLRResponse').respondToClaim(response, camundaEvent),
};

let caseId, eventName, payload;
let caseData = {};

module.exports = {

  makeOrderGA: async (gaCaseId, courtResponseType, user = config.judgeUserWithRegionId2) => {
    console.log('Make an Order of GA: ' + gaCaseId);
    eventName = 'MAKE_DECISION';
    const document = await uploadDocument();
    switch(courtResponseType){
      case 'approveOrEdit':
        payload = makeAnOrderGA.makeAnOrderGA(document);
        break;
      case 'dismissAnOrder':
        payload = makeAnOrderGA.dismissAnOrderGA(document);
        break;
      case 'giveDirections':
        payload = makeAnOrderGA.giveDirections(document);
        break;
      case 'freeFormOrder':
        payload = makeAnOrderGA.freeFormOrder(document);
        break;
      case 'withoutNoticeToWith':
        payload = makeAnOrderGA.withoutNoticeToWith(document);
        break;
      case 'writtenRepresentations':
        payload = makeAnOrderGA.writtenRepresentations(document);
        break;
      case 'requestMoreInformation':
        payload = makeAnOrderGA.requestMoreInformation(document);
        break;
      case 'listForHearing':
        payload = makeAnOrderGA.listForHearing(document);
        break;
      default:
        payload = makeAnOrderGA.makeAnOrderGA(document);
        break;
    }
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForGAFinishedBusinessProcess(gaCaseId, user);
    await assertSubmittedGASpecEvent(gaCaseId, 'APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION', user);
  },

  performBundleGeneration: async (user, caseId) => {
    console.log('This is inside performBundleGeneration() : ' + caseId);
    await bundleGeneration(caseId);
    console.log('End of performBundleGeneration()');
  },

  performCaseHearingFeeUnpaid: async (user, caseId) => {
    console.log('This is inside performCaseHearingFeeUnpaid() : ' + caseId);
    await hearingFeeUnpaid(caseId);
    console.log('End of performCaseHearingFeeUnpaid()');
  },

  triggerTrialArrangementsNotifications: async (user, caseId) => {
    console.log('This is inside triggerTrialArrangements() : ' + caseId);
    await triggerTrialArrangements(caseId);
    console.log('End of triggerTrialArrangements()');
  },

  waitForFinishedBusinessProcess: async () => {
    await waitForFinishedBusinessProcess(caseId);
  },

  setCaseId: async (id) => {
    caseId = id;
  },

  performEvidenceUpload: async (user, caseId, claimType) => {
    console.log('This is inside performEvidenceUpload() : ' + caseId);
    eventName = 'EVIDENCE_UPLOAD_APPLICANT';
    const document = await uploadDocument();
    let payload;
    if (claimType === 'FastTrack') {
      payload = evidenceUpload.evidenceUploadFastTrack(document);
    } else if (claimType === 'SmallClaims') {
      payload = evidenceUpload.evidenceUploadSmallClaims(document);
    }
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    if (claimType === 'FastTrack') {
      await assertSubmittedSpecEvent(config.claimState.HEARING_READINESS);
    } else {
      await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    }
    console.log('End of performEvidenceUpload()');
  },

  performEvidenceUploadCitizen: async (user, caseId, claimType) => {
    console.log('This is inside performEvidenceUploadCitizen() : ' + caseId);
    eventName = 'EVIDENCE_UPLOAD_RESPONDENT';
    const document = await uploadDocument();
    let payload;
    if (claimType === 'FastTrack') {
      payload = evidenceUpload.evidenceUploadFastClaimsLipRespondent(document);
    } else if (claimType === 'SmallClaims') {
      payload = evidenceUpload.evidenceUploadSmallClaimsLipRespondent(document);
    }
    await apiRequest.setupTokens(user);
    await apiRequest.startEventForCitizen(eventName, caseId, payload);
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of performEvidenceUploadCitizen()');
  },

  performTrialArrangements: async (user, caseId) => {
    console.log('This is inside performTrialArrangements() : ' + caseId);
    eventName = 'TRIAL_READINESS';
    const payload = createATrialArrangement.createATrialArrangement();
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(config.claimState.HEARING_READINESS);
    console.log('End of performTrialArrangements()');
  },

  performTrialArrangementsCitizen: async (user, caseId) => {
    console.log('This is inside performTrialArrangementsCitizen() : ' + caseId);
    eventName = 'TRIAL_READINESS';
    const payload = createATrialArrangement.createATrialArrangementRespondentLip();
    await apiRequest.setupTokens(user);
    await apiRequest.startEventForCitizen(eventName, caseId, payload);
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of performTrialArrangementsCitizen()');
  },

  performRequestForReconsideration: async (user, caseId) => {
    console.log('This is inside performRequestForReconsideration() : ' + caseId);
    eventName = 'REQUEST_FOR_RECONSIDERATION';
    const payload = createRequestForReconsideration.createATrialArrangement();
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    console.log('End of performRequestForReconsideration()');
  },

  performAnAssistedOrder: async (user, caseId) => {
    console.log('This is inside performAnAssistedOrder() : ' + caseId);
    eventName = 'GENERATE_DIRECTIONS_ORDER';
    const document = await uploadDocument();
    const payload = createAnAssistedOrder.createAnAssistedOrder(document);
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    console.log('End of performAnAssistedOrder()');
  },

  performCaseProgressedToHearingInitiated: async (user, caseId, hearingDate = '2023-11-10') => {
    console.log('This is inside performCaseProgressedToHearingInitiated() : ' + caseId);
    eventName = 'HEARING_SCHEDULED';
    const payload = caseProgressionToHearingInitiated.createCaseProgressionToHearingInitiated(hearingDate);
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(config.claimState.HEARING_READINESS);
    console.log('End of performCaseProgressedToHearingInitiated()');
  },

  performCaseProgressedToSDO: async (user, caseId, claimType) => {
    console.log('This is inside performCaseProgressedToSDO : ' + caseId);
    eventName = 'CREATE_SDO';
    const document = await uploadDocument();
    let payload;
    if (claimType === 'SmallClaimsThousand') {
      payload = caseProgressionToSDOState.SDOpayloadForLA();
    } else{
      payload = caseProgressionToSDOState.createCaseProgressionToSDOState(claimType, document);
    }
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    console.log('End of performCaseProgressedToSDO()');
  },

  performTranslatedDocUpload: async (user, caseId) => {
    console.log('This is inside performTranslatedDocUpload : ' + caseId);
    eventName = 'UPLOAD_TRANSLATED_DOCUMENT';
    const document = await uploadDocument();
    const payload = translatedDocUpload.uploadDoc(document);
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(config.claimState.PENDING_CASE_ISSUED);
    console.log('End of performTranslatedDocUpload()');
  },

  performCitizenResponse: async (user, caseId, claimType = 'SmallClaims', responseType, partyType, language = 'ENGLISH', respondentLanguage = 'ENGLISH') => {
    console.log('This is inside performCitizenResponse : ' + caseId);
    let totalClaimAmount, eventName = 'DEFENDANT_RESPONSE_CUI';
    let payload = {};
    if (claimType === 'FastTrack') {
      console.log('FastTrack claim...');
      totalClaimAmount = '15000';
    } else if (claimType === 'Intermediate') {
      totalClaimAmount = '26000';
    } else if (claimType === 'Multi') {
      totalClaimAmount = '150000';
    } else if (claimType === 'SmallClaimsThousand') {
      console.log('SmallClaim of 1000 pounds...');
      totalClaimAmount = '1000';
    } else {
      console.log('SmallClaim...');
      totalClaimAmount = '1500';
    }
    payload = defendantResponse.createDefendantResponse(totalClaimAmount, responseType, claimType, partyType, language, respondentLanguage);
    //console.log('The payload : ' + payload);
    await apiRequest.setupTokens(user);
    await apiRequest.startEventForCitizen(eventName, caseId, payload);
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of performCitizenResponse()');
  },

  performLrResponse: async (user, caseId, claimType = 'SmallClaims', responseType, partyType) => {
    console.log('This is inside performLrResponse : ' + caseId);
    await apiRequest.setupTokens(user);
    eventName = 'DEFENDANT_RESPONSE_SPEC';
    let totalClaimAmount;

    if (claimType === 'FastTrack') {
      console.log('FastTrack claim...');
      totalClaimAmount = '15000';
    } else {
      console.log('SmallClaim...');
      totalClaimAmount = '1500';
    }

    let returnedCaseData = await apiRequest.startEvent(eventName, caseId);

    let defendantResponseData = defendantResponse.createDefendantResponse(totalClaimAmount, responseType, claimType, partyType);

    caseData = returnedCaseData;

    console.log(`${claimType} ${partyType}`);

    for (let pageId of Object.keys(defendantResponseData.userInput)) {
      await assertValidDataSpec(defendantResponseData, pageId);
    }

    await assertSubmittedSpecEvent();
    await waitForFinishedBusinessProcess(caseId);

    deleteCaseFields('respondent1Copy');
    console.log('End of performLrResponse()');
  },

  amendRespondent1ResponseDeadline: async (user) => {
    await apiRequest.setupTokens(user);
    let respondent1deadline ={};
    respondent1deadline = {'respondent1ResponseDeadline':'2025-11-19T15:59:50'};
    await testingSupport.updateCaseData(caseId, respondent1deadline);
    console.log('ResponseDeadline updated');
  },

  submitHwfEventForUser: async (event, user = config.ctscAdmin) => {
    console.log('This is inside submitHwfEventForUser() : ' + caseId);
    let payload = {};
    if (event === config.hwfEvents.updateHWFNumber) {
      payload = hwfPayloads.updateHWFNumber();
    } else if (event === config.hwfEvents.partRemission) {
      payload = hwfPayloads.partRemission();
    } else if (event === config.hwfEvents.fullRemission) {
      payload = hwfPayloads.fullRemission();
    } else if (event === config.hwfEvents.noRemission) {
      payload = hwfPayloads.noRemission();
    } else if (event === config.hwfEvents.moreInfoHWF) {
      payload = hwfPayloads.moreInfoHWF();
    } else if (event === config.hwfEvents.feePayOutcome) {
      payload = hwfPayloads.feePayOutcome();
    } else if (event === config.hwfEvents.invalidHWFRef) {
      payload = hwfPayloads.invalidHWFRef();
    }
    await apiRequest.setupTokens(user);
    eventName = payload['event'];
    caseData = payload['caseData'];
    await assertSubmittedSpecEvent();
    console.log('End of submitHwfEventForUser()');
  },

  createSpecifiedClaim: async (user, multipartyScenario, claimType, carmEnabled = true, partyType, manualPIP = false) => {
    console.log('Creating specified claim');
    eventName = 'CREATE_CLAIM_SPEC';

    caseId = null;
    caseData = {};
    let createClaimSpecData;
    if (claimType === 'FastTrack') {
      console.log('Creating FastTrack claim...');
      createClaimSpecData = data.CREATE_SPEC_CLAIM_FASTTRACK(multipartyScenario);
    } else if (claimType === 'SmallClaims' && partyType){
      console.log('Creating small claims with defendant type...');
      createClaimSpecData = data.CREATE_SPEC_CLAIM_SMALLTRACK(partyType);
    } else {
      console.log('Creating small claims...');
      createClaimSpecData = data.CREATE_SPEC_CLAIM(multipartyScenario);
    }

    await apiRequest.setupTokens(user);
    await apiRequest.startEvent(eventName);
    for (let pageId of Object.keys(createClaimSpecData.userInput)) {
      await assertValidDataSpec(createClaimSpecData, pageId);
    }

    await assertSubmittedSpecEvent('PENDING_CASE_ISSUED');

    await apiRequest.paymentUpdate(caseId, '/service-request-update-claim-issued',
      claimSpecData.serviceUpdateDto(caseId, 'paid'));
    console.log('Service request update sent to callback URL');
    await waitForFinishedBusinessProcess(caseId);

    if (!manualPIP) {
      await assignSpecCase(caseId, multipartyScenario);
    }
    //await waitForFinishedBusinessProcess(caseId);

    //field is deleted in about to submit callback
    deleteCaseFields('applicantSolicitor1CheckEmail');

    console.log('carmEnabled value is .. ', carmEnabled);
    /* Not needed this anymore as CARM is live, all FTs should be on live cases
    if (!carmEnabled) {
      await apiRequest.setupTokens(config.systemUpdate);
      console.log('carm not enabled, updating submitted date to past for legacy cases');
      const submittedDate = {'submittedDate':'2024-10-28T15:59:50'};
      await testingSupport.updateCaseData(caseId, submittedDate);
      console.log('submitted date update to before carm date for legacy cases');
    }*/
    return caseId;
  },

  createLiPClaim: async (user, claimType, qmEnabled = false, partyType = 'Individual', language, mainClaimWelshEnabled = false) => {
    console.log(' Creating LIP claim');

    const currentDate = new Date();
    let totalClaimAmount;
    let payload;

    if (claimType === 'FastTrack') {
      console.log('FastTrack claim...');
      totalClaimAmount = '15000';
    } else if (claimType === 'Intermediate') {
      console.log('Intermediate track claim...');
      totalClaimAmount = '26000';
    } else if (claimType === 'Multi') {
      console.log('Multi track claim...');
      totalClaimAmount = '150000';
    } else {
      console.log('SmallClaim...');
      totalClaimAmount = '1500';
    }

    let userAuth = await idamHelper.accessToken(user);
    let userId = await idamHelper.userId(userAuth);

    await apiRequest.setupTokens(user);

    if (partyType === 'Company') {
      payload = data.CREATE_LIP_CLAIM_FOR_COMPANY(user, userId, totalClaimAmount);
    } else if (partyType === 'DefendantCompany') {
      payload = data.CREATE_LIP_CLAIM_DEFENDANT_COMPANY(user, userId, totalClaimAmount);
    } else if (partyType === 'DefendantSoleTrader') {
      payload = data.CREATE_LIP_CLAIM_DEFENDANT_SOLE_TRADER(user, userId, totalClaimAmount);
    } else if (partyType === 'SoleTraderVCompany') {
      payload = data.CREATE_LIP_CLAIM_SOLE_TRADER_V_COMPANY(user, userId, totalClaimAmount);
    } else if (partyType === 'IndividualVOrganisation') {
      payload = data.CREATE_LIP_CLAIM_IND_V_ORGANISATION(user, userId, totalClaimAmount);
    } else {
      payload = data.CREATE_LIP_CLAIM(user, userId, totalClaimAmount, language);
    }
    caseId = await apiRequest.startEventForLiPCitizen(payload);
    await waitForFinishedBusinessProcess(caseId, user);

    console.log('qmEnabled flag .. ', qmEnabled);

    if (qmEnabled) {
      await apiRequest.setupTokens(config.systemUpdate);
      console.log('QM not enabled, updating submitted date to past for legacy cases');
      const submittedDate = {'submittedDate':'2025-12-25T15:59:50'};
      await testingSupport.updateCaseData(caseId, submittedDate);
      console.log('submitted date update to after QM date');
    }
    // if (claimType === 'Intermediate' || claimType === 'Multi') {
    //   console.log('updating submitted date for minti case');
    //   await apiRequest.setupTokens(config.systemUpdate);
    //   const submittedDate = {'submittedDate':'2025-03-20T15:59:50'};
    //   await testingSupport.updateCaseData(caseId, submittedDate);
    //   console.log('submitted date update to after minti date');
    // }*/
    await apiRequest.setupTokens(user);
    let newPayload = {
      event: 'CREATE_CLAIM_SPEC_AFTER_PAYMENT',
      caseDataUpdate: {
        'claimIssuedPaymentDetails': {
          'status': 'SUCCESS',
          'reference': 'RC-1234-1234-1234-1234',
        },
        issueDate: currentDate,
        ...(!mainClaimWelshEnabled && {respondent1ResponseDeadline: currentDate}),
      },
    };
    await apiRequest.startEventForCitizen('', caseId, newPayload);
    await waitForFinishedBusinessProcess(caseId, user);
    if (!mainClaimWelshEnabled) {
      await assignSpecCase(caseId, null);
    }
    return caseId;
  },

  submitUploadTranslatedDoc: async (translationDocType) => {
    eventName = 'UPLOAD_TRANSLATED_DOCUMENT';
    await validateUploadTranslatedDoc(translationDocType);
    await assertSubmittedSpecEvent();
    if (translationDocType === 'CLAIM_ISSUE') {
      await assignSpecCase(caseId, null);
    }
  },

  createSpecifiedClaimLRvLR: async (user, multipartyScenario, claimType, carmEnabled = true) => {
    console.log(' Creating specified claim');
    eventName = 'CREATE_CLAIM_SPEC';
    caseId = null;
    caseData = {};
    let createClaimSpecData;
    if (claimType === 'FastTrack') {
      console.log('Creating LRvLR FastTrack claim...');
      createClaimSpecData = data.CREATE_SPEC_CLAIM_FASTTRACKLRvLR(multipartyScenario);
    } else {
      console.log('Creating LRvLR small claims...');
      createClaimSpecData = data.CREATE_SPEC_CLAIMLRvLR(multipartyScenario);
    }

    await apiRequest.setupTokens(user);
    await apiRequest.startEvent(eventName);
    for (let pageId of Object.keys(createClaimSpecData.userInput)) {
      await assertValidDataSpec(createClaimSpecData, pageId);
    }

    await assertSubmittedSpecEvent('PENDING_CASE_ISSUED');

    await apiRequest.paymentUpdate(caseId, '/service-request-update-claim-issued',
      claimSpecData.serviceUpdateDto(caseId, 'paid'));
    console.log('Service request update sent to callback URL');

    if (claimType !== 'pinInPost') {
      await assignSpecCase(caseId, 'lrvlr');
    }
    await waitForFinishedBusinessProcess(caseId);

    console.log('carmEnabled flag .. ', carmEnabled);
    /* Not needed this anymore as CARM is live, all FTs should be on live cases
    if (!carmEnabled) {
      await apiRequest.setupTokens(config.systemUpdate);
      console.log('carm not enabled, updating submitted date to past for legacy cases');
      const submittedDate = {'submittedDate':'2024-10-28T15:59:50'};
      await testingSupport.updateCaseData(caseId, submittedDate);
      console.log('submitted date update to before carm date for legacy cases');
    }*/

    //field is deleted in about to submit callback
    deleteCaseFields('applicantSolicitor1CheckEmail');
    return caseId;
  },

  retrieveCaseData: async (user, caseId) => {
    await apiRequest.setupTokens(user);
    const {case_data} = await apiRequest.fetchCaseDetails(user, caseId);
    return case_data;
  },

  createSDO: async (user, sdoSelectionType = config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsYes) => {
    let createSDOPayload;
    const document = await uploadDocument();
    if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsYes) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedYesAssignToSmallClaimsYes(document);
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing(document);
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoTrialHearing) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedYesAssignToSmallClaimsNoTrialHearing(document);
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedNoAssignToSmallClaimsYes) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedNoAssignToSmallClaimsYes(document);
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedNoAssignToFastTrackYes) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedNoAssignToFastTrackYes(document);
    }

    eventName = createSDOPayload['event'];
    caseData = createSDOPayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    console.log('End of createSDO()');
  },

  viewAndRespondToDefence: async (user, defenceType = config.defenceType.admitAllPayBySetDate, expectedState, claimType, eaCase = true) => {
    let responsePayload;
    let location;

    if (eaCase === true){
      location = config.eaCourt;
    } else {
      location = config.nonEaCourt;
    }

    if (defenceType === config.defenceType.admitAllPayBySetDate) {
      responsePayload = admitAllClaimantResponse.doNotAcceptAskToPayBySetDate();
    } else if (defenceType === config.defenceType.admitAllPayImmediate) {
      responsePayload = admitAllClaimantResponse.doNotAcceptAskToPayImmediately();
    } else if (defenceType === config.defenceType.admitAllPayByInstallment) {
      responsePayload = admitAllClaimantResponse.doNotAcceptAskToPayByInstallment();
    } else if (defenceType === config.defenceType.partAdmitAmountPaid) {
      responsePayload = partAdmitClaimantResponse.partAdmitAmountPaidButClaimantWantsToProceed();
    } else if (defenceType === config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediately) {
      responsePayload = partAdmitClaimantResponse.partAdmitHaventPaidPartiallyWantsToPayImmediatelyButClaimantWantsToProceedWithMediation();
    } else if (defenceType === config.defenceType.partAdmitWithPartPaymentOnSpecificDate) {
      responsePayload = partAdmitClaimantResponse.partAdmitWithPartPaymentOnSpecificDateClaimantWantsToAcceptRepaymentPlanWithFixedCosts();
    } else if (defenceType === config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlan) {
      responsePayload = partAdmitClaimantResponse.partAdmitWithPartPaymentAsPerPlanClaimantWantsToAcceptRepaymentPlanWithoutFixedCosts();
    } else if (defenceType === config.defenceType.rejectAll) {
      responsePayload = claimantResponse.createClaimantIntendsToProceedResponse(claimType, location);
    } else if (defenceType === config.defenceType.rejectAllAlreadyPaid) {
      responsePayload = rejectAllClaimantResponse.rejectAllAlreadyPaidButClaimantWantsToProceed();
    } else if (defenceType === config.defenceType.rejectAllDisputeAll) {
      responsePayload = rejectAllClaimantResponse.rejectAllDisputeAllButClaimantWantsToProceedWithMediation();
    }
    eventName = responsePayload['event'];
    caseData = responsePayload['caseData'];
    await apiRequest.setupTokens(user);
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(expectedState);
    console.log('End of viewAndRespondToDefence()');
  },

  defendantLRResponse: async (user, response, camundaEvent, expectedState) => {
    await apiRequest.setupTokens(user);

    eventName = 'DEFENDANT_RESPONSE_SPEC';

    let returnedCaseData = await apiRequest.startEvent(eventName, caseId);

    let defendantResponseData = data.DEFENDANT_RESPONSE(response, camundaEvent);

    caseData = returnedCaseData;

    for (let pageId of Object.keys(defendantResponseData.userInput)) {
      await assertValidDataSpec(defendantResponseData, pageId);
    }

    await assertSubmittedSpecEvent('AWAITING_APPLICANT_INTENTION');

    await waitForFinishedBusinessProcess(caseId);

    if (expectedState) {
      const responseData = await apiRequest.fetchCaseDetails(config.adminUser, caseId);
      assert.equal(responseData.state, expectedState);
    }

    deleteCaseFields('respondent1Copy');

    console.log('End of defendantResponse()');
  },

  claimantLipRespondToDefence: async (user, caseId, carmEnabled = true, expectedEndState, mintiTrack = '', eaCase = true) => {
    console.log('This is inside claimantLipRespondToDefence : ' + caseId);
    eventName = 'CLAIMANT_RESPONSE_CUI';
    let payload;
    let location;

    await apiRequest.setupTokens(user);

    if (eaCase === true){
      location = config.eaCourt;
    } else {
      location = config.nonEaCourt;
    }

    if (mintiTrack === 'Intermediate') {
      payload = claimantResponse.createClaimantLipIntendsToProceedResponseIntermediate();
    } else if (mintiTrack === 'Multi') {
      payload = claimantResponse.createClaimantLipIntendsToProceedResponseMulti();
    } else if (carmEnabled) {
      payload = claimantResponse.createClaimantLipIntendsToProceedResponseCarm();
    } else {
      payload = claimantResponse.createClaimantLipIntendsToProceedResponse(location);
    }

    await apiRequest.startEventForCitizen(eventName, caseId, payload);
    await waitForFinishedBusinessProcess(caseId, user);
    if (expectedEndState) {
      const response = await apiRequest.fetchCaseDetails(config.adminUser, caseId);
      assert.equal(response.state, expectedEndState);
    }
    console.log('End of claimantLipRespondToDefence()');
  },

  claimantLrRespondToDefence: async (user, caseId, expectedEndState) => {
    console.log('This is inside performLrRespondToDefence : ' + caseId);

    await apiRequest.setupTokens(user);
    eventName = 'CLAIMANT_RESPONSE_SPEC';

    let returnedCaseData = await apiRequest.startEvent(eventName, caseId);

    let claimantResponseData = rejectAllClaimantResponseCarm.rejectAllDisputeAllButClaimantWantsToProceed_Carm();

    caseData = returnedCaseData;

    for (let pageId of Object.keys(claimantResponseData.userInput)) {
      await assertValidDataSpec(claimantResponseData, pageId);
    }

    await assertSubmittedSpecEvent();
    await waitForFinishedBusinessProcess(caseId, user);
    if (expectedEndState) {
      const response = await apiRequest.fetchCaseDetails(config.adminUser, caseId);
      assert.equal(response.state, expectedEndState);
    }    console.log('End of claimantLrRespondToDefence()');
  },

  enterBreathingSpace: async (user) => {
    const enterBreathingSpacePayload = breathingSpace.enterBreathingSpacePayload();
    eventName = enterBreathingSpacePayload['event'];
    caseData = enterBreathingSpacePayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent();
    console.log('End of enterBreathingSpace()');
  },

  mediationSuccessful: async (user) => {
    console.log('This is inside mediationSuccessful : ' + caseId);
    eventName = 'MEDIATION_SUCCESSFUL';

    const mediationSuccessfulPayload = mediation.mediationSuccessfulPayload();

    eventName = mediationSuccessfulPayload['event'];
    caseData = mediationSuccessfulPayload['caseData'];

    await apiRequest.setupTokens(user);

    const document = await testingSupport.uploadDocument();
    caseData = await updateCaseDataWithPlaceholders(caseData, document);

    await assertSubmittedSpecEvent(config.claimState.CASE_STAYED);
    console.log('End of mediationSuccessful()');
  },

  mediationUnsuccessful: async (user, carmEnabled = true, mediationReason) => {
    console.log('This is inside mediationUnsuccessful : ' + caseId);
    eventName = 'MEDIATION_UNSUCCESSFUL';

    const mediationUnsuccessfulPayload = mediation.mediationUnSuccessfulPayload(carmEnabled, mediationReason);
    eventName = mediationUnsuccessfulPayload['event'];
    caseData = mediationUnsuccessfulPayload['caseData'];

    await apiRequest.setupTokens(user);
    const document = await testingSupport.uploadDocument();
    caseData = await updateCaseDataWithPlaceholders(caseData, document);

    await assertSubmittedSpecEvent(config.claimState.JUDICIAL_REFERRAL);
    console.log('End of mediationUnsuccessful()');
  },

  uploadMediationDocumentsCui: async (user, caseId) => {
    console.log('This is inside uploadMediationDocumentsCui : ' + caseId);
    eventName = 'CUI_UPLOAD_MEDIATION_DOCUMENTS';

    const document = await testingSupport.uploadDocumentUser(user);
    let payload;
    if (user === config.claimantCitizenUser) {
      payload = mediationDocumentsCui.uploadMediationDocumentsClaimantOne_Citizen(document);
    } else if (user === config.defendantCitizenUser) {
      payload = mediationDocumentsCui.uploadMediationDocumentsRespondentOne_Citizen(document);
    }
    await apiRequest.setupTokens(user);

    caseData = await updateCaseDataWithPlaceholders(payload, document);
    caseData = await apiRequest.startEventForCitizen(eventName, caseId, caseData);

    await waitForFinishedBusinessProcess(caseId, user);

    console.log('End of uploadMediationDocumentsCui()');
  },

  caseProceedsInCaseman: async (user = config.ctscAdmin) => {
    console.log('This is inside caseProceedsInCaseman: ' + caseId);
    eventName = 'CASE_PROCEEDS_IN_CASEMAN';
    const payload = caseProceedsInCaseman.caseman();
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await waitForFinishedBusinessProcess(caseId);
    await assertSubmittedSpecEvent(config.claimState.PROCEEDS_IN_HERITAGE_SYSTEM);
    console.log('End of caseProceedsInCaseman()');
  },

  adjustSubmittedDateForCarm: async (caseId) => {
    console.log('carm not enabled, updating submitted date to past for legacy cases');
    await apiRequest.setupTokens(config.systemUpdate);
    const submittedDate = {'submittedDate':'2024-10-28T15:59:50'};
    await testingSupport.updateCaseData(caseId, submittedDate);
    console.log('submitted date update to before carm date for legacy cases');
  },

  uploadMediationDocumentsExui: async (user) => {
    console.log('This is inside uploadMediationDocumentsExui : ' + caseId);
    eventName = 'UPLOAD_MEDIATION_DOCUMENTS';
    await apiRequest.setupTokens(user);

    const document = await testingSupport.uploadDocumentUser(user);
    caseData = await apiRequest.startEvent(eventName, caseId);

    let payload;
    if (user === config.applicantSolicitorUser) {
      payload = mediationDocumentsLr.uploadMediationDocuments('claimant');
    } else if (user === config.defendantSolicitorUser) {
      payload = mediationDocumentsLr.uploadMediationDocuments('defendant');
    }

    payload = await updateCaseDataWithPlaceholders(payload, document);

    for (let pageId of Object.keys(payload.userInput)) {
      await assertValidDataSpec(payload, pageId);
    }

    await assertSubmittedSpecEvent();

    await waitForFinishedBusinessProcess(caseId, user);

    console.log('End of uploadMediationDocumentsExUi()');
  },

  checkUserCaseAccess: async (user, shouldHaveAccess) => {
    console.log(`Checking ${user.email} ${shouldHaveAccess ? 'has' : 'does not have'} access to the case.`);
    const expectedStatus = shouldHaveAccess ? 200 : 403;
    return await fetchCaseDetails(user, caseId, expectedStatus);
  },

  liftBreathingSpace: async (user) => {
    const liftBreathingSpacePayload = breathingSpace.liftBreathingSpacePayload();
    eventName = liftBreathingSpacePayload['event'];
    caseData = liftBreathingSpacePayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent();
    console.log('End of liftBreathingSpace()');
  },

  getCaseRef: async () => {
    return caseId;
  },

  cleanUp: async () => {
    await unAssignAllUsers();
  },

  assignToLipDefendant: async (caseId) => {
    await assignCaseRoleToUser(caseId, 'DEFENDANT', config.defendantCitizenUser);
    await addUserCaseMapping(caseId, config.defendantCitizenUser);
  },
};

// Functions

const assertValidDataSpec = async (data, pageId) => {
  console.log(`asserting page: ${pageId} has valid data`);

  const userData = data.userInput[pageId];
  caseData = update(caseData, userData);
  const response = await apiRequest.validatePage(
    eventName,
    pageId,
    caseData,
    caseId,
  );
  let responseBody = await response.json();

  assert.equal(response.status, 200);

  if (data.midEventData && data.midEventData[pageId]) {
    checkExpected(responseBody.data, data.midEventData[pageId]);
  }

  if (data.midEventGeneratedData && data.midEventGeneratedData[pageId]) {
    checkGenerated(responseBody.data, data.midEventGeneratedData[pageId]);
  }

  caseData = update(caseData, responseBody.data);
};

async function updateCaseDataWithPlaceholders(data, document) {
  const placeholders = {
    TEST_DOCUMENT_URL: document.document_url,
    TEST_DOCUMENT_BINARY_URL: document.document_binary_url,
    TEST_DOCUMENT_FILENAME: document.document_filename,
  };

  data = lodash.template(JSON.stringify(data))(placeholders);

  return JSON.parse(data);
}

function update(currentObject, modifications) {
  const modified = {...currentObject};
  for (const key in modifications) {
    if (currentObject[key] && typeof currentObject[key] === 'object') {
      if (Array.isArray(currentObject[key])) {
        modified[key] = modifications[key];
      } else {
        modified[key] = update(currentObject[key], modifications[key]);
      }
    } else {
      modified[key] = modifications[key];
    }
  }
  return modified;
}

function checkExpected(responseBodyData, expected, prefix = '') {
  if (!(responseBodyData) && expected) {
    if (expected) {
      assert.fail('Response' + prefix ? '[' + prefix + ']' : '' + ' is empty but it was expected to be ' + expected);
    } else {
      // null and undefined may reach this point bc typeof null is object
      return;
    }
  }
  for (const key in expected) {
    if (Object.prototype.hasOwnProperty.call(expected, key)) {
      if (typeof expected[key] === 'object') {
        checkExpected(responseBodyData[key], expected[key], key + '.');
      } else {
        assert.equal(responseBodyData[key], expected[key], prefix + key + ': expected ' + expected[key]
          + ' but actual ' + responseBodyData[key]);
      }
    }
  }
}

function checkGenerated(responseBodyData, generated, prefix = '') {
  if (!(responseBodyData)) {
    assert.fail('Response' + prefix ? '[' + prefix + ']' : '' + ' is empty but it was not expected to be');
  }
  for (const key in generated) {
    if (Object.prototype.hasOwnProperty.call(generated, key)) {
      const checkType = function (type) {
        if (type === 'array') {
          assert.isTrue(Array.isArray(responseBodyData[key]),
            'responseBody[' + prefix + key + '] was expected to be an array');
        } else {
          assert.equal(typeof responseBodyData[key], type,
            'responseBody[' + prefix + key + '] was expected to be of type ' + type);
        }
      };
      const checkFunction = function (theFunction) {
        assert.isTrue(theFunction.call(responseBodyData[key], responseBodyData[key]),
          'responseBody[' + prefix + key + '] does not satisfy the condition it should');
      };
      if (typeof generated[key] === 'string') {
        checkType(generated[key]);
      } else if (typeof generated[key] === 'function') {
        checkFunction(generated[key]);
      } else if (typeof generated[key] === 'object') {
        if (generated[key]['type']) {
          checkType(generated[key]['type']);
        }
        if (generated[key]['condition']) {
          checkType(generated[key]['condition']);
        }
        for (const key2 in generated[key]) {
          if (Object.prototype.hasOwnProperty.call(generated, key2) && 'condition' !== key2 && 'type' !== key2) {
            checkGenerated(responseBodyData[key2], generated[key2], key2 + '.');
          }
        }
      }
    }
  }
}

const assertSubmittedSpecEvent = async (expectedState, submittedCallbackResponseContains, hasSubmittedCallback = true) => {
  await apiRequest.startEvent(eventName, caseId);

  const response = await apiRequest.submitEvent(eventName, caseData, caseId);
  const responseBody = await response.json();
  assert.equal(response.status, 201);
  if (hasSubmittedCallback && submittedCallbackResponseContains) {
    assert.equal(responseBody.callback_response_status_code, 200);
    assert.include(responseBody.after_submit_callback_response.confirmation_header, submittedCallbackResponseContains.header);
    assert.include(responseBody.after_submit_callback_response.confirmation_body, submittedCallbackResponseContains.body);
  }
  if (eventName === 'CREATE_CLAIM_SPEC') {
    caseId = responseBody.id;
    await addUserCaseMapping(caseId, config.applicantSolicitorUser);
    console.log('Case created: ' + caseId);
  }
  await waitForFinishedBusinessProcess(caseId);
  if (expectedState) {
    assert.equal(responseBody.state, expectedState);
  }
};

const assertSubmittedGASpecEvent = async (gaCaseId, expectedState, user, submittedCallbackResponseContains, hasSubmittedCallback = true) => {
  await apiRequest.startEvent(eventName, gaCaseId, 'GENERALAPPLICATION');

  const response = await apiRequest.submitEvent(eventName, caseData, gaCaseId, 'GENERALAPPLICATION');
  const responseBody = await response.json();
  assert.equal(response.status, 201);
  if (hasSubmittedCallback && submittedCallbackResponseContains) {
    assert.equal(responseBody.callback_response_status_code, 200);
    assert.include(responseBody.after_submit_callback_response.confirmation_header, submittedCallbackResponseContains.header);
    assert.include(responseBody.after_submit_callback_response.confirmation_body, submittedCallbackResponseContains.body);
  }
  await waitForGAFinishedBusinessProcess(gaCaseId, user);
  if (expectedState) {
    assert.equal(responseBody.state, expectedState);
  }
};
// Mid event will not return case fields that were already filled in another event if they're present on currently processed event.
// This happens until these case fields are set again as a part of current event (note that this data is not removed from the case).
// Therefore these case fields need to be removed from caseData, as caseData object is used to make assertions
const deleteCaseFields = (...caseFields) => {
  caseFields.forEach(caseField => delete caseData[caseField]);
};

// eslint-disable-next-line no-unused-vars
function assertDynamicListListItemsHaveExpectedLabels(responseBody, dynamicListFieldName, midEventData) {
  const actualDynamicElementLabels = removeUuidsFromDynamicList(responseBody.data, dynamicListFieldName);
  const expectedDynamicElementLabels = removeUuidsFromDynamicList(midEventData, dynamicListFieldName);

  expect(actualDynamicElementLabels).to.deep.equalInAnyOrder(expectedDynamicElementLabels);
}

function removeUuidsFromDynamicList(data, dynamicListField) {
  const dynamicElements = data[dynamicListField].list_items;
  // eslint-disable-next-line no-unused-vars
  return dynamicElements.map(({code, ...item}) => item);
}

const assignSpecCase = async (caseId, type) => {
  if (type === 'lrvlr') {
    await assignCaseRoleToUser(caseId, 'RESPONDENTSOLICITORONE', config.defendantLRCitizenUser);
    await addUserCaseMapping(caseId, config.defendantLRCitizenUser);
  } else {
    await assignCaseRoleToUser(caseId, 'DEFENDANT', config.defendantCitizenUser);
    await addUserCaseMapping(caseId, config.defendantCitizenUser);
  }
};

const validateUploadTranslatedDoc = async (translationDocType) => {
  //transform the data
  const document = await uploadDocument();
  const uploadedDocs = uploadTranslatedDoc(document, translationDocType);
  await apiRequest.setupTokens(config.welshAdmin);
  caseData = await apiRequest.startEvent(eventName, caseId);
  for (let pageId of Object.keys(uploadedDocs.userInput)) {
    await assertValidDataSpec(uploadedDocs, pageId);
  }
};
