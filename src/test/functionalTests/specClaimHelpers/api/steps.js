const config = require('../../../config');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const breathingSpace = require('../fixtures/events/breathingSpace.js');
const mediation = require('../fixtures/events/mediation.js');
const admitAllClaimantResponse = require('../fixtures/events/admitAllClaimantResponse.js');
const partAdmitClaimantResponse = require('../fixtures/events/partAdmitClaimantResponse.js');
const rejectAllClaimantResponse = require('../fixtures/events/rejectAllClaimantResponse.js');
const createSDOReqPayload = require('../fixtures/events/createSDO.js');
const createAnAssistedOrder = require('../fixtures/events/createAnAssistedOrder');
const createATrialArrangement = require('../fixtures/events/createATrialArrangement');
const evidenceUpload = require('../fixtures/events/evidenceUpload');

chai.use(deepEqualInAnyOrder);
chai.config.truncateThreshold = 0;
const {expect, assert} = chai;

const {
  waitForFinishedBusinessProcess, checkToggleEnabled, hearingFeeUnpaid, bundleGeneration, uploadDocument,
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
const caseProgressionToHearingInitiated = require('../fixtures/events/createCaseProgressionToHearingInitiated');
const {submitEvent} = require('./apiRequest');
const idamHelper = require('./idamHelper');
const createLiPClaim = require('../fixtures/events/createLiPClaim.js');

const data = {
  CREATE_SPEC_CLAIM: (mpScenario) => claimSpecData.createClaim(mpScenario),
  CREATE_SPEC_CLAIM_SMALLTRACK: (defType) => smallClaimSpecData.createClaim(defType),
  CREATE_SPEC_CLAIMLRvLR: (mpScenario) => claimSpecDataLRvLR.createClaim(mpScenario),
  CREATE_SPEC_CLAIM_FASTTRACK: (mpScenario) => claimSpecDataFastTrack.createClaim(mpScenario),
  CREATE_SPEC_CLAIM_FASTTRACKLRvLR: (mpScenario) => claimSpecDataFastTrackLRvLR.createClaim(mpScenario),
  CREATE_LIP_CLAIM:(userId)  => createLiPClaim.createClaim(userId),
};

let caseId, eventName;
let caseData = {};
const PBAv3Toggle = 'pba-version-3-ways-to-pay';

module.exports = {

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
    await assertSubmittedSpecEvent(config.claimState.HEARING_READINESS);
    console.log('End of performEvidenceUpload()');
  },

  performTrialArrangements: async (user, caseId) => {
    console.log('This is inside performTrialArrangements() : ' + caseId);
    eventName = 'TRIAL_READINESS';
    const payload = createATrialArrangement.createATrialArrangement();
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await assertSubmittedSpecEvent(config.claimState.HEARING_READINESS);
    console.log('End of performTrialArrangements()');
  },

  performAnAssistedOrder: async (user, caseId) => {
    console.log('This is inside performAnAssistedOrder() : ' + caseId);
    eventName = 'GENERATE_DIRECTIONS_ORDER';
    const document = await uploadDocument();
    const payload = createAnAssistedOrder.createAnAssistedOrder(document);
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    console.log('End of performAnAssistedOrder()');
  },

  performCaseProgressedToHearingInitiated: async (user, caseId, hearingDate = '2023-11-10') => {
    console.log('This is inside performCaseProgressedToHearingInitiated() : ' + caseId);
    eventName = 'HEARING_SCHEDULED';
    const payload = caseProgressionToHearingInitiated.createCaseProgressionToHearingInitiated(hearingDate);
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await assertSubmittedSpecEvent(config.claimState.HEARING_READINESS);
    console.log('End of performCaseProgressedToHearingInitiated()');
  },

  performCaseProgressedToSDO: async (user, caseId, claimType) => {
    console.log('This is inside performCaseProgressedToSDO : ' + caseId);
    eventName = 'CREATE_SDO';
    const document = await uploadDocument();
    const payload = caseProgressionToSDOState.createCaseProgressionToSDOState(claimType, document);
    await apiRequest.setupTokens(user);
    caseData = payload['caseDataUpdate'];
    await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    console.log('End of performCaseProgressedToSDO()');
  },

  performCitizenResponse: async (user, caseId, claimType = 'SmallClaims') => {
    console.log('This is inside performCitizenResponse : ' + caseId);
    let eventName = 'DEFENDANT_RESPONSE_CUI';
    let payload = {};
    if (claimType === 'FastTrack') {
      console.log('FastTrack claim...');
      payload = defendantResponse.createDefendantResponse('15000');
    } else {
      console.log('SmallClaim...');
      payload = defendantResponse.createDefendantResponse('1500');
    }
    //console.log('The payload : ' + payload);
    await apiRequest.setupTokens(user);
    await apiRequest.startEventForCitizen(eventName, caseId, payload);
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of performCitizenResponse()');
  },

  createSpecifiedClaim: async (user, multipartyScenario, claimType, carmEnabled = false, defendantType) => {
    console.log(' Creating specified claim');
    eventName = 'CREATE_CLAIM_SPEC';
    caseId = null;
    caseData = {};
    let createClaimSpecData;
    if (claimType === 'FastTrack') {
      console.log('Creating FastTrack claim...');
      createClaimSpecData = data.CREATE_SPEC_CLAIM_FASTTRACK(multipartyScenario);
    } else if (claimType === 'SmallClaims' && defendantType){
      console.log('Creating small claims with defendant type...');
      createClaimSpecData = data.CREATE_SPEC_CLAIM_SMALLTRACK(defendantType);
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
    const pbaV3 = await checkToggleEnabled(PBAv3Toggle);
    console.log('Is PBAv3 toggle on?: ' + pbaV3);

    if (pbaV3) {
      await apiRequest.paymentUpdate(caseId, '/service-request-update-claim-issued',
        claimSpecData.serviceUpdateDto(caseId, 'paid'));
      console.log('Service request update sent to callback URL');
    }
    await waitForFinishedBusinessProcess(caseId);
    if (claimType !== 'pinInPost') {
      await assignSpecCase(caseId, multipartyScenario);
    }
    //await waitForFinishedBusinessProcess(caseId);

    //field is deleted in about to submit callback
    deleteCaseFields('applicantSolicitor1CheckEmail');

    if (carmEnabled) {
      console.log('carm enabled, updating submitted date');
      await addData(caseId, config.systemUpdate, (caseData) => {
        const submittedDate = new Date(2024, 4, 3);
        return {...caseData, submittedDate: submittedDate};
      });
      console.log('submitted date update to after carm date');
    }
    return caseId;
  },

  createLiPClaim: async (user) => {
    console.log(' Creating LIP claim');

    const currentDate = new Date();
    let eventName1 = 'CREATE_LIP_CLAIM';
    let eventName2 = 'CREATE_CLAIM_SPEC_AFTER_PAYMENT';
    caseId = null;

    let  userAuth = await idamHelper.accessToken(user);
    let userId = await idamHelper.userId(userAuth);

    await apiRequest.setupTokens(user);
    let payload = data.CREATE_LIP_CLAIM(userId);
    caseId = await apiRequest.startEventForLiPCitizen(eventName1, payload);
    let newPayload = {
      event: 'CREATE_CLAIM_SPEC_AFTER_PAYMENT',
      caseDataUpdate: {
        issueDate : currentDate,
        respondent1ResponseDeadline: currentDate,
      },
    };
    await apiRequest.startEventForCitizen(eventName2, caseId, newPayload);
    return caseId;
  },

  createSpecifiedClaimLRvLR: async (user, multipartyScenario, claimType) => {
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
    const pbaV3 = await checkToggleEnabled(PBAv3Toggle);
    console.log('Is PBAv3 toggle on?: ' + pbaV3);

    if (pbaV3) {
      await apiRequest.paymentUpdate(caseId, '/service-request-update-claim-issued',
        claimSpecData.serviceUpdateDto(caseId, 'paid'));
      console.log('Service request update sent to callback URL');
    }

    if (claimType !== 'pinInPost') {
      await assignSpecCase(caseId, 'lrvlr');
    }
    await waitForFinishedBusinessProcess(caseId);

    //field is deleted in about to submit callback
    deleteCaseFields('applicantSolicitor1CheckEmail');
    return caseId;
  },

  retrieveCaseData: async (user, caseId) => {
    const {case_data} = await apiRequest.fetchCaseDetails(user, caseId);
    return case_data;
  },

  createSDO: async (user, sdoSelectionType = config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsYes) => {
    let createSDOPayload;
    if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsYes) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedYesAssignToSmallClaimsYes();
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing();
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoTrialHearing) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedYesAssignToSmallClaimsNoTrialHearing();
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedNoAssignToSmallClaimsYes) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedNoAssignToSmallClaimsYes();
    } else if (sdoSelectionType === config.sdoSelectionType.judgementSumSelectedNoAssignToFastTrackYes) {
      createSDOPayload = createSDOReqPayload.judgementSumSelectedNoAssignToFastTrackYes();
    }

    eventName = createSDOPayload['event'];
    caseData = createSDOPayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(config.claimState.CASE_PROGRESSION);
    console.log('End of createSDO()');
  },

  viewAndRespondToDefence: async (user, defenceType = config.defenceType.admitAllPayBySetDate, expectedState, claimType) => {
    let responsePayload;
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
      responsePayload = claimantResponse.createClaimantIntendsToProceedResponse(claimType);
    } else if (defenceType === config.defenceType.rejectAllAlreadyPaid) {
      responsePayload = rejectAllClaimantResponse.rejectAllAlreadyPaidButClaimantWantsToProceed();
    } else if (defenceType === config.defenceType.rejectAllDisputeAll) {
      responsePayload = rejectAllClaimantResponse.rejectAllDisputeAllButClaimantWantsToProceedWithMediation();
    }
    eventName = responsePayload['event'];
    caseData = responsePayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(expectedState);
    console.log('End of viewAndRespondToDefence()');
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
    const mediationSuccessfulPayload = mediation.mediationSuccessfulPayload();
    eventName = mediationSuccessfulPayload['event'];
    caseData = mediationSuccessfulPayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(config.claimState.CASE_STAYED);
    console.log('End of mediationSuccessful()');
  },

  mediationUnsuccessful: async (user) => {
    const mediationUnsuccessfulPayload = mediation.mediationUnSuccessfulPayload();
    eventName = mediationUnsuccessfulPayload['event'];
    caseData = mediationUnsuccessfulPayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(config.claimState.JUDICIAL_REFERRAL);
    console.log('End of mediationUnsuccessful()');
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

const addData = async (caseId, user, cb) => {
  const event = 'UPDATE_CASE_DATA';
  await apiRequest.setupTokens(user);
  const startEventData = await apiRequest.startEvent(event, caseId);
  const caseData = cb(startEventData);
  return await submitEvent(event, caseData, caseId);
};

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
